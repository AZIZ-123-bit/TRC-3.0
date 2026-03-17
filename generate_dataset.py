import pandas as pd
import numpy as np
import os

np.random.seed(42)
N = 600

def generate_must_students(n=600):
    data = {
        "student_id":            [f"MUST{str(i+1001).zfill(4)}" for i in range(n)],
        "faculty":               np.random.choice(["Computer Science","Engineering","Business","Architecture","Science"], n, p=[0.30,0.25,0.20,0.12,0.13]),
        "year":                  np.random.randint(1, 6, n),
        "age":                   np.random.randint(18, 27, n),
        "gender":                np.random.choice(["Male","Female"], n, p=[0.52,0.48]),
        "mood_score":            np.clip(np.random.normal(6.5, 2.0, n), 1, 10).round(1),
        "stress_level":          np.clip(np.random.normal(6.0, 2.2, n), 1, 10).round(1),
        "anxiety_level":         np.clip(np.random.normal(5.5, 2.3, n), 1, 10).round(1),
        "sleep_hours":           np.clip(np.random.normal(6.5, 1.4, n), 3, 10).round(1),
        "study_hours_per_day":   np.clip(np.random.normal(5.0, 2.0, n), 0, 12).round(1),
        "missed_classes":        np.clip(np.random.exponential(2.5, n), 0, 20).astype(int),
        "gpa":                   np.clip(np.random.normal(2.9, 0.6, n), 0, 4).round(2),
        "social_activity":       np.clip(np.random.normal(4.5, 2.5, n), 1, 10).round(1),
        "physical_activity_days":np.clip(np.random.normal(3.0, 1.8, n), 0, 7).round(0).astype(int),
        "financial_stress":      np.clip(np.random.normal(5.0, 2.5, n), 1, 10).round(1),
        "family_support":        np.clip(np.random.normal(6.0, 2.2, n), 1, 10).round(1),
        "commute_minutes":       np.clip(np.random.exponential(25, n), 5, 120).astype(int),
        "asked_for_help":        np.random.choice([0, 1], n, p=[0.72, 0.28]),
        "has_scholarship":       np.random.choice([0, 1], n, p=[0.65, 0.35]),
        "lives_alone":           np.random.choice([0, 1], n, p=[0.70, 0.30]),
    }

    df = pd.DataFrame(data)

    # Wellbeing score — weighted formula
    df["wellbeing_score"] = (
        df["mood_score"]           * 12 +
        (10 - df["stress_level"])  * 10 +
        (10 - df["anxiety_level"]) *  8 +
        df["sleep_hours"]          *  5 +
        df["social_activity"]      *  4 +
        df["family_support"]       *  4 +
        df["physical_activity_days"] * 3 +
        (4 - df["gpa"].clip(0,4).rsub(4)) * 2 +  # lower GPA gap = better
        (10 - df["financial_stress"]) * 3 +
        df["study_hours_per_day"].clip(0,8) * 1.5 -
        df["missed_classes"]       * 2 -
        df["commute_minutes"] / 20
    )
    min_s = df["wellbeing_score"].min()
    max_s = df["wellbeing_score"].max()
    df["wellbeing_score"] = ((df["wellbeing_score"] - min_s) / (max_s - min_s) * 80 + 20).round(1)

    # Risk labels
    def label(score):
        if score >= 62: return "Healthy"
        if score >= 38: return "Moderate Risk"
        return "High Risk"
    df["risk_label"] = df["wellbeing_score"].apply(label)

    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "must_students.csv")
    df.to_csv(out, index=False)

    print(f"[DATA] Generated {n} students → {out}")
    print(f"[DATA] Healthy: {(df['risk_label']=='Healthy').sum()} | Moderate: {(df['risk_label']=='Moderate Risk').sum()} | High Risk: {(df['risk_label']=='High Risk').sum()}")
    print(f"[DATA] Avg wellbeing: {df['wellbeing_score'].mean():.1f} | Avg GPA: {df['gpa'].mean():.2f}")
    return df

if __name__ == "__main__":
    generate_must_students()
