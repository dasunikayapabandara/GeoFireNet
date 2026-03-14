from fastapi import FastAPI, HTTPException, File, UploadFile, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import schemas, crud
from pydantic import BaseModel, field_validator
from fastapi.middleware.cors import CORSMiddleware
import os
from enum import Enum

# Import our new Predictor Engine
from backend.predict import RiskPredictor

app = FastAPI(title="GeoFireNet Risk API v2")

# Allow CORS for React Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SystemMode(str, Enum):
    PRODUCTION = "PRODUCTION"
    SIMULATION = "SIMULATION"
    DEGRADED = "DEGRADED"

# Initialize ML Predictor (Loads securely cached models)
predictor = RiskPredictor()

CURRENT_MODE = SystemMode.PRODUCTION
if os.environ.get("SIMULATE_OUTAGE") == "1":
    CURRENT_MODE = SystemMode.DEGRADED
    print(f"STARTUP: Forced DEGRADED mode via environment variable.")
elif predictor.is_mock:
    CURRENT_MODE = SystemMode.SIMULATION
    print(f"STARTUP: Model found missing/invalid. Falling back to SIMULATION.")
else:
    print(f"STARTUP: Model validated. Mode: PRODUCTION")

class WildfireFeatures(BaseModel):
    temp: float
    humidity: float
    wind: float
    veg_moisture: float

    @field_validator('temp')
    @classmethod
    def clamp_temp(cls, v):
        if v < -20.0 or v > 60.0: # Wider bounds for robustness vs just 0-50
            print(f"WARNING: API Clamping temperature input {v} to [-20, 60]")
            return max(-20.0, min(v, 60.0))
        return v

    @field_validator('humidity')
    @classmethod
    def clamp_humidity(cls, v):
        if v < 0.0 or v > 100.0:
            print(f"WARNING: API Clamping humidity input {v} to [0, 100]")
            return max(0.0, min(v, 100.0))
        return v

    @field_validator('wind')
    @classmethod
    def clamp_wind(cls, v):
        if v < 0.0 or v > 150.0: # Higher bounds for cyclones/extreme wind
            print(f"WARNING: API Clamping wind input {v} to [0, 150]")
            return max(0.0, min(v, 150.0))
        return v

    @field_validator('veg_moisture')
    @classmethod
    def clamp_veg(cls, v):
        if v < 0.0 or v > 1.0:
            print(f"WARNING: API Clamping veg_moisture input {v} to [0, 1]")
            return max(0.0, min(v, 1.0))
        return v

class RiskPrediction(BaseModel):
    risk_score: float # Kept for UI legacy, scaled 0-100
    risk_probability: float # The raw ML confidence
    risk_level: str
    baseline_score: float
    baseline_level: str
    primary_drivers: list[str]
    system_status: SystemMode

@app.post("/predict", response_model=RiskPrediction)
async def predict_risk(features: WildfireFeatures, db: Session = Depends(get_db)):
    if CURRENT_MODE == SystemMode.DEGRADED:
        # Strict fallback
        return {
            "risk_score": 0.0,
            "risk_probability": 0.0,
            "risk_level": "Unknown",
            "baseline_score": 0.0,
            "baseline_level": "Unknown",
            "primary_drivers": ["System Offline"],
            "system_status": CURRENT_MODE
        }
        
    try:
        # Delegate to Prediction Engine
        result = predictor.predict(
            temp=features.temp,
            humidity=features.humidity,
            wind=features.wind,
            veg_moisture=features.veg_moisture
        )
        result["system_status"] = CURRENT_MODE
        
        # --- Save to PostgreSQL Database ---
        db_weather = crud.create_weather_input(db, schemas.WeatherInputCreate(
            temp=features.temp,
            humidity=features.humidity,
            wind=features.wind,
            veg_moisture=features.veg_moisture
        ))
        
        crud.create_prediction_log(db, schemas.RiskPredictionLogCreate(
            risk_score=result["risk_score"],
            risk_probability=result["risk_probability"],
            risk_level=result["risk_level"],
            baseline_score=result["baseline_score"],
            system_status=result.get("system_status"),
            primary_drivers=", ".join(result["primary_drivers"]),
            weather_input_id=db_weather.id
        ))
        
        return result
    except Exception as e:
        print(f"Prediction API Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Prediction Error")

class ReactivePrediction(BaseModel):
    is_fire: bool
    confidence: float
    message: str

@app.post("/predict/reactive", response_model=ReactivePrediction)
async def predict_reactive(file: UploadFile = File(...)):
    """Reactive Prediction Endpoint: Simulates vision-based fire detection."""
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image.")
        
        filename = file.filename.lower()
        is_fire = "fire" in filename or "smoke" in filename
        
        import random
        confidence = random.uniform(0.7, 0.99)
        
        if is_fire:
            message = "🔥 FIRE DETECTED: Emergency protocols recommended."
        else:
            message = "✅ NO FIRE: Environment appears clear."
            
        print(f"REACTIVE API: Analyzed {file.filename}. Result: {message}")
        
        return {
            "is_fire": is_fire,
            "confidence": round(confidence, 4),
            "message": message
        }
    except Exception as e:
        print(f"REACTIVE API ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history", response_model=list[schemas.RiskPredictionLog])
async def get_history(limit: int = 50, db: Session = Depends(get_db)):
    """Fetch the latest predictions saved in the database."""
    try:
        return crud.get_prediction_history(db, limit=limit)
    except Exception as e:
        print(f"History API Error: {e}")
        raise HTTPException(status_code=500, detail="Database lookup failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
