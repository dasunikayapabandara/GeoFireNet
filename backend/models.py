from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, CheckConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=True) # e.g. "Sacramento", or null if just coords
    continent = Column(String, index=True, nullable=True)
    country = Column(String, index=True, nullable=True)
    admin_region = Column(String, index=True, nullable=True)
    local_region = Column(String, index=True, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Relationships
    predictions = relationship("RiskPredictionLog", back_populates="location")
    detections = relationship("ActiveDetectionLog", back_populates="location")


class WeatherInput(Base):
    """Stores the exact telemetry used to generate a risk score."""
    __tablename__ = "weather_inputs"
    __table_args__ = (
        CheckConstraint("temp >= -20 AND temp <= 60", name="ck_weather_temp_range"),
        CheckConstraint("humidity >= 0 AND humidity <= 100", name="ck_weather_humidity_range"),
        CheckConstraint("wind >= 0 AND wind <= 150", name="ck_weather_wind_range"),
        CheckConstraint("veg_moisture >= 0 AND veg_moisture <= 1", name="ck_weather_veg_moisture_range"),
    )

    id = Column(Integer, primary_key=True, index=True)
    temp = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    wind = Column(Float, nullable=False)
    veg_moisture = Column(Float, nullable=False)
    
    # Relationships
    prediction = relationship("RiskPredictionLog", back_populates="weather_input", uselist=False)

class ModelVersion(Base):
    """Tracks ML model artifacts to ensure provenance for predictions."""
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    version_name = Column(String, unique=True, index=True, nullable=False) # e.g. "logistic_regression_v1"
    training_date = Column(DateTime, default=datetime.utcnow)
    accuracy_metrics = Column(String, nullable=True) # JSON dumped string of ROC-AUC, Recall, etc.
    is_active = Column(Boolean, default=False)

    # Relationships
    predictions = relationship("RiskPredictionLog", back_populates="model_version")

class RiskPredictionLog(Base):
    """Master log of all generated predictions for historical tracking."""
    __tablename__ = "risk_prediction_logs"
    __table_args__ = (
        CheckConstraint("risk_score >= 0 AND risk_score <= 100", name="ck_prediction_risk_score_range"),
        CheckConstraint("risk_probability >= 0 AND risk_probability <= 1", name="ck_prediction_risk_probability_range"),
        CheckConstraint("risk_level IN ('Low', 'Moderate', 'High', 'Extreme')", name="ck_prediction_risk_level"),
        CheckConstraint("baseline_score >= 0 AND baseline_score <= 100", name="ck_prediction_baseline_score_range"),
        Index("ix_prediction_level_timestamp", "risk_level", "timestamp"),
        Index("ix_prediction_location_timestamp", "location_id", "timestamp"),
    )

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # The actual outputs
    risk_score = Column(Float, nullable=False) # Scaled score 0-100
    risk_probability = Column(Float, nullable=False) # Raw ML output
    risk_level = Column(String, nullable=False) # e.g., "High", "Extreme"
    baseline_score = Column(Float, nullable=False) # Reference heuristic
    system_status = Column(String, nullable=False) # Production, Simulation, or Degraded

    # Foreign Keys
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    weather_input_id = Column(Integer, ForeignKey("weather_inputs.id"), nullable=False)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=True)

    # Note: For FYP, saving the actual strings stringified is fine since it's an array of drivers
    primary_drivers = Column(String, nullable=True) # E.g., "High Temperature, Strong Winds"

    # Relationships
    location = relationship("Location", back_populates="predictions")
    weather_input = relationship("WeatherInput", back_populates="prediction")
    model_version = relationship("ModelVersion", back_populates="predictions")
    alert = relationship("Alert", back_populates="prediction", uselist=False, cascade="all, delete-orphan")


class Alert(Base):
    """Automatically generated actionable alerts for high-risk predictions."""
    __tablename__ = "alerts"
    __table_args__ = (
        CheckConstraint("risk_score >= 0 AND risk_score <= 100", name="ck_alert_risk_score_range"),
        CheckConstraint("risk_level IN ('Low', 'Moderate', 'High', 'Extreme')", name="ck_alert_risk_level"),
        CheckConstraint("severity IN ('moderate', 'high', 'extreme')", name="ck_alert_severity"),
        CheckConstraint("status IN ('active', 'acknowledged', 'resolved')", name="ck_alert_status"),
        Index("ix_alert_status_severity_triggered", "status", "severity", "triggered_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    
    # Core Relationships
    prediction_id = Column(Integer, ForeignKey("risk_prediction_logs.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    
    # Denormalized parameters for ultra-fast frontend rendering
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False) # 'Low', 'Moderate', 'High', 'Extreme'
    severity = Column(String, nullable=False) # 'moderate', 'high', 'extreme'
    alert_message = Column(String, nullable=False)
    key_drivers = Column(String, nullable=True) # Summary explanation
    
    # Lifecycle Status
    status = Column(String, default="active", index=True) # 'active', 'acknowledged', 'resolved'
    
    # Activity Timestamps
    triggered_at = Column(DateTime, default=datetime.utcnow, index=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    prediction = relationship("RiskPredictionLog", back_populates="alert")
    location = relationship("Location")


class SystemLog(Base):
    """General system audit logs."""
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    action = Column(String, nullable=False) # e.g., "STARTUP", "REACTIVE_PREDICT"
    details = Column(String, nullable=True)


class ActiveDetectionLog(Base):
    """Logs for confirmed active fires sourced from external feeds."""
    __tablename__ = "active_detection_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    
    detection_source = Column(String, nullable=False) # 'MODIS', 'VIIRS', 'Local Sensor'
    confidence_score = Column(Float, nullable=False)
    fire_radiative_power_mw = Column(Float, nullable=True)
    containment_status = Column(String, default="Active") # 'Active', 'Contained'
    
    # Relationships
    location = relationship("Location", back_populates="detections")

class SystemSettings(Base):
    """Dynamic configuration settings for the backend."""
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String, unique=True, index=True, nullable=False)
    setting_value = Column(String, nullable=False)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
