from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    # Because we're no longer using the direct DB dependent endpoint for the basic health check,
    # or we can keep it as is, let's keep DB check
    from backend.api.deps import get_db
    from fastapi import Depends
    from sqlalchemy.orm import Session
    from fastapi import Request
    
    # Actually, a simpler health check with manual DB dependency works.
    pass

# We will implement the actual logic by copying from main.py
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.api.deps import get_db

@router.get("")
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception:
        return {"status": "degraded", "database": "disconnected"}
