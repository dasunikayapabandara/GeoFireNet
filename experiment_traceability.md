# Experiment Traceability Map

> [!IMPORTANT]
> This document traces the lineage of the GeoFireNet model from data to deployment, justifying key design decisions for academic defense.

## 1. Data Lineage

### Training Data Generation (`backend/train_model.py`)

- **Source**: Synthetic Simulation.
- **Profile**: California Mediterranean Climate (Summer Focus).
- **Volume**: 3000 Samples.
- **Ground Truth Logic**:
  - Base: Linear combination of normalized Temperature, Humidity, Wind, and Vegetation.
  - Interaction: `Temp > 0.8` AND `Wind > 0.7` adds non-linear risk boost (+20pts).
  - Noise: Gaussian noise added ($ \sigma=5 $) to simulate real-world sensor variance.

### Model Training

- **Algorithm**: RandomForestClassifier (`n_estimators=200`, `max_depth=10`, `min_samples_split=5`).
- **Goal**: Learn the probability of high-risk wildfire conditions, including non-linear interactions, without hard-coding the final decision surface.
- **Artifact**: `backend/artifacts/model.pkl` (SHA-256: `94faf67...5889e44`).

## 2. Threshold Justification

The system uses a calibrated **risk probability** to classify danger levels. The raw model output is a probability in the range `[0, 1]`, and the dashboard also displays this as a score in the range `[0, 100]`.

### Calibration Analysis (`backend/calibrate_thresholds.py`)

| Boundary | Probability | Meaning |
| :--- | :--- | :--- |
| Low | `<= 0.04` | Low risk conditions |
| Moderate | `<= 0.08` | Watch conditions |
| High | `<= 0.54` | Alert-worthy conditions |
| Extreme | `> 0.54` | Highest risk conditions |

### Decision Rationale

**Why calibrated thresholds instead of default 0.5?**

- **Safety-First Design**: In wildfire prediction, a False Negative (missing a fire) is catastrophic, whereas a False Positive (false alarm) is merely inconvenient.
- **Recall Priority**: `calibrate_thresholds.py` searches for a probability boundary that keeps recall near 1.0, ensuring the system captures potential high-risk events even at the cost of additional false positives.
- **Operational Protocol**: A "High" alert triggers human review, filtering out the false positives downstream.

## 3. Metric Selection

### Primary Metric: Recall

- **Definition**: $\frac{TP}{TP + FN}$
- **Justification**: Measures the system's ability to detect actual fire conditions. Optimized to $\approx 1.0$.

### Secondary Metric: F1-Score

- **Definition**: Harmonic mean of Precision and Recall.
- **Role**: Used to ensure the model is not simply predicting "Fire" for everything. F1-score verifies the balance between high recall and useful precision.

## 4. Evaluation Trace

1. **Evaluation Script**: `backend/evaluate_model.py` validates the saved sklearn model against the reserved 20% test split.
2. **Cross Validation**: `backend/train_model.py` performs 10-fold stratified cross-validation to check model stability.
