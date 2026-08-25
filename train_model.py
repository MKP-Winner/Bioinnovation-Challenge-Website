"""
train_model.py
================
Trains a predictive model for neurodegenerative disease classification
(Alzheimer's Disease, ALS, Parkinson's, FTD, Lewy Body Dementia, or
Healthy Control) from genetic, demographic, and lifestyle risk factors.

IMPORTANT DESIGN CHOICE — LEAKAGE PREVENTION
----------------------------------------------
The source dataset (NDCTD-45K_cleaned.csv) contains both:
  (a) pre-clinical risk factors: demographics, lifestyle, family history,
      comorbidities, vitals, lab panels, CSF/blood biomarkers, and genes
      (APOE_e4, SNCA, LRRK2, MAPT, HTT_Expansion, C9orf72), and
  (b) clinical symptom / severity fields that are effectively a
      restatement of the diagnosis itself (MMSE_Score, CDR_Score,
      Memory_Loss, Disease_Stage, UPDRS_Score, ALSFRS_R_Score, etc).

Since the project goal is EARLY / PRE-CLINICAL risk prediction, group (b)
is deliberately excluded from the feature set below — training on it
would let the model "cheat" by reading the diagnosis off of symptoms
that only appear after diagnosis, and the resulting model would be
useless for early screening. See EXCLUDED_COLUMNS for the full list.

Run:
    python3 train_model.py --data /path/to/NDCTD-45K_cleaned.csv

Outputs (into ./model_artifacts/):
    model.joblib            - trained sklearn Pipeline (preprocessing + classifier)
    feature_schema.json     - exact input schema the API/website must send
    metrics.json            - held-out test performance
    label_classes.json      - ordered list of diagnosis classes
"""

import argparse
import json
import os

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# ---------------------------------------------------------------------------
# 1. Columns excluded as post-diagnosis / symptom leakage (see docstring)
# ---------------------------------------------------------------------------
EXCLUDED_COLUMNS = [
    "Patient_ID",
    "Diagnosis",  # target, handled separately
    # cognitive/functional test scores (post-symptom)
    "MMSE_Score", "MoCA_Score", "CDR_Score", "ADL_Score", "IADL_Score",
    "UPDRS_Score", "Hoehn_Yahr_Stage", "ALSFRS_R_Score",
    "Disease_Stage", "Disease_Severity", "Symptom_Duration_Months",
    "Medication_Count", "Hospitalizations_Last_Year",
    # symptom flags
    "Memory_Loss", "Forgetfulness", "Confusion", "Executive_Dysfunction",
    "Attention_Deficit", "Language_Impairment", "Personality_Change",
    "Mood_Changes", "Tremor", "Bradykinesia", "Rigidity",
    "Gait_Instability", "Balance_Problems", "Muscle_Weakness",
    "Muscle_Atrophy", "Speech_Difficulty", "Swallowing_Difficulty",
    "Hallucinations", "REM_Sleep_Behavior_Disorder", "Constipation",
    "Loss_of_Smell", "Fatigue",
    # exam findings (post-symptom neuro exam, not pre-clinical)
    "Reflex_Score", "Muscle_Tone", "Coordination", "Eye_Movement",
    "Cranial_Nerve_Function", "Sensory_Function", "Cognitive_Orientation",
    "Grip_Strength_kg", "Walking_Speed_ms",
]

CATEGORICAL_COLUMNS = [
    "Sex", "Education_Level", "Occupation", "Marital_Status", "Ethnicity",
    "Residence_Type", "Socioeconomic_Status", "Smoking_Status",
    "Alcohol_Consumption", "Physical_Activity_Level", "Diet_Quality",
    "Sleep_Quality", "Stress_Level", "Social_Engagement",
]

TARGET_COLUMN = "Diagnosis"


def build_feature_lists(df: pd.DataFrame):
    all_cols = [c for c in df.columns if c not in EXCLUDED_COLUMNS]
    categorical = [c for c in all_cols if c in CATEGORICAL_COLUMNS]
    numeric = [c for c in all_cols if c not in categorical]
    return numeric, categorical


