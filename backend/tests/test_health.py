from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check_liveness():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "version" in response.json()

def test_health_check_db():
    response = client.get("/health/db")
    assert response.status_code == 200
    assert response.json()["service"] == "database"
    assert response.json()["status"] in ["healthy", "degraded"]

def test_health_check_model():
    response = client.get("/health/model")
    assert response.status_code == 200
    assert response.json()["service"] == "model"
    assert "mocked" in response.json()

def test_system_status():
    response = client.get("/system/status")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "components" in data
    assert "database" in data["components"]
    assert "model" in data["components"]
