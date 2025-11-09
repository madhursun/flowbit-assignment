@echo off
title 🚀 Flowbit Full Stack Launcher
color 0A

echo.
echo ============================================
echo   🚀 Starting Flowbit Full Stack App
echo ============================================
echo.

:: ---------- Step 1: Start PostgreSQL ----------
echo 🐘 Starting PostgreSQL container...
docker start assi-db >nul 2>&1

IF %ERRORLEVEL% NEQ 0 (
    echo 🧱 No existing container found. Creating a new PostgreSQL instance...
    docker run -d --name assi-db -p 5432:5432 ^
    -e POSTGRES_USER=assiuser ^
    -e POSTGRES_PASSWORD=assipass ^
    -e POSTGRES_DB=assidb ^
    postgres:15 >nul
)

echo ✅ PostgreSQL running on port 5432
echo.

:: ---------- Step 2: Wait and Seed Database ----------
echo 🌱 Waiting for DB to initialize...
timeout /t 8 >nul

echo 🌱 Seeding database with sample data...
cd apps\api
npx tsx prisma/seed.ts
cd ../..

echo ✅ Database seeded successfully!
echo.

:: ---------- Step 3: Start Vanna AI ----------
echo 🧠 Launching Vanna AI (FastAPI + Groq)...
start "Vanna AI" cmd /k "cd services\vanna && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
echo ✅ Vanna AI running at http://localhost:8000
echo.

:: ---------- Step 4: Start Backend API ----------
echo ⚙️ Launching Node.js Backend (Express + Prisma)...
start "Backend API" cmd /k "cd apps\api && npm run dev"
echo ✅ API running at http://localhost:4000
echo.

:: ---------- Step 5: Start Frontend ----------
echo 💻 Launching Frontend (Next.js)...
start "Frontend" cmd /k "cd apps\web && npm run dev"
echo ✅ Frontend running at http://localhost:3000
echo.

echo ============================================
echo   ✅ All Systems Running Successfully!
echo   🌐 Open your browser at http://localhost:3000
echo ============================================

pause
