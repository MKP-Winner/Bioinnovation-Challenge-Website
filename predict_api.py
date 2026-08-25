"""
predict_api.py
================
A minimal REST API that wraps the trained model so a website (or any
frontend) can send a patient's risk-factor data and get a prediction back.

Run locally:
    python3 predict_api.py --artifacts model_artifacts --port 5000

Endpoints:
    GET  /health           -> {"status": "ok"}
    GET  /schema           -> the exact fields the frontend form must collect
    POST /predict           -> {"diagnosis": "...", "probabilities": {...}}

Example request body for /predict (fields must match /schema):
{
  "Age": 67, "Sex": "Female", "Height": 162.0, "Weight": 68.5, "BMI": 26.1,
  "Education_Level": "Bachelors", "Occupation": "Retired",
  "Marital_Status": "Married", "Ethnicity": "Caucasian",
  "Residence_Type": "Urban", "Socioeconomic_Status": "Medium",
  "Smoking_Status": "Never", "Alcohol_Consumption": "None",
  ... (all fields listed in /schema) ...
  "APOE_e4": 1, "SNCA": 0, "LRRK2": 0, "MAPT": 0,
  "HTT_Expansion": 0, "C9orf72": 0
}

NOTE ON DEPLOYMENT:
This is a development server (Flask's built-in `app.run`) suitable for
local testing and connecting to a website in progress. Before putting
this in front of real users, it should sit behind a production WSGI
server (gunicorn/uwsgi) and, since this handles health-related data,
behind HTTPS with proper authentication - talk to your IRB / faculty
advisor about what's required for real participant data specifically.
"""

import argparse
import json
import os

import joblib
import pandas as pd
from flask import Flask, jsonify, request

app = Flask(__name__)


@app.after_request
def allow_website_requests(response):
    """Allow the local static website to call this development API."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

# Populated at startup by load_artifacts()
MODEL = None
SCHEMA = None


def load_artifacts(artifacts_dir: str):
    global MODEL, SCHEMA
    MODEL = joblib.load(os.path.join(artifacts_dir, "model.joblib"))
    with open(os.path.join(artifacts_dir, "feature_schema.json")) as f:
        SCHEMA = json.load(f)


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/schema")
def schema():
    """Tells the website exactly which fields to collect and, for
    categorical fields, which values are valid - useful for building
    the Index.html intake form mentioned in the proposal."""
    return jsonify(SCHEMA)


@app.post("/predict")
def predict():
    if MODEL is None or SCHEMA is None:
        return jsonify({"error": "Model not loaded"}), 500

    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"error": "Expected JSON body"}), 400

    required = SCHEMA["numeric_features"] + SCHEMA["categorical_features"]
    missing = [f for f in required if f not in payload]
    if missing:
        return jsonify({"error": "Missing fields", "missing": missing}), 400

    # Light validation on categorical values against allowed set
    bad_categoricals = {}
    for col, allowed in SCHEMA["categorical_allowed_values"].items():
        if payload[col] not in allowed:
            bad_categoricals[col] = {"received": payload[col], "allowed": allowed}
    if bad_categoricals:
        return jsonify({"error": "Invalid categorical value(s)", "details": bad_categoricals}), 400

    row = pd.DataFrame([{f: payload[f] for f in required}])

    prediction = MODEL.predict(row)[0]
    proba = MODEL.predict_proba(row)[0]
    classes = MODEL.named_steps["clf"].classes_

    return jsonify({
        "diagnosis": str(prediction),
        "probabilities": {str(c): float(p) for c, p in zip(classes, proba)},
    })


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artifacts", default=".", help="Directory with model.joblib + feature_schema.json")
    parser.add_argument("--port", type=int, default=5000)
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    load_artifacts(args.artifacts)
    app.run(host=args.host, port=args.port, debug=False)
