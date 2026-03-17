# CampusAI Companion
## TechResolve Challenge 3.0 · MUST University · Team Dank You
**Aziz · Wassim · Shahin**

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