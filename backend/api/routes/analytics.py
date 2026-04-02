from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api.deps import get_db
from backend import models

router = APIRouter()

@router.get("/global_summary")
async def get_global_summary(country: str = None, admin_region: str = None, db: Session = Depends(get_db)):
    """Global Analytics Summary endpoint combining predicted and active data."""
    from sqlalchemy import func
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
