from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator
import joblib
import os
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="GeoFireNet Risk API")

# Allow CORS for React Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
model = None

try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"Loaded model from {MODEL_PATH}")
    else:
        print("Warning: model.pkl not found. API will use mock logic.")
except Exception as e:
    print(f"Error loading model: {e}")

class WildfireFeatures(BaseModel):
    temp: float
    humidity: float
    wind: float
    veg_moisture: float

    @field_validator('temp')
    @classmethod
    def clamp_temp(cls, v):
        if v < 0.0 or v > 50.0:
            print(f"WARNING: Clamping temperature input {v} to [0, 50]")
            return max(0.0, min(v, 50.0))
        return v

    @field_validator('humidity')
    @classmethod
    def clamp_humidity(cls, v):
        if v < 0.0 or v > 100.0:
            print(f"WARNING: Clamping humidity input {v} to [0, 100]")
            return max(0.0, min(v, 100.0))
        return v

    @field_validator('wind')
    @classmethod
    def clamp_wind(cls, v):
        if v < 0.0 or v > 100.0:
            print(f"WARNING: Clamping wind input {v} to [0, 100]")
            return max(0.0, min(v, 100.0))
        return v

    @field_validator('veg_moisture')
    @classmethod
    def clamp_veg(cls, v):
        if v < 0.0 or v > 1.0:
            print(f"WARNING: Clamping veg_moisture input {v} to [0, 1]")
            return max(0.0, min(v, 1.0))
        return v

class RiskPrediction(BaseModel):
    risk_score: float
    risk_level: str
    baseline_score: float
    baseline_level: str
    primary_drivers: list[str]

def get_risk_level(score):
    if score < 30: return "Low"
    if score < 50: return "Moderate"
    if score < 80: return "High"
    return "Extreme"

def get_risk_drivers(temp, humidity, wind, veg):
    """Identify top contributing factors to risk."""
    n_temp = min(temp / 50.0, 1.0)
    n_hum = min(humidity / 100.0, 1.0)
    n_wind = min(wind / 100.0, 1.0)
    n_veg = min(veg, 1.0)
    
    contribs = {}
    
    # Only list as a driver if it's actually contributing significantly to *risk* (high value)
    # Threshold 0.6 -> e.g. Temp > 30C, Wind > 60kmh
    if n_temp > 0.6:
        contribs["High Temperature"] = 40 * n_temp
    
    if n_wind > 0.6:
        contribs["Strong Winds"] = 20 * n_wind
        
    if (1.0 - n_hum) > 0.6: # Humidity < 40%
        contribs["Low Humidity"] = 30 * (1.0 - n_hum)
        
    if (1.0 - n_veg) > 0.6: # Veg Moisture < 0.4
        contribs["Dry Vegetation"] = 30 * (1.0 - n_veg)
    
    # Interaction
    if n_temp > 0.8 and n_wind > 0.7:
        contribs["Heat+Wind Interaction"] = 20
        
    # Sort by contribution
    sorted_factors = sorted(contribs.items(), key=lambda x: x[1], reverse=True)
    
    # Return top factors
    drivers = [f[0] for f in sorted_factors]
    return drivers[:3] if drivers else ["Normal Conditions"]

@app.post("/predict", response_model=RiskPrediction)
async def predict_risk(features: WildfireFeatures):
    # 1. Calculate Heuristic Baseline (Linear)
    n_temp = min(features.temp / 50.0, 1.0)
    n_hum = min(features.humidity / 100.0, 1.0)
    n_wind = min(features.wind / 100.0, 1.0)
    n_veg = min(features.veg_moisture, 1.0)
    
    baseline_score = (40 * n_temp) + (20 * n_wind) - (30 * n_hum) - (30 * n_veg) + 40
    baseline_score = max(0.0, min(baseline_score, 100.0))
    
    # 2. Calculate ML Prediction (Primary Source of Truth)
    if model:
        # Use trained model
        input_vector = [[features.temp, features.humidity, features.wind, features.veg_moisture]]
        try:
            # Model trained to predict 0-100 score directly
            # verify using verify_scenarios.py if it outputs probability or score
            # Based on view_file of train_model.py, it's a Regressor predicting 0-100 score.
            raw_score = float(model.predict(input_vector)[0])
            ml_score = max(0.0, min(raw_score, 100.0))
        except Exception as e:
            print(f"Model prediction failed: {e}")
            # Fallback to heuristic if model fails purely
            ml_score = baseline_score
    else:
        # Fallback Mock ML logic (Simulates model behavior)
        ml_score = baseline_score
        # Add non-linear boost to simulate ML "insight"
        if n_temp > 0.8 and n_wind > 0.7:
            ml_score += 20
            
    ml_score = max(0.0, min(ml_score, 100.0))

    return {
        "risk_score": round(ml_score, 2),
        "risk_level": get_risk_level(ml_score),
        "baseline_score": round(baseline_score, 2),
        "baseline_level": get_risk_level(baseline_score),
        "primary_drivers": get_risk_drivers(features.temp, features.humidity, features.wind, features.veg_moisture)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
