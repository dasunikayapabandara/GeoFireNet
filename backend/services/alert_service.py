from sqlalchemy.orm import Session
from backend.config import settings
from backend import schemas, crud
from backend.core.logger import logger

def evaluate_and_create_alert(db: Session, prediction_log_id: int, location_id: int, risk_score: float, risk_level: str, system_status: str, primary_drivers: list[str]) -> schemas.Alert | None:
    """
    Evaluates a prediction score and automatically generates an alert if thresholds are met.
    Only generates alerts for High or Extreme risk levels originating from real PRODUCTION predictions.
    """
    if system_status != "PRODUCTION":
        logger.info(f"Skipping alert generation for non-production prediction (status: {system_status})")
        return None
        
    if risk_level not in ["High", "Extreme"]:
        return None
        
    severity = risk_level.lower()
        
    driver_str = ", ".join(primary_drivers) if primary_drivers else "Algorithmic rules"
    alert = crud.create_alert(db, schemas.AlertCreate(
        prediction_id=prediction_log_id,
        location_id=location_id,
        risk_score=risk_score,
        severity=severity,
        alert_message=f"Automated risk detection flag: {severity.upper()}. Immediate review recommended.",
        key_drivers=driver_str
    ))
    logger.warning(f"Automated Alert Generated: {severity.upper()} severity flag placed on Prediction LOG_ID={prediction_log_id}")
    return alert
