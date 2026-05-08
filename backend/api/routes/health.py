from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.api.deps import get_db, get_predictor

router = APIRouter()

@router.get("")
async def get_health():
    """Liveness check for pure uptime."""
    return {"status": "ok", "version": "v2.0.0"}

@router.get("/db")
async def get_db_health(db: Session = Depends(get_db)):
    """Readiness check validating the relational database connection successfully executes basic syntax."""
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "service": "database"}
    except Exception as e:
        return {"status": "degraded", "service": "database", "error": str(e)}

@router.get("/model")
async def get_model_health(predictor = Depends(get_predictor)):
    """Diagnostic check confirming the ML inference artifacts are loaded."""
    model_loaded = getattr(predictor, "model", None) is not None
    thresholds_loaded = getattr(predictor, "thresholds", None) is not None
    status = "healthy" if model_loaded and thresholds_loaded else "degraded"
    return {
        "status": status,
        "service": "model",
        "model_loaded": model_loaded,
        "thresholds_loaded": thresholds_loaded
    }
