from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
import os

from backend.api.deps import get_predictor, get_db
from backend.database import SessionLocal
from backend import schemas, crud
from backend.services.prediction_service import RiskPredictor
from backend.services.alert_service import evaluate_and_create_alert
from backend.core.logger import logger

router = APIRouter()

async def _background_db_save(features: schemas.PredictionRequest, result: dict, current_mode_value: str):
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
        
        alert_record = await evaluate_and_create_alert(
            db=db, prediction_log_id=prediction_log.id, location_id=prediction_log.location_id,
            risk_score=result["risk_score"], risk_level=result["risk_level"],
            system_status=current_mode_value, primary_drivers=result["primary_drivers"]
        )
        if alert_record and getattr(alert_record, "id", None):
            logger.info(f"Alert {alert_record.id} triggered and broadcasted in background.")
        logger.info(f"Successfully tracked prediction_id={prediction_log.id} in background.")
    except Exception as e:
        logger.error(f"Background I/O Error: {e}", exc_info=True)
    finally:
        db.close()

@router.post("", response_model=schemas.PredictionResponse)
async def predict_risk(
    features: schemas.PredictionRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    predictor: RiskPredictor = Depends(get_predictor)
):
    current_mode = schemas.SystemMode.PRODUCTION
        
    try:
        logger.info(f"Processing prediction request for region={features.admin_region}, country={features.country}")
        
        # Ingestion Flow
        if features.temp is None or features.humidity is None or features.wind is None or features.veg_moisture is None:
            from backend.services.data_ingestion import fetch_realtime_weather
            logger.info("Missing environmental features. Fetching real-time weather data.")
            real_data = await fetch_realtime_weather(features.latitude, features.longitude)
            
            features.temp = features.temp if features.temp is not None else real_data["temp"]
            features.humidity = features.humidity if features.humidity is not None else real_data["humidity"]
            features.wind = features.wind if features.wind is not None else real_data["wind"]
            features.veg_moisture = features.veg_moisture if features.veg_moisture is not None else real_data["veg_moisture"]

        # Delegate to Prediction Engine
        result = predictor.predict(
            temp=features.temp,
            humidity=features.humidity,
            wind=features.wind,
            veg_moisture=features.veg_moisture
        )
        
        # Get Model Version Name from DB
        active_model = crud.get_active_model_version(db)
        version_name = active_model.version_name if active_model else "Frozen Model v1.0"

        # Notify UI immediately if high risk
        alert_flag = result["risk_level"] in ["High", "Extreme"]
        
        # Offload database writes
        # Note: result["key_drivers"] was renamed from primary_drivers
        background_result = {**result, "primary_drivers": result["key_drivers"]}
        background_tasks.add_task(_background_db_save, features, background_result, current_mode.value)
        
        return schemas.PredictionResponse(
            risk_score=result["risk_score"],
            risk_probability=result["risk_probability"],
            confidence=result["confidence"],
            risk_level=result["risk_level"],
            baseline_score=result["baseline_score"],
            baseline_level=result["baseline_level"],
            key_drivers=result["key_drivers"],
            system_status=current_mode,
            alert_triggered=alert_flag,
            location=schemas.PredictionLocation(
                country=features.country,
                admin_region=features.admin_region,
                latitude=features.latitude,
                longitude=features.longitude
            ),
            model_version=version_name,
            timestamp=datetime.utcnow()
        )
    except RuntimeError as e:
        if "Model not trained" in str(e):
            raise HTTPException(status_code=503, detail="Model not trained. Run training pipeline.")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction API Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Prediction Error")


