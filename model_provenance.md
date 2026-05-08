# GeoFireNet Model Provenance: v1.0-RC

> [!IMPORTANT]
> This document defines the **frozen state** of the GeoFireNet wildfire risk model for academic verification. All future evaluations must reference this specific artifact version.

## 1. Artifact Integrity

The executable model artifact is located at `backend/artifacts/model.pkl`. Its integrity is guaranteed by the following SHA-256 hash.

**SHA-256 Hash**: `94faf67a1e10670b768f96b130db8940ab40037115e65e01f95628cfd5889e44`

Any deviation from this hash indicates a modified or corrupted model that invalidates this provenance record.

## 2. Algorithm Specification

- **Algorithm**: RandomForestClassifier
- **Implementation Library**: `scikit-learn` (v1.x)
- **Parameters**:
  - `n_estimators`: 200
  - `max_depth`: 10
  - `min_samples_split`: 5
  - `random_state`: 42
  - `class_weight`: balanced

## 3. Feature Definition

The model accepts a 4-dimensional input vector representing environmental conditions.

| Feature Name | Description | Unit | Operational Constraints | Pipeline Processing |
| :--- | :--- | :--- | :--- | :--- |
| `temp` | Surface Air Temperature | Celsius (°C) | API clamp [-20, 60], model clamp [0, 60] | Median imputation + StandardScaler |
| `humidity` | Relative Humidity | Percent (%) | [0, 100] | Median imputation + StandardScaler |
| `wind` | Wind Speed | km/h | [0, 150] | Median imputation + StandardScaler |
| `veg_moisture` | Vegetation Moisture Index | Index (0-1) | [0, 1] | Median imputation + StandardScaler |

**Input Preprocessing Rules**:

1. Inputs are validated at the API layer and clipped inside the sklearn feature-engineering transformer.
2. A derived `temp_wind_interaction` feature is created before imputation/scaling.
3. The saved sklearn `Pipeline` is used for both training and inference, preventing preprocessing drift.

## 4. Target Definition

- **Output**: Probability of the positive `is_fire_risk` class.
- **Range**: $[0, 1]$ probability, also exposed as a dashboard score in the $[0, 100]$ interval.
- **Interpretation**: Higher probability indicates higher wildfire-risk conditions. Calibrated thresholds are stored in `backend/artifacts/thresholds.json`.

## 5. Training Context

- **Data Source**: Synthetic generation based on California climate patterns (see `backend/train_model.py`).
- **Sample Size**: 3000 samples.
- **Underlying Logic**: The model was trained to approximate a heuristic formula with added non-linear interactions (e.g., Extreme Heat + High Wind amplification).

## 6. Constraints & Assumptions

- **Validation**: The `evaluate_model.py` script loads the same sklearn artifact used by the FastAPI prediction service and writes evaluation metrics to `backend/artifacts/evaluation_results.json`.
- **Geographic Scope**: The training data represents Mediterranean climate conditions (hot, dry summers). Extrapolation to other climate types is undefined.
