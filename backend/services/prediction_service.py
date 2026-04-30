import pandas as pd
from backend.config import RISK_LEVELS_DEFAULT, settings
from backend import model_registry
from backend.core.logger import logger

class RiskPredictor:
    def __init__(self):
        try:
            logger.info("Initializing Risk Predictor Engine...")
            self.model = model_registry.load_model()
            self.thresholds = model_registry.load_thresholds()
        except Exception as e:
            logger.error(f"Failed to load model/thresholds from registry: {e}")
            self.model = None
            self.thresholds = None

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
        if self.model is None or self.thresholds is None:
            raise RuntimeError("Model not trained. Run training pipeline.")
            
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
            
        # ML Inference
        # Get probability of class 1 (High Risk Fire Condition)
        probability = float(self.model.predict_proba(input_data)[0, 1])
        
        # Scale back to 0-100 purely for UI consistency (if the dashboard expects 0-100 numbers)
        # Even though theoretically it's a probability, the User asked to support both "probability output" and "human-readable label".
        scaled_score = probability * 100 
        
        return {
            "risk_score": round(scaled_score, 2),
            "risk_probability": round(probability, 4),
            "confidence": round(probability, 4),
            "risk_level": self.get_risk_level(probability),
            "baseline_score": round(baseline_score, 2),
            "baseline_level": baseline_level,
            "key_drivers": self._get_feature_contributions(input_data)
        }

    def _calculate_heuristic_baseline(self, temp, humidity, wind, veg_moisture):
        """Simulate the Canadian FWI heuristic logic for comparison."""
        n_temp = min(temp / settings.MAX_TEMP, 1.0)
        n_hum = min(humidity / settings.MAX_HUMIDITY, 1.0)
        n_wind = min(wind / settings.MAX_WIND, 1.0)
        n_veg = min(veg_moisture, 1.0)
        
        score = (40 * n_temp) + (20 * n_wind) - (30 * n_hum) - (30 * n_veg) + 40
        return max(0.0, min(score, 100.0))
        
    def _get_feature_contributions(self, input_df):
        """
        Extract meaningful explanations by weighting triggered conditions 
        by the Random Forest's global feature importances.
        """
        eng_df = self.model.named_steps['preprocessor'].named_steps['feature_eng'].transform(input_df)
        row = eng_df.iloc[0]
        
        classifier = self.model.named_steps['classifier']
        if not hasattr(classifier, 'feature_importances_'):
            return ["Normal Conditions"]
            
        importances = classifier.feature_importances_
        feature_names = self.model.named_steps['preprocessor'].named_steps['feature_eng'].get_feature_names_out()
        importance_map = dict(zip(feature_names, importances))
        
        # Define conditions that push risk higher
        conditions = {
            "temp_wind_interaction": (row.get('temp_wind_interaction', 0) > 0.4, "Critical Heat+Wind Interaction"),
            "temp": (row.get('temp', 0) > settings.MOCK_PENALTY_TEMP, "High Temperature"),
            "wind": (row.get('wind', 0) > settings.MOCK_PENALTY_WIND, "Strong Winds"),
            "humidity": (row.get('humidity', 100) < 30, "Critically Low Humidity"),
            "veg_moisture": (row.get('veg_moisture', 1) < 0.3, "Dry Vegetation")
        }
        
        drivers = []
        # Sort features by the model's learned importance
        sorted_features = sorted(importance_map.keys(), key=lambda k: importance_map[k], reverse=True)
        
        for feat in sorted_features:
            if feat in conditions:
                is_triggered, label = conditions[feat]
                if is_triggered:
                    drivers.append(label)
            if len(drivers) >= 3:
                break
                
        return drivers if drivers else ["Normal Conditions"]
        

