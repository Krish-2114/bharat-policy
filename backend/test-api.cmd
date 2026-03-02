@echo off
setlocal
set BASE=http://localhost:8000

echo If API is not running, start it first:
echo   cd infra ^&^& docker compose up -d
echo.

echo --- POST /query ---
curl -s -X POST %BASE%/query -H "Content-Type: application/json" -d "{\"query\": \"refund policy\"}"
echo.
echo.

echo --- POST /ask ---
curl -s -X POST %BASE%/ask -H "Content-Type: application/json" -d "{\"question\": \"What is the refund policy?\"}"
echo.
echo.

echo Done.
