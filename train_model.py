import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import LabelEncoder

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

FEATURES = [
    "mood_score", "stress_level", "anxiety_level", "sleep_hours",
    "study_hours_per_day", "missed_classes", "gpa", "social_activity",
    "physical_activity_days", "financial_stress", "family_support",
    "asked_for_help", "commute_minutes"
]

def train():
    csv_path = os.path.join(BASE_DIR, "must_students.csv")
    if not os.path.exists(csv_path):
        print("[TRAIN] Dataset not found. Running generate_dataset.py first...")
        from generate_dataset import generate_must_students
        generate_must_students()

    df = pd.read_csv(csv_path)
    print(f"[TRAIN] Loaded {len(df)} records, {len(FEATURES)} features")

    X = df[FEATURES].fillna(df[FEATURES].median())
    y = df["risk_label"]

    le = LabelEncoder()
    y_enc = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_enc, test_size=0.20, random_state=42, stratify=y_enc
    )

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print(f"[TRAIN] Test accuracy: {acc:.1%}")
    print(f"[TRAIN] Cross-val (5-fold): {cross_val_score(clf, X, y_enc, cv=5).mean():.1%}")
    print("\n[TRAIN] Classification report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    # Feature importance
    fi = sorted(zip(FEATURES, clf.feature_importances_), key=lambda x: -x[1])
    print("\n[TRAIN] Top 5 features:")
    for feat, imp in fi[:5]:
        print(f"  {feat:30s} {imp:.3f}")

    # Save
    joblib.dump(clf, os.path.join(BASE_DIR, "model.pkl"))
    joblib.dump(le,  os.path.join(BASE_DIR, "label_encoder.pkl"))
    joblib.dump(FEATURES, os.path.join(BASE_DIR, "features.pkl"))

    print(f"\n[TRAIN] Saved model.pkl, label_encoder.pkl, features.pkl")
    print(f"[TRAIN] Training complete — {acc:.1%} accuracy")

if __name__ == "__main__":
    train()
