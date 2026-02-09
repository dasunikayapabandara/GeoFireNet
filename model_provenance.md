# GeoFireNet Model Provenance: v1.0-RC

> [!IMPORTANT]
> This document defines the **frozen state** of the GeoFireNet wildfire risk model for academic verification. All future evaluations must reference this specific artifact version.

## 1. Artifact Integrity

The executable model artifact is located at `backend/model.pkl`. Its integrity is guaranteed by the following SHA-256 hash.

**SHA-256 Hash**: `e67c0bf04d3dd3f6ccfeaedab4fcae65cecfc593183defc7a493614f101c7945`

Any deviation from this hash indicates a modified or corrupted model that invalidates this provenance record.

## 2. Algorithm Specification

- **Algorithm**: Random Forest Regressor
- **Implementation Library**: `scikit-learn` (v1.x)
- **Parameters**:
  - `n_estimators`: 100
  - `random_state`: 42
  - `criterion`: squared_error (default)

## 3. Feature Definition

The model accepts a 4-dimensional input vector representing environmental conditions.

| Feature Name | Description | Unit | Range Constraints | Normalization Logic |
| :--- | :--- | :--- | :--- | :--- |
| `temp` | Surface Air Temperature | Celsius (°C) | [0, 50] | $x / 50.0$ |
| `humidity` | Relative Humidity | Percent (%) | [0, 100] | $x / 100.0$ |
| `wind` | Wind Speed | km/h | [0, 100] | $x / 100.0$ |
| `veg` | Vegetation Moisture Index | Index (0-1) | [0, 1] | $x$ (Identity) |

**Input Preprocessing Rules**:

1. All inputs are clipped to their respective ranges before processing.
2. Normalization scales all inputs to the $[0, 1]$ interval.

## 4. Target Definition

- **Output**: Wildfire Risk Score
- **Range**: $[0, 100]$ continuous
- **Interpretation**: Higher scores indicate higher risk.
  - Low: 0-29
  - Moderate: 30-49
  - High: 50-79
  - Extreme: 80-100

## 5. Training Context

- **Data Source**: Synthetic generation based on California climate patterns (see `backend/train_model.py`).
- **Sample Size**: 2000 samples.
- **Underlying Logic**: The model was trained to approximate a heuristic formula with added non-linear interactions (e.g., Extreme Heat + High Wind amplification).

## 6. Constraints & Assumptions

- **Simulation Validation**: The `evaluate_model.py` script uses a *Pure Python* simulation of the model logic for architectural independence, not the `model.pkl` artifact itself. The `model.pkl` is used exclusively by the `main.py` API server.
- **Geographic Scope**: The training data represents Mediterranean climate conditions (hot, dry summers). Extrapolation to other climate types is undefined.
