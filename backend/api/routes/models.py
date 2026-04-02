from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.api.deps import get_db
from backend import schemas, crud

router = APIRouter()

@router.get("", response_model=list[schemas.ModelVersion])
async def get_models(db: Session = Depends(get_db)):
    """Fetch provenance logs of trained models."""
    return crud.get_model_versions(db)
