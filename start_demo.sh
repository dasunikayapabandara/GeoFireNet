#!/bin/bash

echo "🔥 Starting GeoFireNet Demo System..."

# 1. Start Backend in Background
echo " [1/2] Launching Backend API (Port 8000)..."
cd backend
# Install lightweight dependencies if needed (fast check)
# pip install -r requirements.txt > /dev/null 2>&1 
python3 main.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "       Backend running (PID: $BACKEND_PID). Logs in backend.log"

# 2. Start Frontend in Background
echo " [2/2] Launching Dashboard (Port 5173)..."
cd dashboard
# npm install > /dev/null 2>&1
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "       Frontend running (PID: $FRONTEND_PID). Logs in frontend.log"

echo ""
echo "✅ SYSTEM READY!"
echo "   -> Dashboard: http://localhost:5173"
echo "   -> API Docs:  http://localhost:8000/docs"
echo ""
echo "Press [ENTER] to stop the demo..."
read

# Cleanup
echo "🛑 Stopping services..."
kill $BACKEND_PID
kill $FRONTEND_PID
echo "Done."
