import joblib
import json
import os
from backend.config import settings
from backend import config

def save_model(pipeline, path=config.MODEL_PATH):
    """Save the scikit-learn pipeline (preprocessing + model) artifact."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    joblib.dump(pipeline, path)
    print(f"Model artifact saved safely to: {path}")

def load_model(path=config.MODEL_PATH):
    """Load the scikit-learn pipeline artifact."""
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Model artifact not found at: {path}\n"
            f"Please run the training pipeline first to generate the required artifacts:\n"
            f"  python -m backend.train_model"
        )
    return joblib.load(path)

def save_thresholds(threshold_dict, path=config.THRESHOLDS_PATH):
    """Save calibrated probability thresholds."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(threshold_dict, f, indent=4)
    print(f"Threshold configuration saved to: {path}")

def load_thresholds(path=config.THRESHOLDS_PATH):
    """Load calibrated probability thresholds."""
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Threshold artifact not found at: {path}\n"
            f"Please run the calibration pipeline first:\n"
            f"  python -m backend.calibrate_thresholds"
        )
    with open(path, 'r') as f:
        return json.load(f)
