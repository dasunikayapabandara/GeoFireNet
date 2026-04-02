from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from pydantic import BaseModel, field_validator
from enum import Enum
import os

from backend.api.deps import get_db
from backend import schemas, crud
from backend.services.prediction_service import RiskPredictor
from backend.services.alert_service import evaluate_and_create_alert

router = APIRouter()

class SystemMode(str, Enum):
    PRODUCTION = "PRODUCTION"
    SIMULATION = "SIMULATION"
    DEGRADED = "DEGRADED"

class WildfireFeatures(BaseModel):
    temp: float
    humidity: float
    wind: float
    veg_moisture: float
    country: str = "Unknown"
    admin_region: str = "Unknown"
    latitude: float = 0.0
    longitude: float = 0.0

    @field_validator('temp')
    @classmethod
    def clamp_temp(cls, v):
        if v < -20.0 or v > 60.0:
            return max(-20.0, min(v, 60.0))
        return v

    @field_validator('humidity')
    @classmethod
    def clamp_humidity(cls, v):
        if v < 0.0 or v > 100.0:
            return max(0.0, min(v, 100.0))
        return v

    @field_validator('wind')
    @classmethod
    def clamp_wind(cls, v):
        if v < 0.0 or v > 150.0:
            return max(0.0, min(v, 150.0))
        return v

    @field_validator('veg_moisture')
    @classmethod
    def clamp_veg(cls, v):
        if v < 0.0 or v > 1.0:
            return max(0.0, min(v, 1.0))
        return v

class RiskPrediction(BaseModel):
    risk_score: float
    risk_probability: float
    risk_level: str
    baseline_score: float
    baseline_level: str
    primary_drivers: list[str]
    system_status: SystemMode

class ReactivePrediction(BaseModel):
    is_fire: bool
    confidence: float
    message: str

# Instantiate predictor logic here.
# Since FastAPI routers are loaded once at startup, this is a singleton.
predictor = RiskPredictor()
import os
CURRENT_MODE = SystemMode.PRODUCTION
if os.environ.get("SIMULATE_OUTAGE") == "1":
    CURRENT_MODE = SystemMode.DEGRADED
elif predictor.is_mock:
    CURRENT_MODE = SystemMode.SIMULATION

@router.post("", response_model=RiskPrediction)
async def predict_risk(features: WildfireFeatures, db: Session = Depends(get_db)):
    if CURRENT_MODE == SystemMode.DEGRADED:
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
        
        # Save input
        db_weather = crud.create_weather_input(db, schemas.WeatherInputCreate(
            temp=features.temp,
            humidity=features.humidity,
            wind=features.wind,
            veg_moisture=features.veg_moisture
        ))
        
        active_model = crud.get_active_model_version(db)
        
        # Save location
        db_location = None
        if features.country and features.country.strip() != "Unknown":
            db_location = crud.create_location(db, schemas.LocationCreate(
                name=f"{features.admin_region}, {features.country}",
                continent=None,
                country=features.country,
                admin_region=features.admin_region,
                local_region=None,
                latitude=features.latitude,
                longitude=features.longitude
            ))
        
        prediction_log = crud.create_prediction_log(db, schemas.RiskPredictionLogCreate(
            risk_score=result["risk_score"],
            risk_probability=result["risk_probability"],
            risk_level=result["risk_level"],
            baseline_score=result["baseline_score"],
            system_status=result.get("system_status").value if isinstance(result.get("system_status"), SystemMode) else result.get("system_status"),
            primary_drivers=", ".join(result["primary_drivers"]),
            weather_input_id=db_weather.id,
            model_version_id=active_model.id if active_model else None,
            location_id=db_location.id if db_location else None
        ))
        
        # Alerts via new service
        evaluate_and_create_alert(
            db=db,
            prediction_log_id=prediction_log.id,
            location_id=prediction_log.location_id,
            risk_score=result["risk_score"],
            primary_drivers=result["primary_drivers"]
        )
        
        return result
    except Exception as e:
        print(f"Prediction API Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Prediction Error")

@router.post("/reactive", response_model=ReactivePrediction)
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
            
        return {
            "is_fire": is_fire,
            "confidence": round(confidence, 4),
            "message": message
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
