import pytest
from backend.schemas import PredictionRequest

def test_wildfire_feature_clamping():
    """Test that Pydantic properly clamps extreme inputs to prevent model crashes."""
    
    # Normal input
    features = PredictionRequest(temp=30.0, humidity=40.0, wind=20.0, veg_moisture=0.3)
    assert features.temp == 30.0
    
    # Extreme Heat Clamped
    features_hot = PredictionRequest(temp=999.0, humidity=40.0, wind=20.0, veg_moisture=0.3)
    assert features_hot.temp == 60.0
    
    # Negative values clamped
    features_cold = PredictionRequest(temp=-50.0, humidity=-10.0, wind=-5.0, veg_moisture=-1.0)
    assert features_cold.temp == -20.0
    assert features_cold.humidity == 0.0
    assert features_cold.wind == 0.0
    assert features_cold.veg_moisture == 0.0

def test_risk_level_mapping_with_loaded_thresholds():
    """Test the risk level mapping logic with explicit calibrated thresholds."""
    from backend.services.prediction_service import RiskPredictor
    
    # We test the predictor mapping assuming default thresholds
    predictor = RiskPredictor()
    predictor.thresholds = {"Low": 0.3, "Moderate": 0.5, "High": 0.8, "Extreme": 1.0}
    
    assert predictor.get_risk_level(0.1) == "Low"
    assert predictor.get_risk_level(0.4) == "Moderate"
    assert predictor.get_risk_level(0.7) == "High"
    assert predictor.get_risk_level(0.9) == "Extreme"
