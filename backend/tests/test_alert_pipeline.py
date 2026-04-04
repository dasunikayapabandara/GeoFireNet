from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_prediction_to_alert_flow():
    # Send high risk prediction
    response = client.post("/predict", json={
        "temp": 45.0,  # Extreme heat
        "humidity": 10.0, # Very low humidity
        "wind": 80.0, # High wind
        "veg_moisture": 0.05, # Very dry
        "country": "USA",
        "admin_region": "CA"
    })
    
    assert response.status_code == 200
    pred_data = response.json()
    assert pred_data["alert_triggered"] == True
    assert "saved_prediction_id" in pred_data
    assert pred_data["saved_prediction_id"] is not None
    
    # Check alert was created
    alerts_resp = client.get("/alerts")
    assert alerts_resp.status_code == 200
    alerts = alerts_resp.json()
    
    assert len(alerts) > 0
    latest_alert = alerts[0]
    
    assert latest_alert["severity"] == "extreme"
    assert latest_alert["prediction_id"] == pred_data["saved_prediction_id"]
    
    # Fetch by ID
    alert_id = latest_alert["id"]
    single_alert_resp = client.get(f"/alerts/{alert_id}")
    assert single_alert_resp.status_code == 200
    assert single_alert_resp.json()["id"] == alert_id
    
    # Acknowledge the alert
    ack_resp = client.patch(f"/alerts/{alert_id}/acknowledge")
    assert ack_resp.status_code == 200
    assert ack_resp.json()["status"] == "acknowledged"

    # Resolve the alert
    resolve_resp = client.patch(f"/alerts/{alert_id}/resolve")
    assert resolve_resp.status_code == 200
    assert resolve_resp.json()["status"] == "resolved"
