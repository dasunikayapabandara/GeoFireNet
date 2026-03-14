from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

# -----------------
# We define ORM schemas here separating them from the raw API input schemas in main.py
# -----------------

class LocationBase(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class LocationCreate(LocationBase):
    pass

class Location(LocationBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class WeatherInputBase(BaseModel):
    temp: float
    humidity: float
    wind: float
    veg_moisture: float

class WeatherInputCreate(WeatherInputBase):
    pass

class WeatherInput(WeatherInputBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


class RiskPredictionLogBase(BaseModel):
    risk_score: float
    risk_probability: float
    risk_level: str
    baseline_score: float
    system_status: str
    primary_drivers: Optional[str] = None

class RiskPredictionLogCreate(RiskPredictionLogBase):
    location_id: Optional[int] = None
    weather_input_id: int

class RiskPredictionLog(RiskPredictionLogBase):
    id: int
    timestamp: datetime
    location_id: Optional[int] = None
    weather_input_id: int
    
    # Nested for deep history return
    weather_input: WeatherInput
    location: Optional[Location] = None
    
    model_config = ConfigDict(from_attributes=True)
