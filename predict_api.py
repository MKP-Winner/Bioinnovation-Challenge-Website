"""Serve the ROSA research website and its prediction API.

Run locally with ``python predict_api.py``. For production, use the
Gunicorn command in ``render.yaml``; model artifacts are loaded when the app
is imported so predictions work under either server.
"""

import json
import math
import os
from numbers import Real
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
from werkzeug.exceptions import RequestEntityTooLarge


BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = Path(os.getenv("MODEL_ARTIFACTS_DIR", BASE_DIR))
PUBLIC_FILES = {
    "index.html", "about.html", "genetics.html", "database.html", "script.js", "style.css",
}
NUMERIC_BOUNDS = {
    "Age": (18, 120), "BMI": (10, 80), "Sleep_Duration": (0, 24),
    "Exercise_Frequency_Weekly": (0, 7), "Family_History_Alzheimer": (0, 1),
    "Family_History_Dementia": (0, 1), "Head_Injury": (0, 1),
    "Medication_Count": (0, 100), "APOE_e4": (0, 2),
}

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024
MODEL = None
SCHEMA = None


def load_artifacts(artifacts_dir: Path = ARTIFACTS_DIR):
    """Load application-owned model artifacts at process startup."""
    global MODEL, SCHEMA
    model_path = artifacts_dir / "model.joblib"
    schema_path = artifacts_dir / "feature_schema.json"
    if not model_path.is_file() or not schema_path.is_file():
        raise RuntimeError("Required model artifacts are missing.")
    # joblib files can execute code when loaded. Never accept one from a request.
    MODEL = joblib.load(model_path)
    with schema_path.open(encoding="utf-8") as schema_file:
        SCHEMA = json.load(schema_file)


def allowed_origins():
    """Return explicitly configured cross-origin frontend URLs, if any."""
    return {
        origin.strip().rstrip("/")
        for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
        if origin.strip()
    }


@app.after_request
def security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    )
    origin = request.headers.get("Origin", "").rstrip("/")
    if origin and origin in allowed_origins():
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.errorhandler(RequestEntityTooLarge)
def request_too_large(_error):
    return jsonify({"error": "Request body is too large"}), 413


@app.get("/")
def website_home():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/<path:filename>")
def website_asset(filename):
    """Serve only explicit frontend assets, never arbitrary project files."""
    if filename not in PUBLIC_FILES:
        return jsonify({"error": "Not found"}), 404
    return send_from_directory(BASE_DIR, filename)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "model_loaded": MODEL is not None})


@app.get("/schema")
def schema():
    return jsonify(SCHEMA)


def validate_payload(payload):
    if not isinstance(payload, dict):
        return {"error": "Expected a JSON object"}
    required = SCHEMA.get(
        "intake_features", SCHEMA["numeric_features"] + SCHEMA["categorical_features"]
    )
    missing = [field for field in required if field not in payload]
    if missing:
        return {"error": "Missing fields", "missing": missing}
    unexpected = [field for field in payload if field not in required]
    if unexpected:
        return {"error": "Unexpected fields", "fields": unexpected}
    bad_categoricals = {
        field: {"received": payload[field], "allowed": allowed}
        for field, allowed in SCHEMA["categorical_allowed_values"].items()
        if payload[field] not in allowed
    }
    if bad_categoricals:
        return {"error": "Invalid categorical value(s)", "details": bad_categoricals}

    invalid_numbers = {}
    for field in SCHEMA["numeric_features"]:
        value = payload[field]
        # APOE is optional in the form; the trained imputer handles null.
        if field == "APOE_e4" and value is None:
            continue
        if isinstance(value, bool) or not isinstance(value, Real) or not math.isfinite(value):
            invalid_numbers[field] = "Must be a finite number"
            continue
        low, high = NUMERIC_BOUNDS[field]
        if not low <= value <= high:
            invalid_numbers[field] = f"Must be between {low} and {high}"
    if invalid_numbers:
        return {"error": "Invalid numeric value(s)", "details": invalid_numbers}
    return None


@app.post("/predict")
def predict():
    if MODEL is None or SCHEMA is None:
        return jsonify({"error": "Model not loaded"}), 503
    if not request.is_json:
        return jsonify({"error": "Expected application/json request"}), 415
    payload = request.get_json(silent=True)
    validation_error = validate_payload(payload)
    if validation_error:
        return jsonify(validation_error), 400

    required = SCHEMA.get(
        "intake_features", SCHEMA["numeric_features"] + SCHEMA["categorical_features"]
    )
    row = pd.DataFrame([{field: payload[field] for field in required}])
    prediction = MODEL.predict(row)[0]
    probabilities = {
        str(label): float(probability)
        for label, probability in zip(MODEL.named_steps["clf"].classes_, MODEL.predict_proba(row)[0])
    }
    return jsonify({
        "prediction": str(prediction),
        "alzheimer_probability": probabilities.get("AD", 0.0),
        "not_alzheimer_probability": probabilities.get("Not AD", 0.0),
        "research_note": "This is a research estimate, not a medical diagnosis or clinical risk assessment.",
    })


# Must execute at import time so Gunicorn workers have a ready model.
load_artifacts()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=False)
