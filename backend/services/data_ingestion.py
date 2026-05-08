import httpx
from datetime import datetime, timezone
from backend.config import settings
from backend.core.logger import logger

def _normalize_provider(provider: str) -> str:
    normalized = (provider or "open-meteo").strip().lower()
    aliases = {
        "openmeteo": "open-meteo",
        "open_meteo": "open-meteo",
        "openweathermap": "open-weather",
        "openweather": "open-weather",
        "open_weather": "open-weather",
    }
    return aliases.get(normalized, normalized)

async def fetch_realtime_weather(lat: float, lon: float) -> dict:
    """
    Fetch real-time weather data for a given latitude and longitude.
    Supports Open-Meteo (default, no key) and OpenWeatherMap (key required).
    """
    provider = _normalize_provider(settings.WEATHER_API_PROVIDER)
    api_key = settings.WEATHER_API_KEY
    
    logger.info(f"Fetching real-time weather using provider='{provider}' for coordinates ({lat}, {lon})")
    
    if provider == "open-weather":
        if not api_key:
            logger.error("OpenWeatherMap selected but WEATHER_API_KEY is not configured.")
            raise RuntimeError("Weather provider 'open-weather' requires an API key. Please configure WEATHER_API_KEY.")
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    elif provider == "open-meteo":
        # Default to Open-Meteo
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m"
    else:
        logger.error(f"Unsupported weather provider configured: {provider}")
        raise RuntimeError(f"Unsupported weather provider '{provider}'. Use 'open-meteo' or 'open-weather'.")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            data = response.json()
            
            if provider == "open-weather":
                main = data.get("main") or {}
                wind_payload = data.get("wind") or {}
                required = {
                    "main.temp": main.get("temp"),
                    "main.humidity": main.get("humidity"),
                    "wind.speed": wind_payload.get("speed"),
                }
                missing = [name for name, value in required.items() if value is None]
                if missing:
                    raise RuntimeError(f"Weather provider response missing required fields: {', '.join(missing)}")
                temp = required["main.temp"]
                humidity = required["main.humidity"]
                wind = required["wind.speed"] * 3.6 # m/s to km/h
            else:
                current = data.get("current", {})
                required = {
                    "current.temperature_2m": current.get("temperature_2m"),
                    "current.relative_humidity_2m": current.get("relative_humidity_2m"),
                    "current.wind_speed_10m": current.get("wind_speed_10m"),
                }
                missing = [name for name, value in required.items() if value is None]
                if missing:
                    raise RuntimeError(f"Weather provider response missing required fields: {', '.join(missing)}")
                temp = required["current.temperature_2m"]
                humidity = required["current.relative_humidity_2m"]
                wind = required["current.wind_speed_10m"] # km/h
            
            # Vegetation moisture proxy (NDVI substitute)
            # Logic: Higher temp and lower humidity lead to drier vegetation
            veg_moisture = max(0.01, min(1.0, (humidity / 100.0) * (20.0 / max(1.0, temp))))
            
            logger.info(f"Successfully fetched weather data: temp={temp}, humidity={humidity}, wind={wind}")
            
            return {
                "temp": float(temp),
                "humidity": float(humidity),
                "wind": float(wind),
                "veg_moisture": round(float(veg_moisture), 4),
                "provider": provider,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
    except RuntimeError:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch real-time weather data from {provider}: {e}")
        raise RuntimeError(f"Unable to reach external weather API ({provider}) for coordinates ({lat}, {lon}).")
