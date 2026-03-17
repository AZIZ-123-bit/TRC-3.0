import re
import random

MUST_RESOURCES = {
    "counseling": {"name": "MUST Counseling Center", "email": "counseling@must.tn", "hours": "Sun–Thu 8AM–4PM", "color": "#8FAF8B"},
    "financial":  {"name": "Financial Aid Office",   "email": "financial@must.tn",  "hours": "Sun–Thu 9AM–3PM", "color": "#A7D3F2"},
    "tutoring":   {"name": "Academic Tutoring Center","email": "tutoring@must.tn",  "hours": "Sun–Thu 9AM–6PM", "color": "#C8A96E"},
    "peers":      {"name": "Peer Support Network",   "email": "peers@must.tn",      "hours": "Daily 6PM–9PM",  "color": "#6FAF7A"},
}

CRISIS_KEYWORDS = [
    "suicide","kill myself","end my life","don't want to live","not worth living",
    "self harm","hurt myself","can't go on","give up on life","no reason to live",
    "hopeless","worthless","better off dead"
]

INTENT_PATTERNS = {
    "exam_stress":    ["exam","test","quiz","final","midterm","study","coursework","assignment","deadline","grade","gpa","fail"],
    "sleep":          ["sleep","tired","fatigue","insomnia","rest","nap","exhausted","can't sleep","sleepy"],
    "anxiety":        ["anxious","anxiety","panic","nervous","worried","fear","overwhelm","pressure","tense"],
    "loneliness":     ["lone","alone","isolat","friend","social","connect","belong","no one","nobody"],
    "financial":      ["money","financial","afford","broke","scholarship","fees","rent","expense","poor"],
    "motivation":     ["motivat","lazy","procrastinat","unmotivated","stuck","can't start","no energy"],
    "focus":          ["focus","concentrate","distract","attention","phone","productive","work"],
    "burnout":        ["burnout","too much","overwhelm","balance","rest","break","exhausted","drained"],
    "depression":     ["sad","depress","down","empty","numb","crying","hopeless","meaningless","dark"],
    "relationships":  ["relationship","family","parent","friend","roommate","professor","conflict","argue"],
    "general_stress": ["stress","pressure","hard","difficult","struggling","problem","issue"],
}

SYSTEM_PROMPT = """You are CampusAI Companion, an intelligent and empathetic well-being assistant for MUST University students in Tunisia. You are talking with Aziz Ben Ali, Year 2 Computer Science student.

PERSONALITY: Smart, warm, practical. Like a knowledgeable mentor who genuinely cares. Give REAL specific advice.

STRICT RULES:
- 3-5 sentences max per response
- Give REAL SPECIFIC ACTIONABLE advice — not vague sympathy
- NEVER start with "That sounds really exhausting" more than once
- NEVER repeat the same phrasing across responses
- NEVER just ask follow-up questions without giving advice first
- Use Aziz's name occasionally (not every message)

KNOWLEDGE:
EXAM/STUDY: Pomodoro (25min/5min), active recall beats re-reading 2x, past papers under timed conditions, spaced repetition, sleep consolidates memory
SLEEP: Fix wake-up time first, no screens 1hr before bed, 7-9hrs, write tomorrow's tasks before bed, naps max 20min before 3pm
ANXIETY: Box breathing 4-4-4-4, grounding 5-4-3-2-1, 20-min walks reduce cortisol as much as mild meds
FOCUS: Phone in another room (even face-down = cognitive drain), 90-min deep work blocks, 2-minute rule, temptation bundling
LONELINESS: MUST Peer Support (daily 6PM), IEEE SB events, one genuine conversation daily
FINANCIAL: MUST Financial Aid (financial@must.tn) — emergency funds available, confidential
OVERWHELM: Brain dump on paper, identify ONE priority, MUST Counseling (counseling@must.tn)
MOTIVATION: Systems beat motivation, 2-minute rule, track micro-wins, temptation bundling
BURNOUT: Schedule rest like a class, 90-min blocks, recovery = requirement not reward"""

