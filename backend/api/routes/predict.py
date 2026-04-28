from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
import os

from backend.api.deps import get_db, get_predictor
from backend.database import SessionLocal
from backend import schemas, crud
from backend.services.prediction_service import RiskPredictor
from backend.services.alert_service import evaluate_and_create_alert
from backend.core.logger import logger
from backend.config import settings

router = APIRouter()

def _background_db_save(features: schemas.PredictionRequest, result: dict, current_mode_value: str):
    """Executes database tracking outside of the HTTP event loop."""
    db: Session = SessionLocal()
    try:
        db_weather = crud.create_weather_input(db, schemas.WeatherInputCreate(
            temp=features.temp, humidity=features.humidity,
            wind=features.wind, veg_moisture=features.veg_moisture
        ))
        active_model = crud.get_active_model_version(db)
        db_location = None
        if features.country and features.country.strip() != "Unknown":
            db_location = crud.create_location(db, schemas.LocationCreate(
                name=f"{features.admin_region}, {features.country}", continent=None,
                country=features.country, admin_region=features.admin_region,
                local_region=None, latitude=features.latitude, longitude=features.longitude
            ))
        
        prediction_log = crud.create_prediction_log(db, schemas.RiskPredictionLogCreate(
            risk_score=result["risk_score"], risk_probability=result["risk_probability"],
            risk_level=result["risk_level"], baseline_score=result["baseline_score"],
            system_status=current_mode_value, primary_drivers=", ".join(result["primary_drivers"]),
            weather_input_id=db_weather.id, model_version_id=active_model.id if active_model else None,
            location_id=db_location.id if db_location else None
        ))
        
        alert_record = evaluate_and_create_alert(
            db=db, prediction_log_id=prediction_log.id, location_id=prediction_log.location_id,
            risk_score=result["risk_score"], primary_drivers=result["primary_drivers"]
        )
        if alert_record and getattr(alert_record, "id", None):
            logger.info(f"Alert {alert_record.id} triggered in background.")
        logger.info(f"Successfully tracked prediction_id={prediction_log.id} in background.")
    except Exception as e:
        logger.error(f"Background I/O Error: {e}", exc_info=True)
    finally:
        db.close()

@router.post("", response_model=schemas.PredictionResponse)
async def predict_risk(
    features: schemas.PredictionRequest, 
    background_tasks: BackgroundTasks,
    predictor: RiskPredictor = Depends(get_predictor)
):
    # Determine mode
    current_mode = schemas.SystemMode.PRODUCTION
    if os.environ.get("SIMULATE_OUTAGE") == "1":
        current_mode = schemas.SystemMode.DEGRADED
    elif predictor.is_mock:
        current_mode = schemas.SystemMode.SIMULATION

    if current_mode == schemas.SystemMode.DEGRADED:
        return schemas.PredictionResponse(
            risk_score=0.0,
            risk_probability=0.0,
            risk_level="Unknown",
            baseline_score=0.0,
            baseline_level="Unknown",
            explanation=["System Offline"],
            system_status=current_mode,
            alert_triggered=False,
            timestamp=datetime.utcnow()
        )
        
    try:
        logger.info(f"Processing prediction request for mode={current_mode.value}, region={features.admin_region}, country={features.country}")
        # Delegate to Prediction Engine
        result = predictor.predict(
            temp=features.temp,
            humidity=features.humidity,
            wind=features.wind,
            veg_moisture=features.veg_moisture
        )
        logger.info(f"Prediction completed: risk_score={result['risk_score']}, level={result['risk_level']}")
        
        # Fast calculate if alert would trigger theoretically to notify UI immediately
        alert_flag = result["risk_score"] >= settings.ALERT_MODERATE_THRESHOLD  # Moderate or higher threshold triggers evaluations
        
        # Offload all database writes
        background_tasks.add_task(_background_db_save, features, result, current_mode.value)
        
        return schemas.PredictionResponse(
            risk_score=result["risk_score"],
            risk_probability=result["risk_probability"],
            risk_level=result["risk_level"],
            baseline_score=result["baseline_score"],
            baseline_level=result["baseline_level"],
            explanation=result["primary_drivers"],
            system_status=current_mode,
            alert_triggered=alert_flag,
            saved_prediction_id=None,
            location_id=None,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Prediction API Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Prediction Error")

@router.post("/reactive", response_model=schemas.ReactivePrediction)
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
