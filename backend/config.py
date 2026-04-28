import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Dict

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    SIMULATE_OUTAGE: bool = False
    WEATHER_API_KEY: str | None = os.getenv("WEATHER_API_KEY")

    # Directories and File Paths
    ARTIFACTS_DIR: str = str(BASE_DIR / "artifacts")
    MODEL_PATH: str = str(BASE_DIR / "artifacts" / "model.pkl")
    THRESHOLDS_PATH: str = str(BASE_DIR / "artifacts" / "risk_thresholds.json")
    EVAL_RESULTS_PATH: str = str(BASE_DIR / "artifacts" / "evaluation_results.json")
    CONFUSION_MATRIX_PATH: str = str(BASE_DIR / "artifacts" / "confusion_matrix.png")
    FEATURE_IMPORTANCE_PATH: str = str(BASE_DIR / "artifacts" / "feature_importance.png")
    FEATURE_IMPORTANCE_JSON_PATH: str = str(BASE_DIR / "artifacts" / "feature_importance.json")
    DATA_DIR: str = str(BASE_DIR / "data")
    DATASET_PATH: str = str(BASE_DIR / "data" / "dataset.csv")

    # Data generation & Pipeline constants
    TARGET_COLUMN: str = "is_fire_risk"
    RAW_FEATURES: List[str] = ["temp", "humidity", "wind", "veg_moisture"]
    RANDOM_SEED: int = 42
    TEST_SIZE: float = 0.2

    # Database
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "dasunika"
    db_password: str = "geofirenet_dev"
    db_name: str = "geofirenet_db"
    database_url_override: str | None = os.getenv("DATABASE_URL")

    @property
    def DATABASE_URL(self) -> str:
        if self.database_url_override:
            return self.database_url_override
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    @property
    def database_url(self) -> str:
        return self.DATABASE_URL

    # App Alert Thresholds
    ALERT_EXTREME_THRESHOLD: float = 90.0
    ALERT_HIGH_THRESHOLD: float = 75.0
    ALERT_MODERATE_THRESHOLD: float = 50.0

    # Fallback and Heuristic Constants
    MAX_TEMP: float = 50.0
    MIN_TEMP: float = 0.0
    MAX_HUMIDITY: float = 100.0
    MAX_WIND: float = 100.0
    MOCK_PENALTY_TEMP: float = 35.0
    MOCK_PENALTY_WIND: float = 60.0

    RISK_LEVELS_DEFAULT: Dict[str, float] = {"Low": 0.3, "Moderate": 0.5, "High": 0.8}

    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Module-level aliases for backward compatibility
ENVIRONMENT = settings.ENVIRONMENT
SIMULATE_OUTAGE = settings.SIMULATE_OUTAGE
WEATHER_API_KEY = settings.WEATHER_API_KEY
ARTIFACTS_DIR = settings.ARTIFACTS_DIR
MODEL_PATH = settings.MODEL_PATH
THRESHOLDS_PATH = settings.THRESHOLDS_PATH
EVAL_RESULTS_PATH = settings.EVAL_RESULTS_PATH
CONFUSION_MATRIX_PATH = settings.CONFUSION_MATRIX_PATH
FEATURE_IMPORTANCE_PATH = settings.FEATURE_IMPORTANCE_PATH
FEATURE_IMPORTANCE_JSON_PATH = settings.FEATURE_IMPORTANCE_JSON_PATH
DATA_DIR = settings.DATA_DIR
DATASET_PATH = settings.DATASET_PATH
TARGET_COLUMN = settings.TARGET_COLUMN
RAW_FEATURES = settings.RAW_FEATURES
RANDOM_SEED = settings.RANDOM_SEED
TEST_SIZE = settings.TEST_SIZE
RISK_LEVELS_DEFAULT = settings.RISK_LEVELS_DEFAULT
