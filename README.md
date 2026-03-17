# CampusAI Companion
## TechResolve Challenge 3.0 · MUST University · Team Dank You
**Aziz Ben Ali · Wassim · Shahin**

---

## What's new in this version
- **SQLite database** — every check-in, chat, and user is now persisted
- **Live user data** — points, streak, tier all update in real time from DB
- **Dynamic rewards** — progress bars reflect actual points stored in DB
- **Dynamic ring chart** — wellbeing score pulled from real check-in history
- **All API endpoints** return real data from SQLite, not hardcoded values

---

## Run locally (jury demo — safest option)

### Terminal 1 — Backend
```bash
cd backend
pip install -r requirements.txt
python generate_dataset.py   # creates must_students.csv
python train_model.py        # trains model, saves model.pkl
python app_v3.py             # starts API on :5000 + creates campusai.db
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm start                    # opens localhost:3000
```

### .env (inside frontend/)
```
REACT_APP_CLAUDE_API_KEY=sk-ant-your-key-here
REACT_APP_API_URL=http://localhost:5000
```

---

## Deploy to production (15 minutes)

### Backend → Railway
1. Push repo to GitHub
2. railway.app → New Project → Deploy from GitHub
3. Set root directory: `/backend`
4. Add env: `PORT=5000`
5. Copy your Railway URL

### Frontend → Vercel
1. vercel.com → New Project → Import GitHub repo
2. Set root directory: `/frontend`
3. Add env vars:
   - `REACT_APP_CLAUDE_API_KEY=sk-ant-...`
   - `REACT_APP_API_URL=https://your-backend.up.railway.app`
4. Deploy → get your `.vercel.app` URL

---

## Architecture

```
React Frontend (port 3000)
       ↕ HTTP/JSON
Flask Backend (port 5000)
       ↕
┌──────────────────────────┐
│  SQLite (campusai.db)    │  ← check-ins, users, chats, complaints
│  Random Forest (.pkl)    │  ← 81% accuracy risk prediction
│  Claude API              │  ← smart AI chatbot
│  Maps Engine             │  ← 12 Tunisia green spaces + GPS
└──────────────────────────┘
```

## Database tables
| Table | Purpose |
|---|---|
| `users` | Student profiles, points, tier, streak |
| `checkins` | Every check-in with wellbeing score + risk label |
| `chat_sessions` | All messages for analytics |
| `complaints` | Anonymous campus reports |

## API endpoints
| Method | Route | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/stats` | Campus aggregated stats |
| POST | `/predict` | ML risk prediction + save to DB |
| GET | `/checkin/history` | Past check-ins for a student |
| POST | `/chat` | Claude AI chatbot |
| GET | `/user` | Student profile + live points |
| POST | `/complaint` | Anonymous campus report |
| GET | `/green-spaces` | GPS-based green space finder |
| GET | `/resources` | MUST campus resources |

## Jury questions — recommended answers
**"Where is data stored?"** → SQLite database at `backend/campusai.db`. Every check-in is persisted with timestamp. Production would use PostgreSQL.

**"Is this data real?"** → Synthetic dataset modelled on validated student mental health survey data. Phase 2 integrates with real MUST student surveys after ethics approval.

**"Why Random Forest?"** → Interpretability over accuracy. We can show which features (sleep, stress, GPA) drive each prediction — essential for a health app where explainability matters.

**"Business model?"** → B2B SaaS, $2/student/month. MUST has ~12,000 students = $24K MRR at full adoption. Scale: all Tunisian universities then MENA.

**"Privacy?"** → No PII in check-ins. Claude API calls are stateless. Compliant with Tunisia's INPDP framework.

---
*Built with React 18 · Flask 3 · scikit-learn · SQLite · Claude AI*
*TechResolve Challenge 3.0 · March 2026*