def build_pipeline(numeric_cols, categorical_cols):
    numeric_pipeline = Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
    ])
    categorical_pipeline = Pipeline([
        ("impute", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore")),
    ])
    preprocessor = ColumnTransformer([
        ("num", numeric_pipeline, numeric_cols),
        ("cat", categorical_pipeline, categorical_cols),
    ])
    clf = RandomForestClassifier(
        n_estimators=400,
        max_depth=None,
        min_samples_leaf=2,
        class_weight="balanced",
        n_jobs=-1,
        random_state=42,
    )
    return Pipeline([("preprocess", preprocessor), ("clf", clf)])


def main(data_path: str, out_dir: str, test_size: float, cv_folds: int):
    os.makedirs(out_dir, exist_ok=True)

    df = pd.read_csv(data_path)
    numeric_cols, categorical_cols = build_feature_lists(df)

    X = df[numeric_cols + categorical_cols]
    y = df[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42, stratify=y
    )

    pipeline = build_pipeline(numeric_cols, categorical_cols)

    print(f"Training on {X_train.shape[0]} rows / {X_train.shape[1]} raw features "
          f"({len(numeric_cols)} numeric, {len(categorical_cols)} categorical)...")
    pipeline.fit(X_train, y_train)

    # Cross-validated sanity check on the training split
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv_folds, scoring="accuracy")
    print(f"{cv_folds}-fold CV accuracy on train: {cv_scores.mean():.3f} +/- {cv_scores.std():.3f}")

    # Held-out evaluation
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)
    classes = pipeline.named_steps["clf"].classes_

    report = classification_report(y_test, y_pred, output_dict=True)
    try:
        auc_ovr = roc_auc_score(y_test, y_proba, multi_class="ovr", average="macro")
    except ValueError:
        auc_ovr = None

    cm = confusion_matrix(y_test, y_pred, labels=classes)

    print("\n=== Held-out test performance ===")
    print(classification_report(y_test, y_pred))
    if auc_ovr is not None:
        print(f"Macro-average AUC-ROC (one-vs-rest): {auc_ovr:.3f}")

    # -----------------------------------------------------------------
    # Save artifacts for later use by the web backend
    # -----------------------------------------------------------------
    model_path = os.path.join(out_dir, "model.joblib")
    joblib.dump(pipeline, model_path)

    schema = {
        "numeric_features": numeric_cols,
        "categorical_features": categorical_cols,
        "categorical_allowed_values": {
            c: sorted(df[c].dropna().unique().tolist()) for c in categorical_cols
        },
        "target_column": TARGET_COLUMN,
    }
    with open(os.path.join(out_dir, "feature_schema.json"), "w") as f:
        json.dump(schema, f, indent=2)

    with open(os.path.join(out_dir, "label_classes.json"), "w") as f:
        json.dump(list(classes), f, indent=2)

    metrics = {
        "cv_accuracy_mean": float(cv_scores.mean()),
        "cv_accuracy_std": float(cv_scores.std()),
        "test_accuracy": float(report["accuracy"]),
        "test_macro_f1": float(report["macro avg"]["f1-score"]),
        "test_macro_auc_ovr": float(auc_ovr) if auc_ovr is not None else None,
        "per_class_report": report,
        "confusion_matrix": cm.tolist(),
        "confusion_matrix_labels": list(classes),
        "n_train": int(X_train.shape[0]),
        "n_test": int(X_test.shape[0]),
    }
    with open(os.path.join(out_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nSaved model + schema + metrics to: {out_dir}/")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", default="NDCTD-45K_cleaned.csv", help="Path to cleaned CSV")
    parser.add_argument("--out", default="model_artifacts", help="Output directory for artifacts")
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--cv-folds", type=int, default=5)
    args = parser.parse_args()
    main(args.data, args.out, args.test_size, args.cv_folds)
