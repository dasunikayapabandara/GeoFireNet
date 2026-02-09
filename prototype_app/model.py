import numpy as np
import os

class WildfireModel:
    def __init__(self, model_path="model.pkl"):
        """
        Wildfire risk prediction model.
        Attempts to load a trained model from `model_path`.
        Falls back to Mock Logic if file not found or joblib missing.
        """
        self.model = None
        self.is_mock = True
        
        try:
            import joblib
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.is_mock = False
                print(f"Loaded trained model from {model_path}")
        except Exception as e:
            print(f"Error loading model (using fallback): {e}")
        
        # Mock Coefficients (Fallback) - Syncing with train_model.py weights
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
        Predicts wildfire risk using the trained ML model (if available).
        Includes non-linear interaction logic.
        """
        if not self.is_mock and self.model:
            input_vector = [[temp_c, humidity_pct, wind_kmh, veg_moisture]]
            try:
                # Direct model prediction (Regressor 0-100)
                score = float(self.model.predict(input_vector)[0])
                return np.clip(score, 0.0, 100.0)
            except Exception as e:
                print(f"Prediction error: {e}, falling back to heuristic.")
        
        # Mock/Fallback Logic
        # Used when model.pkl is missing or failed
        n_temp = np.clip(temp_c / 50.0, 0, 1)
        n_wind = np.clip(wind_kmh / 100.0, 0, 1)
        
        score = self.predict_heuristic(temp_c, humidity_pct, wind_kmh, veg_moisture)
        
        # Simulate ML Non-linear comparison
        if n_temp > 0.8 and n_wind > 0.7:
            score += 20
            
        noise = np.random.normal(0, 2)
        score += noise
        return np.clip(score, 0.0, 100.0)

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
