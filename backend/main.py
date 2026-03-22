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
        
        # Get active model version to link providence
        active_model = crud.get_active_model_version(db)
        
        prediction_log = crud.create_prediction_log(db, schemas.RiskPredictionLogCreate(
            risk_score=result["risk_score"],
            risk_probability=result["risk_probability"],
            risk_level=result["risk_level"],
            baseline_score=result["baseline_score"],
            system_status=result.get("system_status"),
            primary_drivers=", ".join(result["primary_drivers"]),
            weather_input_id=db_weather.id,
            model_version_id=active_model.id if active_model else None
        ))
        
        # --- Auto-generate Alerts for High Risk ---
        if result["risk_level"] in ["High", "Extreme"]:
            crud.create_alert(db, schemas.AlertCreate(
                prediction_id=prediction_log.id,
                alert_level=result["risk_level"],
                message=f"Automatic {result['risk_level']} alert triggered by model parameters: {', '.join(result['primary_drivers'])}"
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
async def get_history(limit: int = 50, country: str = None, admin_region: str = None, db: Session = Depends(get_db)):
    """Fetch the latest predictions saved in the database, with optional global filtering."""
    try:
        return crud.get_prediction_history(db, limit=limit, country=country, admin_region=admin_region)
    except Exception as e:
        print(f"History API Error: {e}")
        raise HTTPException(status_code=500, detail="Database lookup failed")

@app.get("/detections", response_model=list[schemas.ActiveDetectionLog])
async def get_active_detections(limit: int = 100, country: str = None, admin_region: str = None, db: Session = Depends(get_db)):
    """Fetch confirmed active fires globally or by region."""
    try:
        return crud.get_active_detections(db, limit=limit, country=country, admin_region=admin_region)
    except Exception as e:
        print(f"Detection API Error: {e}")
        raise HTTPException(status_code=500, detail="Database lookup failed")

@app.post("/detections", response_model=schemas.ActiveDetectionLog)
async def create_active_detection(detection: schemas.ActiveDetectionLogCreate, db: Session = Depends(get_db)):
    """Ingest a new confirmed active fire detection (e.g., from MODIS feed)."""
    return crud.create_active_detection(db, detection)

@app.get("/alerts", response_model=list[schemas.Alert])
async def get_alerts(limit: int = 20, db: Session = Depends(get_db)):
    """Fetch recent automated alerts."""
    return crud.get_recent_alerts(db, limit=limit)

@app.get("/models", response_model=list[schemas.ModelVersion])
async def get_models(db: Session = Depends(get_db)):
    """Fetch provenance logs of trained models."""
    return crud.get_model_versions(db)

@app.get("/analytics/global_summary")
async def get_global_summary(country: str = None, admin_region: str = None, db: Session = Depends(get_db)):
    """Global Analytics Summary endpoint combining predicted and active data."""
    from sqlalchemy import func
    from backend import models
    try:
        # Build base queries
        pred_q = db.query(models.RiskPredictionLog.risk_level, func.count(models.RiskPredictionLog.id))
        det_q = db.query(models.ActiveDetectionLog.containment_status, func.count(models.ActiveDetectionLog.id))
        
        # Apply hierarchical filters if requested
        if country or admin_region:
            pred_q = pred_q.join(models.Location, models.RiskPredictionLog.location_id == models.Location.id)
            det_q = det_q.join(models.Location, models.ActiveDetectionLog.location_id == models.Location.id)
            if country:
                pred_q = pred_q.filter(models.Location.country == country)
                det_q = det_q.filter(models.Location.country == country)
            if admin_region:
                pred_q = pred_q.filter(models.Location.admin_region == admin_region)
                det_q = det_q.filter(models.Location.admin_region == admin_region)

        # Execute
        pred_results = pred_q.group_by(models.RiskPredictionLog.risk_level).all()
        det_results = det_q.group_by(models.ActiveDetectionLog.containment_status).all()
        
        return {
            "predictions_summary": [{"level": r[0], "count": r[1]} for r in pred_results],
            "active_detections_summary": [{"status": r[0], "count": r[1]} for r in det_results]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        return {"status": "degraded", "database": "disconnected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
