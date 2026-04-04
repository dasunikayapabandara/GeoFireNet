from pydantic import BaseModel, ConfigDict, field_validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

class SystemMode(str, Enum):
    PRODUCTION = "PRODUCTION"
    SIMULATION = "SIMULATION"
    DEGRADED = "DEGRADED"

class PredictionRequest(BaseModel):
    temp: float
    humidity: float
    wind: float
    veg_moisture: float
    country: str = "Unknown"
    admin_region: str = "Unknown"
    latitude: float = 0.0
    longitude: float = 0.0

    @field_validator('temp')
    @classmethod
    def clamp_temp(cls, v):
        if v < -20.0 or v > 60.0:
            return max(-20.0, min(v, 60.0))
        return v

    @field_validator('humidity')
    @classmethod
    def clamp_humidity(cls, v):
        if v < 0.0 or v > 100.0:
            return max(0.0, min(v, 100.0))
        return v

    @field_validator('wind')
    @classmethod
    def clamp_wind(cls, v):
        if v < 0.0 or v > 150.0:
            return max(0.0, min(v, 150.0))
        return v

    @field_validator('veg_moisture')
    @classmethod
    def clamp_veg(cls, v):
        if v < 0.0 or v > 1.0:
            return max(0.0, min(v, 1.0))
        return v

    @field_validator('latitude')
    @classmethod
    def clamp_lat(cls, v):
        if v < -90.0 or v > 90.0:
            return max(-90.0, min(v, 90.0))
        return v

    @field_validator('longitude')
    @classmethod
    def clamp_long(cls, v):
        if v < -180.0 or v > 180.0:
            return max(-180.0, min(v, 180.0))
        return v

class PredictionResponse(BaseModel):
    risk_score: float
    risk_probability: float
    risk_level: str
    baseline_score: float
    baseline_level: str
    explanation: List[str]
    system_status: SystemMode
    alert_triggered: bool
    saved_prediction_id: Optional[int] = None
    location_id: Optional[int] = None
    timestamp: datetime

class ReactivePrediction(BaseModel):
    is_fire: bool
    confidence: float
    message: str

# -----------------
# We define ORM schemas here separating them from the raw API input schemas in main.py
# -----------------

class LocationBase(BaseModel):
    name: Optional[str] = None
    continent: Optional[str] = None
    country: Optional[str] = None
    admin_region: Optional[str] = None
    local_region: Optional[str] = None
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


class ModelVersionBase(BaseModel):
    version_name: str
    accuracy_metrics: Optional[str] = None
    is_active: bool = False

class ModelVersionCreate(ModelVersionBase):
    pass

class ModelVersion(ModelVersionBase):
    id: int
    training_date: datetime
    model_config = ConfigDict(from_attributes=True)


class AlertBase(BaseModel):
    severity: str
    alert_message: str
    key_drivers: Optional[str] = None

class AlertCreate(AlertBase):
    prediction_id: int
    location_id: Optional[int] = None
    risk_score: float

class AlertUpdate(BaseModel):
    status: str

class Alert(AlertBase):
    id: int
    prediction_id: int
    location_id: Optional[int] = None
    risk_score: float
    status: str
    triggered_at: datetime
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    location: Optional[Location] = None
    
    model_config = ConfigDict(from_attributes=True)


class SystemLogBase(BaseModel):
    action: str
    details: Optional[str] = None

class SystemLogCreate(SystemLogBase):
    pass

class SystemLog(SystemLogBase):
    id: int
    timestamp: datetime
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
    model_version_id: Optional[int] = None

class RiskPredictionLog(RiskPredictionLogBase):
    id: int
    timestamp: datetime
    location_id: Optional[int] = None
    weather_input_id: int
    model_version_id: Optional[int] = None
    
    # Nested for deep history return
    weather_input: WeatherInput
    location: Optional[Location] = None
    model_version: Optional[ModelVersion] = None
    alert: Optional[Alert] = None
    
    model_config = ConfigDict(from_attributes=True)


class ActiveDetectionLogBase(BaseModel):
    detection_source: str
    confidence_score: float
    fire_radiative_power_mw: Optional[float] = None
    containment_status: str = "Active"

class ActiveDetectionLogCreate(ActiveDetectionLogBase):
    location_id: int

class ActiveDetectionLog(ActiveDetectionLogBase):
    id: int
    timestamp: datetime
    location_id: int
    location: Optional[Location] = None
    
    model_config = ConfigDict(from_attributes=True)

