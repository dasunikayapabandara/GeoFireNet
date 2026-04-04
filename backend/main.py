from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
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

app = FastAPI(title="GeoFireNet Risk API v2")

@app.on_event("startup")
async def startup_event():
    logger.info("GeoFireNet API starting up...")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception processing {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
