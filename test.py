"""Regression tests for public routes and prediction validation.

Run with: python -m unittest test.py
"""

import unittest

from predict_api import app


VALID_PAYLOAD = {
    "Age": 67,
    "Sex": "Female",
    "BMI": 26.1,
    "Sleep_Duration": 6,
    "Exercise_Frequency_Weekly": 3,
    "Family_History_Alzheimer": 0,
    "Family_History_Dementia": 0,
    "Head_Injury": 0,
    "Medication_Count": 2,
    "APOE_e4": 0,
}


class PredictionApiTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_reports_a_loaded_model(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"status": "ok", "model_loaded": True})

    def test_only_public_assets_are_served(self):
        style_response = self.client.get("/style.css")
        self.assertEqual(style_response.status_code, 200)
        style_response.close()
        self.assertEqual(self.client.get("/model.joblib").status_code, 404)
        self.assertEqual(self.client.get("/NDCTD-45K.csv").status_code, 404)
        self.assertEqual(self.client.get("/predict_api.py").status_code, 404)

    def test_valid_prediction(self):
        response = self.client.post("/predict", json=VALID_PAYLOAD)
        self.assertEqual(response.status_code, 200)
        self.assertIn("alzheimer_probability", response.json)

    def test_invalid_numeric_input_is_rejected(self):
        response = self.client.post("/predict", json=VALID_PAYLOAD | {"Age": -1})
        self.assertEqual(response.status_code, 400)
        self.assertIn("Age", response.json["details"])

    def test_cross_origin_requests_are_not_wildcard_allowed(self):
        response = self.client.post(
            "/predict", json=VALID_PAYLOAD, headers={"Origin": "https://untrusted.example"}
        )
        self.assertNotIn("Access-Control-Allow-Origin", response.headers)


if __name__ == "__main__":
    unittest.main()
