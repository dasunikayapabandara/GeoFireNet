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
