import pandas as pd
from backend.core.config import RISK_LEVELS_DEFAULT
from backend import model_registry
from backend.core.logger import logger

class RiskPredictor:
    def __init__(self):
        try:
            logger.info("Initializing Risk Predictor Engine...")
            self.model = model_registry.load_model()
            self.thresholds = model_registry.load_thresholds()
            self.is_mock = False
        except Exception as e:
            logger.warning(f"Failed to load model from registry: {e}. Running in degraded mock mode.")
            self.model = None
            self.thresholds = RISK_LEVELS_DEFAULT
            self.is_mock = True

    def get_risk_level(self, probability):
        """Map raw probability to a qualitative Risk Level based on calibrated thresholds."""
        if probability <= self.thresholds.get("Low", 0.3):
            return "Low"
        elif probability <= self.thresholds.get("Moderate", 0.5):
            return "Moderate"
        elif probability <= self.thresholds.get("High", 0.8):
            return "High"
        else:
            return "Extreme"

    def predict(self, temp: float, humidity: float, wind: float, veg_moisture: float):
        """Execute a safe prediction on incoming data."""
        # The schema validation and basic clamping happens in FastAPI (main.py).
        # We pass it to pandas to match the pipeline's expected format.
        
        input_data = pd.DataFrame([{
            "temp": temp,
            "humidity": humidity,
            "wind": wind,
            "veg_moisture": veg_moisture
        }])
        
        baseline_score = self._calculate_heuristic_baseline(temp, humidity, wind, veg_moisture)
        baseline_level = self.get_risk_level(baseline_score / 100.0)
        
        if self.is_mock:
            # Fallback mock logic if ML artifact is missing
            probability = baseline_score / 100.0
            if temp > 35 and wind > 60:
                probability += 0.2
            probability = min(probability, 1.0)
            
            return {
                "risk_score": round(probability * 100, 2), # Scale 0-100 for legacy compatibility
                "risk_probability": round(probability, 4),
                "risk_level": self.get_risk_level(probability),
                "baseline_score": round(baseline_score, 2),
                "baseline_level": baseline_level,
                "primary_drivers": self._get_heuristic_drivers(temp, humidity, wind, veg_moisture),
                "is_mock": True
            }
            
        # ML Inference
        # Get probability of class 1 (High Risk Fire Condition)
        probability = float(self.model.predict_proba(input_data)[0, 1])
        
        # Scale back to 0-100 purely for UI consistency (if the dashboard expects 0-100 numbers)
        # Even though theoretically it's a probability, the User asked to support both "probability output" and "human-readable label".
        scaled_score = probability * 100 
        
        return {
            "risk_score": round(scaled_score, 2),
            "risk_probability": round(probability, 4),
            "risk_level": self.get_risk_level(probability),
            "baseline_score": round(baseline_score, 2),
            "baseline_level": baseline_level,
            "primary_drivers": self._get_feature_contributions(input_data),
            "is_mock": False
        }

    def _calculate_heuristic_baseline(self, temp, humidity, wind, veg_moisture):
        """Simulate the Canadian FWI heuristic logic for comparison."""
        n_temp = min(temp / 50.0, 1.0)
        n_hum = min(humidity / 100.0, 1.0)
        n_wind = min(wind / 100.0, 1.0)
        n_veg = min(veg_moisture, 1.0)
        
        score = (40 * n_temp) + (20 * n_wind) - (30 * n_hum) - (30 * n_veg) + 40
        return max(0.0, min(score, 100.0))
        
    def _get_feature_contributions(self, input_df):
        """
        Extract meaningful explanations. 
        Instead of SHAP (heavy), we use the preprocessor to see engineered values and heuristic weights.
        """
        # We can extract the engineered DataFrame directly to see what actually spiked
        eng_df = self.model.named_steps['preprocessor'].named_steps['feature_eng'].transform(input_df)
        
        # We'll use heuristic rules coupled with engineered features to explain it
        # Since Random Forest is complex to explain per-instance without SHAP, we use a hybrid approach
        row = eng_df.iloc[0]
        drivers = []
        
        if row.get('temp_wind_interaction', 0) > 0.4:
            drivers.append("Critical Heat+Wind Interaction")
            
        if row['temp'] > 35:
            drivers.append("High Temperature")
            
        if row['wind'] > 60:
            drivers.append("Strong Winds")
            
        if row['humidity'] < 30:
            drivers.append("Critically Low Humidity")
            
        if row['veg_moisture'] < 0.3:
            drivers.append("Dry Vegetation")
            
        return drivers[:3] if drivers else ["Normal Conditions"]
        
    def _get_heuristic_drivers(self, temp, humidity, wind, veg):
        """Fallback driver logic."""
        drivers = []
        if temp > 35 and wind > 60: drivers.append("Heat+Wind Interaction")
        if temp > 35: drivers.append("High Temperature")
        if wind > 60: drivers.append("Strong Winds")
        return drivers[:3] if drivers else ["Normal Conditions"]
