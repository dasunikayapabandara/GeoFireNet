import httpx
from backend.config import settings
from backend.core.logger import logger

async def fetch_realtime_weather(lat: float, lon: float) -> dict:
    """
    Fetch real-time weather data for a given latitude and longitude.
    Supports Open-Meteo (default, no key) and OpenWeatherMap (key required).
    """
    provider = settings.WEATHER_API_PROVIDER
    api_key = settings.WEATHER_API_KEY
    
    logger.info(f"Fetching real-time weather using provider='{provider}' for coordinates ({lat}, {lon})")
    
    if provider == "open-weather":
        if not api_key:
            logger.error("OpenWeatherMap selected but WEATHER_API_KEY is not configured.")
            raise RuntimeError("Weather provider 'open-weather' requires an API key. Please configure WEATHER_API_KEY.")
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    else:
        # Default to Open-Meteo
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=5.0)
            response.raise_for_status()
            data = response.json()
            
            if provider == "open-weather":
                temp = data.get("main", {}).get("temp", 25.0)
                humidity = data.get("main", {}).get("humidity", 50.0)
                wind = data.get("wind", {}).get("speed", 10.0) * 3.6 # m/s to km/h
            else:
                current = data.get("current", {})
                temp = current.get("temperature_2m", 25.0)
                humidity = current.get("relative_humidity_2m", 50.0)
                wind = current.get("wind_speed_10m", 10.0) # km/h
            
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
                "timestamp": httpx.utils.format_byte_size(0) # placeholder for actual response headers if needed
            }
    except Exception as e:
        logger.error(f"Failed to fetch real-time weather data from {provider}: {e}")
        raise RuntimeError(f"Unable to reach external weather API ({provider}) for coordinates ({lat}, {lon}).")
