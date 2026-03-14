import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
DATA_DIR = BASE_DIR / "data"

# Create directories if they don't exist
os.makedirs(ARTIFACTS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# File Paths
DATASET_PATH = DATA_DIR / "wildfire_synthetic_dataset.csv"
MODEL_PATH = ARTIFACTS_DIR / "model.pkl"
EVAL_RESULTS_PATH = ARTIFACTS_DIR / "evaluation_results.json"
THRESHOLDS_PATH = ARTIFACTS_DIR / "thresholds.json"
CONFUSION_MATRIX_PATH = ARTIFACTS_DIR / "confusion_matrix.png"
FEATURE_IMPORTANCE_PATH = ARTIFACTS_DIR / "feature_importance.png"

# Model Configuration
RANDOM_SEED = 42
TEST_SIZE = 0.2

# Feature Definitions
NUMERICAL_FEATURES = ["temp", "humidity", "wind", "veg_moisture"]
# List of engineered features if added later
ENGINEERED_FEATURES = ["temp_wind_interaction"] 

# Features expected by the raw API input
RAW_FEATURES = ["temp", "humidity", "wind", "veg_moisture"]

TARGET_COLUMN = "fire_risk_class" # 1 for High Risk (Fire), 0 for Low/Moderate Risk

# Risk Categories based on probabilities
RISK_LEVELS_DEFAULT = {
    "Low": 0.3,
    "Moderate": 0.5,
    "High": 0.8,
    "Extreme": 1.0 # Max boundary, extreme triggers >= High threshold with specific conditions
}
