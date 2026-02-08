import numpy as np
import os
import joblib

class WildfireModel:
    def __init__(self, model_path="model.pkl"):
        """
        Wildfire risk prediction model.
        Attempts to load a trained model from `model_path`.
        Falls back to Mock Logic if file not found.
        """
        self.model = None
        self.is_mock = True
        
        if os.path.exists(model_path):
            try:
                self.model = joblib.load(model_path)
                self.is_mock = False
                print(f"Loaded trained model from {model_path}")
            except Exception as e:
                print(f"Error loading model: {e}")
        
        # Mock Coefficients (Fallback)
        self.coef_temp = 0.4
        self.coef_humidity = -0.3
        self.coef_wind = 0.2
        self.coef_veg = -0.3
        self.intercept = 0.2

    def predict(self, temp_c, humidity_pct, wind_kmh, veg_moisture):
        """
        Predicts wildfire risk probability (0.0 to 1.0).
        Uses trained model if available, else mock logic.
        """
        if not self.is_mock and self.model:
            # Prepare input vector [[Temp, Humidity, Wind, Vegetation]]
            # Ensure order matches training data!
            input_vector = [[temp_c, humidity_pct, wind_kmh, veg_moisture]]
            try:
                # Expecting model to return probability of positive class (Fire)
                if hasattr(self.model, "predict_proba"):
                    return self.model.predict_proba(input_vector)[0][1]
                else:
                    return self.model.predict(input_vector)[0]
            except Exception as e:
                print(f"Prediction error: {e}, falling back to mock.")
        
        # Mock Logic
        n_temp = np.clip(temp_c / 50.0, 0, 1)
        n_hum = np.clip(humidity_pct / 100.0, 0, 1)
        n_wind = np.clip(wind_kmh / 100.0, 0, 1)
        n_veg = np.clip(veg_moisture, 0, 1)
        
        score = (self.coef_temp * n_temp) + \
                (self.coef_humidity * n_hum) + \
                (self.coef_wind * n_wind) + \
                (self.coef_veg * n_veg) + \
                self.intercept
        
        noise = np.random.normal(0, 0.02)
        score += noise
        return np.clip(score, 0.0, 1.0)

    def get_risk_level(self, probability):
        """Returns categorical risk level based on probability."""
        if probability < 0.3:
            return "Low", "#22c55e" # Green
        elif probability < 0.6:
            return "Moderate", "#eab308" # Yellow
        elif probability < 0.85:
            return "High", "#f97316" # Orange
        else:
            return "Extreme", "#ef4444" # Red
