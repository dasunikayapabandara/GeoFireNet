from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.core.logger import logger

# Import routers from the new structure
from backend.api.routes import (
    predict,
    history,
    detections,
    alerts,
    models,
    analytics,
    health
)
from backend.database import SessionLocal
from backend.api.deps import get_db, get_predictor

app = FastAPI(title="GeoFireNet Risk API v2")

@app.on_event("startup")
async def startup_event():
    logger.info("GeoFireNet API starting up...")
    # Log model readiness
    predictor = get_predictor()
    if getattr(predictor, "is_mock", False):
        logger.warning("Predictor is running in MOCK mode.")
    else:
        logger.info("Predictor ML artifacts loaded successfully.")
    
    # Log DB connectivity
    db = SessionLocal()
    try:
        db.execute(text("SELECT 1"))
        logger.info("Database connection verified successfully.")
    except Exception as e:
        logger.error(f"Database connection failed at startup: {e}")
    finally:
        db.close()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation Error on {request.method} {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": "Payload validation failed", "errors": exc.errors()},
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP Error {exc.status_code} on {request.method} {request.url}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception processing {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "error_type": type(exc).__name__},
    )

# Allow CORS for React Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Application startup and logic is handled within routers
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(detections.router, prefix="/detections", tags=["Detections"])
app.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
app.include_router(models.router, prefix="/models", tags=["Models Overview"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(health.router, prefix="/health", tags=["Health"])

@app.get("/system/status", tags=["Health"])
async def get_system_status(db: Session = Depends(get_db), predictor = Depends(get_predictor)):
    """Aggregated system layout mapping overall operational readiness."""
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"/system/status database check failed: {e}")
        db_status = "degraded"
        
    model_status = "healthy" if not getattr(predictor, "is_mock", False) else "degraded"
    status_code = "healthy" if db_status == "healthy" and model_status == "healthy" else "degraded"
    
    return {
        "status": status_code,
        "components": {
            "database": db_status,
            "model": model_status
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
