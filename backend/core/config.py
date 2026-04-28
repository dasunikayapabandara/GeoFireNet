import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import PostgresDsn, AnyUrl, ConfigDict

try:
    pass
except ImportError:
    pass
    pass

BASE_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODEL_PATH = str(ARTIFACTS_DIR / "model.pkl")
DATA_DIR = str(BASE_DIR / "data")
DATASET_PATH = str(BASE_DIR / "data" / "dataset.csv")
TARGET_COLUMN = "is_fire_risk"
RAW_FEATURES = ["temp", "humidity", "wind", "veg_moisture"]
RANDOM_SEED = 42
TEST_SIZE = 0.2
THRESHOLDS_PATH = str(ARTIFACTS_DIR / "risk_thresholds.json")
EVAL_RESULTS_PATH = str(ARTIFACTS_DIR / "evaluation_results.json")
CONFUSION_MATRIX_PATH = str(ARTIFACTS_DIR / "confusion_matrix.png")
FEATURE_IMPORTANCE_PATH = str(ARTIFACTS_DIR / "feature_importance.png")
RISK_LEVELS_DEFAULT = {"Low": 0.3, "Moderate": 0.5, "High": 0.8}

class Settings(BaseSettings):
    # App Settings
    ALERT_EXTREME_THRESHOLD: float = float(os.getenv("ALERT_EXTREME_THRESHOLD", 90.0))
    ALERT_HIGH_THRESHOLD: float = float(os.getenv("ALERT_HIGH_THRESHOLD", 75.0))
    ALERT_MODERATE_THRESHOLD: float = float(os.getenv("ALERT_MODERATE_THRESHOLD", 50.0))
    
    # Base configuration
    environment: str = os.getenv("ENVIRONMENT", "development")
    simulate_outage: bool = False

    # Database connection parameters
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "dasunika"
    db_password: str = "geofirenet_dev"
    db_name: str = "geofirenet_db"

    @property
    def DATABASE_URL(self) -> str:
        # Compatibility fallback for how it was used in `database.py`
        return self.database_url

    @property
    def database_url(self) -> str:
        # Check if environment specifies a direct DATABASE_URL
        if os.getenv("DATABASE_URL"):
            return os.getenv("DATABASE_URL")
        return f"postgresql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    model_config = SettingsConfigDict(
        env_file=os.path.join(BASE_DIR, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
