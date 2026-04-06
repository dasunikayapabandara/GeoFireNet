from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_predict_endpoint_success():
    response = client.post("/predict", json={
        "temp": 35.0,
        "humidity": 20.0,
        "wind": 50.0,
        "veg_moisture": 0.1,
        "country": "USA",
        "admin_region": "CA"
    })
    
    assert response.status_code == 200
    data = response.json()
    
    # Check that new structured fields exist
    assert "risk_score" in data
    assert "explanation" in data
    assert "alert_triggered" in data
    assert "saved_prediction_id" in data
    assert "timestamp" in data
    assert "system_status" in data
    assert "baseline_level" in data
    
    assert isinstance(data["explanation"], list)
    
def test_predict_endpoint_lat_lon_clamping():
    response = client.post("/predict", json={
        "temp": 25.0,
        "humidity": 50.0,
        "wind": 10.0,
        "veg_moisture": 0.5,
        "latitude": 95.0,  # Should clamp to 90.0
        "longitude": 200.0 # Should clamp to 180.0
    })
    
    assert response.status_code == 200

def test_predict_validation_error():
    # Missing required validation fields like 'temp' or providing wrong type
    response = client.post("/predict", json={
        "wind": 50.0,
        "veg_moisture": 0.1,
        "country": "USA",
        "admin_region": "CA"
    })
    
    assert response.status_code == 422
    data = response.json()
    assert "detail" in data
    assert "errors" in data
    assert data["detail"] == "Payload validation failed"
    # Should flag missing 'temp' and 'humidity'
    assert len(data["errors"]) >= 2
