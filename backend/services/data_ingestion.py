import httpx
from backend.config import settings
from backend.core.logger import logger

async def fetch_realtime_weather(lat: float, lon: float) -> dict:
    """
    Fetch real-time weather data for a given latitude and longitude.
    Currently defaults to Open-Meteo, which does not require an API key.
    If WEATHER_API_KEY is provided in settings, it can be extended to use OpenWeatherMap.
    """
    api_key = settings.WEATHER_API_KEY
    
    # We use Open-Meteo as the default provider
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m"
    
    try:
        logger.info(f"Fetching real-time weather for coordinates ({lat}, {lon})")
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            data = response.json()
            
            current = data.get("current", {})
            temp = current.get("temperature_2m", 25.0)
            humidity = current.get("relative_humidity_2m", 50.0)
            wind = current.get("wind_speed_10m", 10.0) # returned in km/h
            
            # Veg moisture isn't provided by basic weather APIs. We use a placeholder.
            # NDVI proxy based on humidity and temp. High temp, low humidity -> low veg moisture
            veg_moisture = max(0.01, min(1.0, (humidity / 100.0) * (20.0 / max(1.0, temp))))
            
            logger.info(f"Successfully fetched weather data: temp={temp}, hum={humidity}, wind={wind}")
            
            return {
                "temp": temp,
                "humidity": humidity,
                "wind": wind,
                "veg_moisture": round(veg_moisture, 4)
            }
    except Exception as e:
        logger.error(f"Failed to fetch real-time weather data: {e}")
        # Raise an exception rather than returning a mock fallback, enforcing strict behavior
        raise RuntimeError(f"Unable to reach external weather API for coordinates ({lat}, {lon}).")
