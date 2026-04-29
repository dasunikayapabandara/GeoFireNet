from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api.deps import get_db
from backend import schemas, crud, models
from backend.core.logger import logger

router = APIRouter()

@router.get("", response_model=list[schemas.Alert])
async def get_alerts(limit: int = 50, status: str = None, severity: str = None, country: str = None, db: Session = Depends(get_db)):
    """Fetch recent automated alerts with extensive operational filtering."""
    logger.info(f"Fetching alerts: limit={limit}, status={status}, severity={severity}, country={country}")
    return crud.get_alerts(db, limit=limit, status=status, severity=severity, country=country)

@router.get("/summary")
async def get_alerts_summary(db: Session = Depends(get_db)):
    """Return counts for the top-level KPI cards with basic in-memory caching."""
    import time
    if hasattr(router, "_summary_cache") and time.time() - getattr(router, "_summary_timestamp", 0) < 60:
        return router._summary_cache

    total_active = db.query(models.Alert).filter(models.Alert.status == 'active').count()
    high_active = db.query(models.Alert).filter(models.Alert.status == 'active', models.Alert.severity == 'high').count()
    extreme_active = db.query(models.Alert).filter(models.Alert.status == 'active', models.Alert.severity == 'extreme').count()
    
    from datetime import datetime, date
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_count = db.query(models.Alert).filter(models.Alert.triggered_at >= today_start).count()
    
    result = {
        "active_total": total_active,
        "active_high": high_active,
        "active_extreme": extreme_active,
        "generated_today": today_count
    }
    router._summary_cache = result
    router._summary_timestamp = time.time()
    return result

@router.get("/{alert_id}", response_model=schemas.Alert)
async def get_alert(alert_id: int, db: Session = Depends(get_db)):
    """Fetch a specific alert by ID."""
    alert = crud.get_alert(db, alert_id)
    if not alert:
        logger.warning(f"Failed to fetch alert {alert_id}: Not found")
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.patch("/{alert_id}/acknowledge", response_model=schemas.Alert)
async def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    """Acknowledge an alert to indicate operators have seen it."""
    alert = crud.update_alert_status(db, alert_id, "acknowledged")
    if not alert:
        logger.warning(f"Failed to acknowledge alert {alert_id}: Not found")
        raise HTTPException(status_code=404, detail="Alert not found")
    logger.info(f"Alert {alert_id} acknowledged by operator.")
    return alert

@router.patch("/{alert_id}/resolve", response_model=schemas.Alert)
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Mark an alert as resolved."""
    alert = crud.update_alert_status(db, alert_id, "resolved")
    if not alert:
        logger.warning(f"Failed to resolve alert {alert_id}: Not found")
        raise HTTPException(status_code=404, detail="Alert not found")
    logger.info(f"Alert {alert_id} resolved.")
    return alert
