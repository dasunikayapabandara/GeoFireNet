from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api.deps import get_db
from backend import schemas, crud, models

router = APIRouter()

@router.get("", response_model=list[schemas.Alert])
async def get_alerts(limit: int = 50, status: str = None, severity: str = None, country: str = None, db: Session = Depends(get_db)):
    """Fetch recent automated alerts with extensive operational filtering."""
    return crud.get_alerts(db, limit=limit, status=status, severity=severity, country=country)

@router.get("/summary")
async def get_alerts_summary(db: Session = Depends(get_db)):
    """Return counts for the top-level KPI cards."""
    total_active = db.query(models.Alert).filter(models.Alert.status == 'active').count()
    high_active = db.query(models.Alert).filter(models.Alert.status == 'active', models.Alert.severity == 'high').count()
    extreme_active = db.query(models.Alert).filter(models.Alert.status == 'active', models.Alert.severity == 'extreme').count()
    
    from datetime import datetime, date
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_count = db.query(models.Alert).filter(models.Alert.triggered_at >= today_start).count()
    
    return {
        "active_total": total_active,
        "active_high": high_active,
        "active_extreme": extreme_active,
        "generated_today": today_count
    }

@router.patch("/{alert_id}/acknowledge", response_model=schemas.Alert)
async def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    """Acknowledge an alert to indicate operators have seen it."""
    alert = crud.update_alert_status(db, alert_id, "acknowledged")
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.patch("/{alert_id}/resolve", response_model=schemas.Alert)
async def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    """Mark an alert as resolved."""
    alert = crud.update_alert_status(db, alert_id, "resolved")
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
