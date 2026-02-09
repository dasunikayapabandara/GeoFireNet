# Experiment Traceability Map

> [!IMPORTANT]
> This document traces the lineage of the GeoFireNet model from data to deployment, justifying key design decisions for academic defense.

## 1. Data Lineage

### Training Data Generation (`backend/train_model.py`)

- **Source**: Synthetic Simulation.
- **Profile**: California Mediterranean Climate (Summer Focus).
- **Volume**: 2000 Samples.
- **Ground Truth Logic**:
  - Base: Linear combination of normalized Temperature, Humidity, Wind, and Vegetation.
  - Interaction: `Temp > 0.8` AND `Wind > 0.7` adds non-linear risk boost (+20pts).
  - Noise: Gaussian noise added ($ \sigma=5 $) to simulate real-world sensor variance.

### Model Training

- **Algorithm**: Random Forest Regressor (`n_estimators=100`).
- **Goal**: Learn the underlying risk surface including non-linear interactions without explicit programming.
- **Artifact**: `backend/model.pkl` (SHA-256: `e67c...101c7945`).

## 2. Threshold Justification

The system uses a **Risk Score (0-100)** to classify danger levels. The critical decision boundary for "High Risk" is set at **50**.

### Calibration Analysis (`backend/calibrate_thresholds.py`)

| Threshold | Recall (Safety) | Precision (Accuracy) | F1-Score | FP Rate |
| :--- | :--- | :--- | :--- | :--- |
| **50** | **100.0%** | 50.5% | 0.67 | 18.9% |
| **60** | 93.5% | 90.4% | **0.92** | 1.9% |

### Decision Rationale

**Why 50 instead of 60?**

- **Safety-First Design**: In wildfire prediction, a False Negative (missing a fire) is catastrophic, whereas a False Positive (false alarm) is merely inconvenient.
- **Recall Priority**: We selected Threshold 50 to maximize **Recall (100%)**, ensuring the system captures *all* potential high-risk events, even at the cost of lower precision (50%).
- **Operational Protocol**: A "High" alert triggers human review, filtering out the false positives downstream.

## 3. Metric Selection

### Primary Metric: Recall

- **Definition**: $\frac{TP}{TP + FN}$
- **Justification**: Measures the system's ability to detect actual fire conditions. Optimized to $\approx 1.0$.

### Secondary Metric: F1-Score

- **Definition**: Harmonic mean of Precision and Recall.
- **Role**: Used to ensure the model isn't simply predicting "Fire" for everything (which would yield 100% Recall but ~0% Precision). The F1 score of 0.67 at Threshold 50 confirms distinct discriminative power.

## 4. Evaluation Trace

1. **Unit Tests**: `backend/evaluate_model.py` validates the model against a separate 500-sample test set.
2. **Temporal Validation**: `backend/validate_temporal.py` confirms robustness across simulated "seasons" (Summer vs. Winter).
