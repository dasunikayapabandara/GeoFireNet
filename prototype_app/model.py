import numpy as np
import os
import pandas as pd

class WildfireModel:
    def __init__(self, model_path="../backend/artifacts/model.pkl"):
        """
        Wildfire risk prediction model backed by the trained sklearn pipeline.
        """
        try:
            import joblib
        except Exception as e:
            raise RuntimeError(f"joblib is required to load the trained GeoFireNet model: {e}")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Trained model artifact not found at {model_path}. Run backend/train_model.py first.")

        self.model = joblib.load(model_path)
        print(f"Loaded trained model from {model_path}")
        
        # Baseline coefficients used only for transparent comparison against ML output.
        self.coef_temp = 40.0
        self.coef_humidity = -30.0
        self.coef_wind = 20.0
        self.coef_veg = -30.0
        self.intercept = 40.0

    def predict_heuristic(self, temp_c, humidity_pct, wind_kmh, veg_moisture):
        """
        Baseline heuristic formula calculation (0-100).
        This is a linear model used as a comparative baseline.
        """
        # Contract Enforcement: Log Warnings
        if not (0 <= temp_c <= 50): print(f"WARNING: Clamping temp {temp_c} to [0, 50]")
        if not (0 <= humidity_pct <= 100): print(f"WARNING: Clamping humidity {humidity_pct} to [0, 100]")
        if not (0 <= wind_kmh <= 100): print(f"WARNING: Clamping wind {wind_kmh} to [0, 100]")
        if not (0 <= veg_moisture <= 1): print(f"WARNING: Clamping veg {veg_moisture} to [0, 1]")

        n_temp = np.clip(temp_c / 50.0, 0, 1)
        n_hum = np.clip(humidity_pct / 100.0, 0, 1)
        n_wind = np.clip(wind_kmh / 100.0, 0, 1)
        n_veg = np.clip(veg_moisture, 0, 1)
        
        # Linear Score = (40 * nT + 20 * nW - 30 * nH - 30 * nV) + 40
        score = (40 * n_temp) + \
                (20 * n_wind) - \
                (30 * n_hum) - \
                (30 * n_veg) + \
                40
                
        return np.clip(score, 0.0, 100.0)

    def predict(self, temp_c, humidity_pct, wind_kmh, veg_moisture):
        """
        Predicts wildfire risk using the trained RandomForestClassifier pipeline.
        """
        input_df = pd.DataFrame([{
            "temp": temp_c,
            "humidity": humidity_pct,
            "wind": wind_kmh,
            "veg_moisture": veg_moisture
        }])
        probability = float(self.model.predict_proba(input_df)[0, 1])
        return np.clip(probability * 100.0, 0.0, 100.0)

    def get_risk_level(self, score):
        """Returns categorical risk level based on 0-100 score."""
        if score < 30:
            return "Low", "#22c55e" # Green
        elif score < 50:
            return "Moderate", "#eab308" # Yellow
        elif score < 80:
            return "High", "#f97316" # Orange
        else:
            return "Extreme", "#ef4444" # Red