SMART_FALLBACKS = {
    "exam_stress": [
        "The most impactful switch you can make right now is from passive re-reading to active recall — close your notes after studying a topic and write everything you remember. It feels harder but retains 2x more. Pair this with the Pomodoro method: 25 minutes focused, 5-minute break, repeat 4 times then take 20 minutes. MUST's tutoring centre (Sun–Thu 9AM–6PM) is also there for subject-specific help.",
        "For managing multiple deadlines, time-blocking is more effective than a to-do list. Assign each subject to a specific hour in your calendar — not just 'study' but 'work on CS project for 2 hours'. This removes decision fatigue. Also: sleep is when your brain consolidates everything you studied, so cutting sleep to study more is counterproductive beyond 6 hours.",
    ],
    "sleep": [
        "The most effective sleep fix is fixing your wake-up time first — keep it consistent even on weekends, and your sleep time stabilizes naturally within a week. Stop screens 45 minutes before bed: blue light blocks melatonin significantly. If your mind races at night, Aziz, write tomorrow's task list before closing your laptop — it offloads the mental loop keeping you awake.",
    ],
    "anxiety": [
        "For acute anxiety right now, try box breathing: inhale 4 counts, hold 4, exhale 4, hold 4 — repeat 4 times. This directly activates your parasympathetic nervous system and works within 60–90 seconds. For ongoing anxiety, 20-minute daily walks reduce cortisol as effectively as mild medication for mild cases. If it's significantly affecting your daily life, MUST Counseling (counseling@must.tn) is free for students.",
    ],
    "loneliness": [
        "Loneliness on a busy campus is far more common than people admit — most students look socially fine from the outside. MUST's Peer Support Network meets daily at 6PM and is genuinely low-pressure. IEEE SB also runs regular events where connection happens naturally through shared interest. Aim for one genuine conversation daily rather than trying to fix everything at once, Aziz.",
    ],
    "financial": [
        "Financial stress on top of coursework is one of the heaviest things to carry. First and most important: email MUST's Financial Aid office at financial@must.tn — they have emergency funds for students in difficult situations and it's completely confidential. You don't have to be in crisis to reach out. Check whether you're using all available student discounts on campus too — most students don't, and they add up.",
    ],
    "motivation": [
        "Motivation is unreliable — it comes and goes. What works is systems. Try temptation bundling: only listen to your favourite music or podcast while doing the task you dislike. Your brain learns to associate the task with something positive. Also use the 2-minute rule: commit to just 2 minutes on the task. The resistance is almost always to starting, not continuing.",
    ],
    "focus": [
        "The biggest focus killer isn't willpower — it's your phone within eyesight. Studies show having a phone visible (even face-down, even off) reduces working memory measurably. Put it in another room entirely. For studying, try 90-minute deep work blocks — that matches your brain's natural ultradian rhythm. Change your study location every few days too; novelty naturally boosts alertness.",
    ],
    "burnout": [
        "Burnout happens when rest is treated as a reward for finishing work — but work never fully finishes. Schedule rest the same way you schedule classes: non-negotiable time blocks. Students who time-block recovery actually study more effectively because they start each session fresh instead of grinding at 30% capacity. Try one completely work-free hour daily and one half-day per week, Aziz.",
    ],
    "depression": [
        "What you're describing sounds heavy, and I want you to know that's real — not weakness. One small step that actually helps: get outside for even 10 minutes. Natural light and movement have measurable effects on mood chemistry. MUST's Counseling Center (counseling@must.tn) has psychologists trained specifically for this, and it's free and confidential for students. You don't have to carry this alone.",
    ],
    "general_stress": [
        "When everything feels like too much, your brain is in threat mode and can't prioritize clearly. Try this: write every stressor on paper — just the act of externalizing it reduces mental load. Then circle the ONE thing that would make the biggest difference today and do only that. Everything else can wait. MUST Counseling (counseling@must.tn) is also there if you need to talk it through.",
        "Stress at your level is real and common at MUST — especially in CS year 2 when the coursework intensity jumps. The key is not eliminating stress but building recovery: schedule one proper break for every 90 minutes of work. What specifically is stressing you most right now? The more specific you are, the more targeted advice I can give.",
    ],
}

GENERAL_FALLBACKS = [
    "I hear you, Aziz. The more specific you can be about what's going on, the more targeted advice I can give — what's the main thing on your mind right now?",
    "That's worth unpacking properly. What does this look like day-to-day for you — is it hitting you more academically, socially, or just a general heaviness?",
    "Can you tell me a bit more? I want to give you something actually useful rather than a standard answer that might not fit your specific situation.",
]

class ChatEngine:
    def classify_intent(self, message: str) -> str:
        m = message.lower()
        for intent, keywords in INTENT_PATTERNS.items():
            if any(k in m for k in keywords):
                return intent
        return "general"

    def is_crisis(self, message: str) -> bool:
        m = message.lower()
        return any(k in m for k in CRISIS_KEYWORDS)

    def get_resource_for_intent(self, intent: str):
        mapping = {
            "exam_stress":    MUST_RESOURCES["tutoring"],
            "financial":      MUST_RESOURCES["financial"],
            "loneliness":     MUST_RESOURCES["peers"],
            "depression":     MUST_RESOURCES["counseling"],
            "anxiety":        MUST_RESOURCES["counseling"],
            "burnout":        MUST_RESOURCES["counseling"],
        }
        return mapping.get(intent)

    def get_smart_fallback(self, message: str, intent: str) -> str:
        pool = SMART_FALLBACKS.get(intent) or SMART_FALLBACKS.get("general_stress") or GENERAL_FALLBACKS
        return random.choice(pool)

    def get_response(self, messages: list, api_key: str = "") -> dict:
        user_message = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                user_message = msg.get("content", "")
                break

        if not user_message:
            return {"reply": "I'm here, Aziz. What's on your mind?", "intent": "general"}

        intent = self.classify_intent(user_message)

        # Crisis detection first
        if self.is_crisis(user_message):
            return {
                "reply": "I'm really concerned about what you've shared, Aziz. Please reach out to MUST Counseling right now at counseling@must.tn or call the National Mental Health Line. You're not alone in this, and there are people trained to help.",
                "intent": "crisis",
                "suggested_resource": MUST_RESOURCES["counseling"],
                "is_crisis": True
            }

        # Try Claude API
        if api_key and api_key.startswith("sk-ant-"):
            try:
                import urllib.request
                import json
                history = [m for m in messages if m.get("role") in ("user","assistant")][-12:]
                payload = json.dumps({
                    "model": "claude-sonnet-4-6",
                    "max_tokens": 400,
                    "system": SYSTEM_PROMPT,
                    "messages": history
                }).encode()
                req = urllib.request.Request(
                    "https://api.anthropic.com/v1/messages",
                    data=payload,
                    headers={"Content-Type": "application/json", "x-api-key": api_key, "anthropic-version": "2023-06-01"}
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    data = json.loads(resp.read())
                    reply = data["content"][0]["text"]
                    resource = self.get_resource_for_intent(intent)
                    return {"reply": reply, "intent": intent, "suggested_resource": resource}
            except Exception as e:
                print(f"[CHAT] Claude API error: {e} — using smart fallback")

        # Smart local fallback
        reply = self.get_smart_fallback(user_message, intent)
        resource = self.get_resource_for_intent(intent)
        return {"reply": reply, "intent": intent, "suggested_resource": resource}
