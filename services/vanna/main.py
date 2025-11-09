from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import psycopg2, os, re
from dotenv import load_dotenv

# --- Load environment variables ---
load_dotenv()

# --- Initialize FastAPI ---
app = FastAPI(
    title="Vanna AI Server",
    version="2.0.0",
    description="Natural language to SQL engine for Flowbit AI (Groq-powered)."
)

# --- Enable CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PostgreSQL Connection ---
DB_URL = os.getenv("DATABASE_URL")
try:
    conn = psycopg2.connect(DB_URL)
    print("✅ Connected to PostgreSQL database")
except Exception as e:
    print("❌ Failed to connect to database:", e)

# --- Initialize Groq client ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)

# --- Root endpoint ---
@app.get("/")
async def root():
    return {"status": "Vanna AI Server running (Groq Safe Mode)"}

# --- Helper: detect meaningless input ---
def is_random_text(text: str) -> bool:
    # Very short, no verbs/nouns, or gibberish pattern
    if len(text.strip()) < 4:
        return True
    gibberish = re.compile(r"^[^a-zA-Z0-9]+$")
    if gibberish.match(text.strip()):
        return True
    if not re.search(r"[a-zA-Z]", text):
        return True
    if len(text.split()) <= 1 and not any(c.isdigit() for c in text):
        return True
    return False

# --- Query Endpoint ---
@app.post("/query")
async def query(request: Request):
    body = await request.json()
    question = body.get("question", "")
    if not question:
        return {"error": "Please enter a question."}

    # 🧠 Detect random or irrelevant input early
    if is_random_text(question):
        return {
            "error": "I'm here to help with data-related questions like spend, vendors, or invoices — please ask something like 'Show total spend by vendor'."
        }

    # --- Step 1: Ask Groq to generate SQL ---
    try:
        prompt = f"""
You are an expert data analyst who writes safe, valid SQL for PostgreSQL.

Schema overview:
- "Invoice" ("id", "vendorId", "customerId", "date", "total_amount", "status")
- "Vendor" ("id", "name", "address")
- "Payment" ("id", "invoiceId", "amount", "paid_at")

Rules:
1. Output ONLY SQL (no text, markdown, or commentary).
2. Always use double quotes for table and column names.
3. Generate only SELECT queries.
4. If the question doesn't make sense for this database, respond with: "UNRELATED".
Question: "{question}"
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful SQL assistant for business analytics."},
                {"role": "user", "content": prompt},
            ],
        )

        sql_query = response.choices[0].message.content.strip()
        sql_query = re.sub(r"^```[a-zA-Z]*", "", sql_query)
        sql_query = re.sub(r"```$", "", sql_query)
        sql_query = sql_query.strip()

        # If the model replied "UNRELATED" or nonsense, handle it nicely
        if "UNRELATED" in sql_query or len(sql_query) < 10:
            return {
                "error": "I couldn’t find a relevant query for that. Try asking about invoices, vendors, or spending."
            }

    except Exception as e:
        return {"error": f"SQL generation failed: {e}"}

    # --- Step 2: Validate SQL for safety ---
    forbidden = ["drop", "delete", "update", "insert", "alter", "truncate"]
    if any(word in sql_query.lower() for word in forbidden):
        return {"error": "Blocked unsafe SQL command.", "sql": sql_query}

    if not re.match(r"(?i)^\s*select\b", sql_query):
        return {"error": "Only SELECT queries are allowed.", "sql": sql_query}

    # --- Step 3: Execute the SQL safely ---
    try:
        with psycopg2.connect(DB_URL) as temp_conn:
            with temp_conn.cursor() as cur:
                cur.execute(sql_query)
                columns = [desc[0] for desc in cur.description]
                results = [dict(zip(columns, row)) for row in cur.fetchall()]
    except Exception as e:
        return {"error": str(e), "sql": sql_query}

    # ✅ Successful response
    if not results:
        return {
            "sql": sql_query,
            "results": [],
            "message": "Query executed successfully, but returned no results.",
        }

    return {"sql": sql_query, "results": results}
