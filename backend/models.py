from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
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

    # Note: For FYP, saving the actual strings stringified is fine since it's an array of drivers
    primary_drivers = Column(String, nullable=True) # E.g., "High Temperature, Strong Winds"

    # Relationships
    location = relationship("Location", back_populates="predictions")
    weather_input = relationship("WeatherInput", back_populates="prediction")
