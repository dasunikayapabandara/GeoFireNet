from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api.deps import get_db
from backend import schemas, crud
from backend.core.logger import logger

router = APIRouter()

@router.get("", response_model=list[schemas.ActiveDetectionLog])
async def get_active_detections(limit: int = 100, country: str = None, admin_region: str = None, db: Session = Depends(get_db)):
    """Fetch confirmed active fires globally or by region."""
    try:
        return crud.get_active_detections(db, limit=limit, country=country, admin_region=admin_region)
    except Exception as e:
        logger.error(f"Detection API Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Database lookup failed")

@router.post("", response_model=schemas.ActiveDetectionLog)
async def create_active_detection(detection: schemas.ActiveDetectionLogCreate, db: Session = Depends(get_db)):
    """Ingest a new confirmed active fire detection (e.g., from MODIS feed)."""
    return crud.create_active_detection(db, detection)
