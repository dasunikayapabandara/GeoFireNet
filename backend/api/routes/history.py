from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.api.deps import get_db
from backend import schemas, crud

router = APIRouter()

@router.get("", response_model=list[schemas.RiskPredictionLog])
async def get_history(limit: int = 50, country: str = None, admin_region: str = None, db: Session = Depends(get_db)):
    """Fetch the latest predictions saved in the database, with optional global filtering."""
    try:
        return crud.get_prediction_history(db, limit=limit, country=country, admin_region=admin_region)
    except Exception as e:
        print(f"History API Error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Database lookup failed")
