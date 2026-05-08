from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api.deps import get_db
from backend import schemas, crud
from backend.core.logger import logger

router = APIRouter()

@router.get("", response_model=list[schemas.RiskPredictionLog])
async def get_history(limit: int = 50, country: str = None, admin_region: str = None, db: Session = Depends(get_db)):
    """Fetch the latest predictions saved in the database, with optional global filtering."""
    try:
        return crud.get_prediction_history(db, limit=limit, country=country, admin_region=admin_region)
    except Exception as e:
        logger.error(f"History API Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Database lookup failed")

@router.delete("/{prediction_id}")
async def delete_history_item(prediction_id: int, db: Session = Depends(get_db)):
    """Delete a prediction log and its generated alert, if present."""
    try:
        deleted = crud.delete_prediction_log(db, prediction_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Prediction log not found")
        logger.info(f"Deleted prediction history item id={prediction_id}")
        return {"status": "deleted", "id": prediction_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"History delete API Error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete prediction log")
