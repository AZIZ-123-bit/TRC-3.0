from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import json
import sqlite3
from datetime import datetime
from chat_engine import ChatEngine
from maps_engine import MapsEngine

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "label_encoder.pkl")
FEATURES_PATH = os.path.join(BASE_DIR, "features.pkl")
DB_PATH = os.path.join(BASE_DIR, "campusai.db")
DATASET_PATH = os.path.join(BASE_DIR, "must_students.csv")

model = None
label_encoder = None
feature_names = None
chat_engine = ChatEngine()
maps_engine = MapsEngine()

# ── DATABASE SETUP ────────────────────────────────────────────
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS checkins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_email TEXT NOT NULL,
            student_name TEXT DEFAULT 'Aziz Ben Ali',
            mood_score REAL,
            stress_level REAL,
            anxiety_level REAL,
            sleep_hours REAL,
            study_hours_per_day REAL,
            missed_classes REAL,
            social_activity REAL,
            physical_activity_days REAL,
            gpa REAL,
            financial_stress REAL,
            family_support REAL,
            asked_for_help INTEGER DEFAULT 0,
            commute_minutes REAL,
            wellbeing_score REAL,
            risk_label TEXT,
            confidence REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT,
            faculty TEXT DEFAULT 'Computer Science',
            year INTEGER DEFAULT 2,
            points INTEGER DEFAULT 450,
            streak INTEGER DEFAULT 7,
            tier TEXT DEFAULT 'Silver',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_email TEXT NOT NULL,
            message TEXT NOT NULL,
            role TEXT NOT NULL,
            intent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            description TEXT,
            priority TEXT DEFAULT 'medium',
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Seed default user if not exists
    c.execute('''
        INSERT OR IGNORE INTO users (email, name, faculty, year, points, streak, tier)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', ('aziz@must.tn', 'Aziz Ben Ali', 'Computer Science', 2, 450, 7, 'Silver'))

    conn.commit()
    conn.close()
    print("[DB] SQLite database initialized at", DB_PATH)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ── MODEL LOADING ─────────────────────────────────────────────
def load_model():
    global model, label_encoder, feature_names
    try:
        model = joblib.load(MODEL_PATH)
        label_encoder = joblib.load(ENCODER_PATH)
        feature_names = joblib.load(FEATURES_PATH)
        print(f"[ML] Model loaded — {len(feature_names)} features")
    except Exception as e:
        print(f"[ML] Could not load model: {e}. Run train_model.py first.")

# ── ROUTES ────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def health():
    db_ok = os.path.exists(DB_PATH)
    model_ok = model is not None
    return jsonify({
        "status": "ok",
        "service": "CampusAI Companion API",
        "version": "3.1.0",
        "university": "MUST University",
        "database": "connected" if db_ok else "not initialized",
        "ml_model": "loaded" if model_ok else "not loaded",
        "timestamp": datetime.now().isoformat()
    })

@app.route("/stats", methods=["GET"])
def get_stats():
    try:
        conn = get_db()
        c = conn.cursor()

        # Try DB checkins first, fall back to CSV dataset
        c.execute("SELECT COUNT(*) as cnt FROM checkins")
        checkin_count = c.fetchone()["cnt"]

        if checkin_count > 0:
            c.execute('''
                SELECT
                    COUNT(*) as total,
                    ROUND(AVG(mood_score), 1) as avg_mood,
                    ROUND(AVG(sleep_hours), 1) as avg_sleep,
                    ROUND(AVG(wellbeing_score), 1) as avg_wellbeing,
                    SUM(CASE WHEN risk_label = 'Healthy' THEN 1 ELSE 0 END) as healthy,
                    SUM(CASE WHEN risk_label = 'Moderate Risk' THEN 1 ELSE 0 END) as moderate,
                    SUM(CASE WHEN risk_label = 'High Risk' THEN 1 ELSE 0 END) as high_risk
                FROM checkins
            ''')
            row = c.fetchone()
            conn.close()
            return jsonify({
                "total_students": row["total"],
                "avg_mood": row["avg_mood"] or 7.1,
                "avg_sleep": row["avg_sleep"] or 6.7,
                "avg_wellbeing": row["avg_wellbeing"] or 72,
                "risk_distribution": {
                    "Healthy": row["healthy"] or 0,
                    "Moderate Risk": row["moderate"] or 0,
                    "High Risk": row["high_risk"] or 0
                },
                "source": "live_checkins"
            })

        conn.close()

        # Fall back to CSV dataset
        if os.path.exists(DATASET_PATH):
            df = pd.read_csv(DATASET_PATH)
            risk_counts = df["risk_label"].value_counts().to_dict()
            return jsonify({
                "total_students": len(df),
                "avg_mood": round(float(df["mood_score"].mean()), 1),
                "avg_sleep": round(float(df["sleep_hours"].mean()), 1),
                "avg_wellbeing": round(float(df["wellbeing_score"].mean()), 1),
                "avg_gpa": round(float(df["gpa"].mean()), 2),
                "risk_distribution": risk_counts,
                "source": "training_dataset"
            })

        return jsonify({
            "total_students": 600,
            "avg_mood": 7.1,
            "avg_sleep": 6.7,
            "avg_wellbeing": 72,
            "avg_gpa": 2.75,
            "risk_distribution": {"Healthy": 160, "Moderate Risk": 299, "High Risk": 141},
            "source": "defaults"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        if model is None or label_encoder is None or feature_names is None:
            # Fallback scoring when model not loaded
            score = _fallback_score(data)
            label = "Healthy" if score >= 62 else "Moderate Risk" if score >= 35 else "High Risk"
            return jsonify({
                "risk_label": label,
                "wellbeing_score": score,
                "confidence": 75.0,
                "recommendations": _get_recommendations(label, data),
                "message": _get_message(label)
            })

        # Build feature vector
        features = []
        for feat in feature_names:
            val = data.get(feat, 0)
            features.append(float(val))

        X = np.array(features).reshape(1, -1)
        pred_encoded = model.predict(X)[0]
        pred_label = label_encoder.inverse_transform([pred_encoded])[0]
        pred_proba = model.predict_proba(X)[0]
        confidence = round(float(max(pred_proba)) * 100, 1)

        # Compute wellbeing score
        mood = float(data.get("mood_score", 5))
        stress = float(data.get("stress_level", 5))
        sleep = float(data.get("sleep_hours", 7))
        missed = float(data.get("missed_classes", 2))
        wellbeing = max(0, min(100, round(mood * 10 + (10 - stress) * 8 + sleep * 4 - missed * 2 + 22)))

        # Save to DB
        email = data.get("email", "aziz@must.tn")
        conn = get_db()
        c = conn.cursor()
        c.execute('''
            INSERT INTO checkins (
                student_email, mood_score, stress_level, anxiety_level,
                sleep_hours, study_hours_per_day, missed_classes,
                social_activity, physical_activity_days, gpa,
                financial_stress, family_support, asked_for_help,
                commute_minutes, wellbeing_score, risk_label, confidence
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ''', (
            email,
            data.get("mood_score", 5), data.get("stress_level", 5),
            data.get("anxiety_level", 5), data.get("sleep_hours", 7),
            data.get("study_hours_per_day", 4), data.get("missed_classes", 2),
            data.get("social_activity", 3), data.get("physical_activity_days", 3),
            data.get("gpa", 3.0), data.get("financial_stress", 2),
            data.get("family_support", 4), data.get("asked_for_help", 0),
            data.get("commute_minutes", 30), wellbeing, pred_label, confidence
        ))

        # Update user points (+10) and streak
        c.execute('''
            UPDATE users SET points = points + 10, streak = streak + 1, last_login = CURRENT_TIMESTAMP
            WHERE email = ?
        ''', (email,))

        conn.commit()
        conn.close()

        return jsonify({
            "risk_label": pred_label,
            "wellbeing_score": wellbeing,
            "confidence": confidence,
            "recommendations": _get_recommendations(pred_label, data),
            "message": _get_message(pred_label)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/checkin/history", methods=["GET"])
def checkin_history():
    try:
        email = request.args.get("email", "aziz@must.tn")
        limit = int(request.args.get("limit", 10))
        conn = get_db()
        c = conn.cursor()
        c.execute('''
            SELECT mood_score, stress_level, sleep_hours, wellbeing_score,
                   risk_label, created_at
            FROM checkins WHERE student_email = ?
            ORDER BY created_at DESC LIMIT ?
        ''', (email, limit))
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        return jsonify({"history": rows, "count": len(rows)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        messages = data.get("messages", [])
        api_key = data.get("api_key", "")
        email = data.get("email", "aziz@must.tn")

        user_message = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
                break

        # Save user message to DB
        if user_message:
            conn = get_db()
            c = conn.cursor()
            c.execute('''
                INSERT INTO chat_sessions (student_email, message, role, intent)
                VALUES (?, ?, ?, ?)
            ''', (email, user_message, "user", chat_engine.classify_intent(user_message)))
            # +5 pts for chat
            c.execute('UPDATE users SET points = points + 5 WHERE email = ?', (email,))
            conn.commit()
            conn.close()

        response = chat_engine.get_response(messages, api_key)

        # Save AI response to DB
        conn = get_db()
        c = conn.cursor()
        c.execute('''
            INSERT INTO chat_sessions (student_email, message, role)
            VALUES (?, ?, ?)
        ''', (email, response.get("reply", ""), "assistant"))
        conn.commit()
        conn.close()

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e), "reply": "I'm here for you. Try again in a moment."}), 500

@app.route("/user", methods=["GET"])
def get_user():
    try:
        email = request.args.get("email", "aziz@must.tn")
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = c.fetchone()
        if not row:
            conn.close()
            return jsonify({"error": "User not found"}), 404
        user = dict(row)

        # Get checkin count
        c.execute("SELECT COUNT(*) as cnt FROM checkins WHERE student_email = ?", (email,))
        user["checkin_count"] = c.fetchone()["cnt"]

        # Get chat count
        c.execute("SELECT COUNT(*) as cnt FROM chat_sessions WHERE student_email = ? AND role = 'user'", (email,))
        user["chat_count"] = c.fetchone()["cnt"]

        # Update tier based on points
        pts = user["points"]
        if pts >= 2000:
            tier = "Diamond"
        elif pts >= 1000:
            tier = "Gold"
        elif pts >= 400:
            tier = "Silver"
        else:
            tier = "Bronze"
        c.execute("UPDATE users SET tier = ? WHERE email = ?", (tier, email))
        conn.commit()
        user["tier"] = tier

        conn.close()
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/complaint", methods=["POST"])
def submit_complaint():
    try:
        data = request.get_json()
        category = data.get("category", "General")
        description = data.get("description", "")
        email = data.get("email", "anonymous")

        priority = "high" if any(w in description.lower() for w in ["urgent", "emergency", "crisis", "immediately"]) else "medium"

        conn = get_db()
        c = conn.cursor()
        c.execute('''
            INSERT INTO complaints (category, description, priority)
            VALUES (?, ?, ?)
        ''', (category, description, priority))

        # +15 pts for reporting
        c.execute("UPDATE users SET points = points + 15 WHERE email = ?", (email,))
        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Your report has been submitted anonymously.",
            "priority": priority,
            "points_earned": 15
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/green-spaces", methods=["GET"])
def green_spaces():
    try:
        lat = float(request.args.get("lat", 35.8256))
        lon = float(request.args.get("lon", 10.6369))
        spaces = maps_engine.get_nearby_spaces(lat, lon)
        prescription = maps_engine.get_nature_prescription(lat, lon)
        return jsonify({
            "spaces": spaces,
            "prescription": prescription,
            "your_location": {"lat": lat, "lon": lon}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/resources", methods=["GET"])
def get_resources():
    return jsonify({
        "resources": [
            {"name": "MUST Counseling Center", "email": "counseling@must.tn", "hours": "Sun–Thu 8AM–4PM", "type": "mental_health", "color": "#8FAF8B"},
            {"name": "Financial Aid Office",   "email": "financial@must.tn",  "hours": "Sun–Thu 9AM–3PM", "type": "financial",    "color": "#A7D3F2"},
            {"name": "Academic Tutoring",      "email": "tutoring@must.tn",   "hours": "Sun–Thu 9AM–6PM", "type": "academic",     "color": "#C8A96E"},
            {"name": "Peer Support Network",   "email": "peers@must.tn",      "hours": "Daily 6PM–9PM",   "type": "social",       "color": "#6FAF7A"},
            {"name": "Student Affairs",        "email": "affairs@must.tn",    "hours": "Sun–Thu 8AM–5PM", "type": "general",      "color": "#9EB09A"},
        ]
    })

# ── HELPERS ───────────────────────────────────────────────────
def _fallback_score(data):
    mood    = float(data.get("mood_score", 5))
    stress  = float(data.get("stress_level", 5))
    sleep   = float(data.get("sleep_hours", 7))
    missed  = float(data.get("missed_classes", 2))
    return max(0, min(100, round(mood * 10 + (10 - stress) * 8 + sleep * 4 - missed * 2 + 22)))

def _get_message(label):
    messages = {
        "Healthy":       "Great work, Aziz! Your well-being indicators look solid. Keep the habits going.",
        "Moderate Risk": "You're managing, but there are signs of strain. Small consistent changes make a big difference.",
        "High Risk":     "Your scores suggest you need support right now. Please reach out to MUST Counseling — it's free and confidential."
    }
    return messages.get(label, "Check-in complete.")

def _get_recommendations(label, data):
    recs = []
    sleep = float(data.get("sleep_hours", 7))
    stress = float(data.get("stress_level", 5))
    missed = float(data.get("missed_classes", 2))
    financial = float(data.get("financial_stress", 2))

    if sleep < 6:
        recs.append({"title": "Prioritize sleep — aim for 7–9 hours", "tag": "Sleep", "color": "#A7D3F2"})
    if stress > 7:
        recs.append({"title": "Try box breathing: 4-4-4-4 counts", "tag": "Stress Relief", "color": "#8FAF8B"})
    if missed > 3:
        recs.append({"title": "Reconnect with your academic schedule", "tag": "Academic", "color": "#C8A96E"})
    if financial > 6:
        recs.append({"title": "Contact Financial Aid: financial@must.tn", "tag": "Financial", "color": "#A7D3F2"})
    if label == "High Risk":
        recs.append({"title": "MUST Counseling: counseling@must.tn", "tag": "Support", "color": "#D96060"})

    if not recs:
        recs.append({"title": "Take a 20-min walk in nature today", "tag": "Well-being", "color": "#6FAF7A"})
    return recs[:3]

# ── MAIN ──────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    load_model()
    print("[SERVER] CampusAI API running on http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
