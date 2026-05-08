from fastapi import APIRouter, HTTPException, Query
from backend.services.data_ingestion import fetch_realtime_weather, _normalize_provider
from backend.core.logger import logger
from backend.config import settings

router = APIRouter()

@router.get("/current")
async def get_current_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """
    Fetch real-time weather data for a specific location.
    Used by the dashboard to show environmental context before prediction.
    """
    try:
        weather_data = await fetch_realtime_weather(lat, lon)
        return {
            "status": "success",
            "data": weather_data,
            "provider": _normalize_provider(settings.WEATHER_API_PROVIDER)
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Weather API Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Weather Service Error")

@router.get("/status")
async def get_weather_status():
    """Check if weather ingestion is configured correctly."""
    provider = _normalize_provider(settings.WEATHER_API_PROVIDER)
    has_key = bool(settings.WEATHER_API_KEY)
    
    status = "operational"
    if provider == "open-weather" and not has_key:
        status = "not_configured"
        
    return {
        "provider": provider,
        "status": status,
        "api_key_configured": has_key,
        "refresh_interval": settings.WEATHER_REFRESH_INTERVAL
    }
