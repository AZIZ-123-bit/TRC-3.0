#!/bin/bash
# CampusAI Companion — One-command setup
# TechResolve Challenge 3.0 · MUST University · Team Dank You

echo "=============================="
echo " CampusAI Companion v3.1"
echo " MUST University · TRC 3.0"
echo "=============================="

echo "[1/5] Installing Python dependencies..."
cd backend
pip install -r requirements.txt

echo "[2/5] Generating dataset (600 MUST students)..."
python generate_dataset.py

echo "[3/5] Training ML model..."
python train_model.py

echo "[4/5] Starting Flask backend (creates SQLite DB on first run)..."
python app_v3.py &
BACKEND_PID=$!
sleep 2

echo "[5/5] Starting React frontend..."
cd ../frontend
npm install --silent
npm start &

echo ""
echo "=============================="
echo " App:  http://localhost:3000"
echo " API:  http://localhost:5000"
echo " DB:   backend/campusai.db"
echo " Login: aziz@must.tn"
echo "=============================="
echo " Press Ctrl+C to stop"
wait $BACKEND_PID
