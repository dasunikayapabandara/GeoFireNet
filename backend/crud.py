from sqlalchemy.orm import Session
from backend import models, schemas

def create_location(db: Session, location: schemas.LocationCreate):
    db_location = models.Location(
        name=location.name,
        latitude=location.latitude,
        longitude=location.longitude
    )
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

def create_weather_input(db: Session, inputs: schemas.WeatherInputCreate):
    db_inputs = models.WeatherInput(
        temp=inputs.temp,
        humidity=inputs.humidity,
        wind=inputs.wind,
        veg_moisture=inputs.veg_moisture
    )
    db.add(db_inputs)
    db.commit()
    db.refresh(db_inputs)
    return db_inputs

def create_prediction_log(db: Session, log: schemas.RiskPredictionLogCreate):
    db_log = models.RiskPredictionLog(
        risk_score=log.risk_score,
        risk_probability=log.risk_probability,
        risk_level=log.risk_level,
        baseline_score=log.baseline_score,
        system_status=log.system_status,
        primary_drivers=log.primary_drivers,
        location_id=log.location_id,
        weather_input_id=log.weather_input_id
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_prediction_history(db: Session, limit: int = 50):
    return db.query(models.RiskPredictionLog).order_by(models.RiskPredictionLog.timestamp.desc()).limit(limit).all()

# --- Model Versions ---
def create_model_version(db: Session, version: schemas.ModelVersionCreate):
    db_mv = models.ModelVersion(**version.model_dump())
    db.add(db_mv)
    db.commit()
    db.refresh(db_mv)
    return db_mv

def get_active_model_version(db: Session):
    return db.query(models.ModelVersion).filter(models.ModelVersion.is_active == True).first()

def get_model_versions(db: Session):
    return db.query(models.ModelVersion).order_by(models.ModelVersion.training_date.desc()).all()

# --- Alerts ---
def create_alert(db: Session, alert: schemas.AlertCreate):
    db_alert = models.Alert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_recent_alerts(db: Session, limit: int = 20):
    return db.query(models.Alert).order_by(models.Alert.timestamp.desc()).limit(limit).all()

def acknowledge_alert(db: Session, alert_id: int, user: str):
    db_alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if db_alert:
        from datetime import datetime
        db_alert.is_acknowledged = True
        db_alert.acknowledged_by = user
        db_alert.acknowledged_at = datetime.utcnow()
        db.commit()
        db.refresh(db_alert)
    return db_alert

# --- System Logs ---
def create_system_log(db: Session, log: schemas.SystemLogCreate):
    db_log = models.SystemLog(**log.model_dump())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# --- Analytics / Locations ---
def get_all_locations(db: Session):
    return db.query(models.Location).all()

