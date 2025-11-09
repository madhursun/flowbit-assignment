import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to database
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* ✅ Health Check                                                            */
/* -------------------------------------------------------------------------- */
app.get("/", (_req, res) => {
  res.send("API is running ✅");
});

/* -------------------------------------------------------------------------- */
/* ✅ Stats Route                                                             */
/* -------------------------------------------------------------------------- */
app.get("/stats", async (_req, res) => {
  try {
    const totalSpend = await prisma.invoice.aggregate({
      _sum: { total_amount: true },
    });
    const totalInvoices = await prisma.invoice.count();
    const avgInvoice = await prisma.invoice.aggregate({
      _avg: { total_amount: true },
    });

    res.json({
      totalSpend: totalSpend._sum.total_amount ?? 0,
      totalInvoices,
      avgInvoiceValue: avgInvoice._avg.total_amount ?? 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ Invoices Route                                                          */
/* -------------------------------------------------------------------------- */
app.get("/invoices", async (req, res) => {
  try {
    const { q } = req.query;

    const where = q
      ? {
          OR: [
            { invoice_id: { contains: String(q), mode: "insensitive" } },
            { vendor: { name: { contains: String(q), mode: "insensitive" } } },
            {
              customer: { name: { contains: String(q), mode: "insensitive" } },
            },
          ],
        }
      : {};

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        vendor: true,
        customer: true,
      },
      orderBy: { date: "desc" },
      take: 50,
    });

    res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ Top Vendors Route                                                      */
/* -------------------------------------------------------------------------- */
app.get("/vendors/top10", async (_req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        invoices: { select: { total_amount: true } },
      },
    });

    const vendorSpend = vendors.map((v) => ({
      name: v.name,
      totalSpend: v.invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
    }));

    const top10 = vendorSpend
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);
    res.json(top10);
  } catch (error) {
    console.error("Error fetching top vendors:", error);
    res.status(500).json({ error: "Failed to fetch top vendors" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ Invoice Trends Route                                                   */
/* -------------------------------------------------------------------------- */
app.get("/invoice-trends", async (_req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      select: { date: true, total_amount: true },
    });

    const grouped: Record<string, number> = {};

    invoices.forEach((inv) => {
      if (!inv.date) return;
      const key = `${inv.date.getFullYear()}-${String(
        inv.date.getMonth() + 1
      ).padStart(2, "0")}`;
      grouped[key] = (grouped[key] || 0) + inv.total_amount;
    });

    const result = Object.entries(grouped).map(([month, total]) => ({
      month,
      total,
    }));
    result.sort((a, b) => (a.month > b.month ? 1 : -1));

    res.json(result);
  } catch (error) {
    console.error("Error fetching invoice trends:", error);
    res.status(500).json({ error: "Failed to fetch invoice trends" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ Category Spend Route                                                  */
/* -------------------------------------------------------------------------- */
app.get("/category-spend", async (_req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      select: { status: true, total_amount: true },
    });

    const grouped: Record<string, number> = {};
    invoices.forEach((inv) => {
      const cat = inv.status || "Other";
      grouped[cat] = (grouped[cat] || 0) + inv.total_amount;
    });

    const result = Object.entries(grouped).map(([category, total]) => ({
      category,
      total,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching category spend:", error);
    res.status(500).json({ error: "Failed to fetch category spend" });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ Cash Outflow Route                                                    */
/* -------------------------------------------------------------------------- */
app.get("/cash-outflow", async (_req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      select: { paid_at: true, amount: true },
    });

    const grouped: Record<string, number> = {};

    payments.forEach((p) => {
      if (!p.paid_at) return;
      const dateKey = p.paid_at.toISOString().split("T")[0];
      grouped[dateKey] = (grouped[dateKey] || 0) + p.amount;
    });

    const result = Object.entries(grouped).map(([date, total]) => ({
      date,
      total,
    }));
    result.sort((a, b) => (a.date > b.date ? 1 : -1));

    res.json(result);
  } catch (error) {
    console.error("Error fetching cash outflow:", error);
    res.status(500).json({ error: "Failed to fetch cash outflow" });
  }
});

app.post("/chat-with-data", async (req, res) => {
  const { question } = req.body;

  if (!question || question.trim() === "") {
    return res.status(400).json({ error: "Question is required." });
  }

  try {
    const response = await axios.post(
      `${process.env.VANNA_API_BASE_URL}/query`,
      {
        question,
      }
    );

    res.json({
      question,
      sql: response.data.sql,
      results: response.data.results,
      error: response.data.error,
    });
  } catch (err: any) {
    console.error("Error communicating with Vanna AI:", err.message);
    res.status(500).json({ error: "Failed to connect to Vanna AI service." });
  }
});

/* -------------------------------------------------------------------------- */
/* ✅ Start Server                                                          */
/* -------------------------------------------------------------------------- */
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ API running on http://localhost:${port}`);
});
