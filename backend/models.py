from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=True) # e.g. "Sacramento", or null if just coords
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Relationships
    predictions = relationship("RiskPredictionLog", back_populates="location")


class WeatherInput(Base):
    """Stores the exact telemetry used to generate a risk score."""
    __tablename__ = "weather_inputs"

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

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # The actual outputs
    risk_score = Column(Float, nullable=False) # Scaled score 0-100
    risk_probability = Column(Float, nullable=False) # Raw ML output
    risk_level = Column(String, nullable=False) # e.g., "High", "Extreme"
    baseline_score = Column(Float, nullable=False) # Reference heuristic
    system_status = Column(String, nullable=False) # Production vs Mock

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
    alert = relationship("Alert", back_populates="prediction", uselist=False)


class Alert(Base):
    """Automatically generated alerts for high-risk predictions."""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    prediction_id = Column(Integer, ForeignKey("risk_prediction_logs.id"), nullable=False)
    alert_level = Column(String, nullable=False) # "High" or "Extreme"
    message = Column(String, nullable=False)
    
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_by = Column(String, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)

    # Relationships
    prediction = relationship("RiskPredictionLog", back_populates="alert")


class SystemLog(Base):
    """General system audit logs."""
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    action = Column(String, nullable=False) # e.g., "STARTUP", "REACTIVE_PREDICT"
    details = Column(String, nullable=True)
