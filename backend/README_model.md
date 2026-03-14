# GeoFireNet Machine Learning Engine

Welcome to the backend ML documentation for GeoFireNet. This module is designed as an academically defendable, robust machine learning pipeline for a Final Year Project setting.

## 🧠 Architecture Overview

The target variable is binary `fire_risk_class` rather than a continuous mock regression score, formulated as a **Probability-Based Classification Problem**.

1. **Model:** The pipeline compares Logistic Regression, Random Forest, and HistGradientBoosting, selecting the best model based on generalized discriminative power (ROC-AUC).
2. **Preprocessing:** Uses scikit-learn `Pipeline` and `ColumnTransformer` to handle missing data imputation and dynamic feature engineering (e.g., Temperature $\times$ Wind Speed Interaction).
3. **Threshold Calibration:** Instead of using the default 0.5 threshold, our `calibrate_thresholds.py` script specifically tunes the decision boundary to achieve **near 100% Recall**. This explicitly prioritizes a "Safety First" paradigm where False Positives are acceptable but Missed Detections are critical failures.

## 📂 Key Files & Structure

* `config.py`: Global hyperparameter and schema store.
* `data_loader.py`: Generates the static 3000-sample synthetic climate dataset and handles stratified train/test splitting.
* `features.py`: Defines the `WildfireFeatureEngineer` logic and imputation pipelines.
* `train_model.py`: Orchestrates cross-validation, selection, and artifact building.
* `evaluate_model.py`: Generates ROC, PR metrics, classification reports, and saves plots.
* `calibrate_thresholds.py`: Calculates optimal risk bucket boundaries.
* `predict.py`: Safe inference contract loaded by the FastAPI application.
* `model_registry.py`: Abstraction for saving and retrieving `.pkl` and `.json` artifacts.

## 🚀 How to Train

If you need to regenerate the dataset and re-train the models from scratch (for example, if you add new features in `config.py`), run:

```bash
# 1. Regenerate dataset and Train Models
python -m backend.data_loader
python -m backend.train_model

# 2. Evaluate and Generate Visuals
python -m backend.evaluate_model

# 3. Optimise Thresholds
python -m backend.calibrate_thresholds
```

All trained `.pkl` files, metrics `.json`, and plot `.png` images will be saved directly into `backend/artifacts/`.

## 🛡️ Inference Safety (API Contract)

The API relies on `predict.py` interacting with the FastAPI `/predict` endpoint.
Incoming telemetry is intercepted by **Pydantic Validation Clamping**—for instance, if a sensor misreads $999^\circ C$, the system gracefully soft-clamps it to $60^\circ C$ and returns a prediction instead of crashing.

This guarantees **High Availability** during operations and maintains the "system stability" requirement for the finalized project.
