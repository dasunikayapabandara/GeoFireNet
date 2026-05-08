import pytest
import time
from fastapi.testclient import TestClient
from backend.main import app
from backend.schemas import PredictionRequest

client = TestClient(app)

def test_prediction_endpoint_performance():
    """Test that the prediction endpoint responds within acceptable limits."""
    payload = {
        "temp": 35.0,
        "humidity": 20.0,
        "wind": 45.0,
        "veg_moisture": 0.2
    }
    
    # Warmup request
    client.post("/predict", json=payload)
    
    start_time = time.time()
    response = client.post("/predict", json=payload)
    end_time = time.time()
    
    assert response.status_code == 200
    
    latency_ms = (end_time - start_time) * 1000
    print(f"\nPrediction Inference Latency: {latency_ms:.2f} ms")
    
    # Assert latency is under 200ms
    assert latency_ms < 200.0, f"Prediction endpoint is too slow: {latency_ms:.2f} ms"

def test_health_endpoint_performance():
    """Test that health check responds instantly."""
    start_time = time.time()
    response = client.get("/health")
    end_time = time.time()
    
    assert response.status_code == 200
    latency_ms = (end_time - start_time) * 1000
    print(f"Health Check Latency: {latency_ms:.2f} ms")
    
    assert latency_ms < 50.0, f"Health endpoint is too slow: {latency_ms:.2f} ms"
