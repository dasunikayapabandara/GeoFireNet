import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = str(BASE_DIR / "models" / "RandomForest_latest.joblib")
DATA_DIR = str(BASE_DIR / "data")
THRESHOLDS_PATH = str(BASE_DIR / "models" / "risk_thresholds.json")
RISK_LEVELS_DEFAULT = {"Low": 0.3, "Moderate": 0.5, "High": 0.8}

class Settings(BaseSettings):
    ALERT_EXTREME_THRESHOLD: float = float(os.getenv("ALERT_EXTREME_THRESHOLD", 90.0))
    ALERT_HIGH_THRESHOLD: float = float(os.getenv("ALERT_HIGH_THRESHOLD", 75.0))
    ALERT_MODERATE_THRESHOLD: float = float(os.getenv("ALERT_MODERATE_THRESHOLD", 50.0))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./geofirenet.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()
