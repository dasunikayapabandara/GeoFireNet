# GeoFireNet: Final Year Project Structure

> [!NOTE]
> This document maps the GeoFireNet system artifacts to the standard 6-chapter structure for a Computer Science Final Year Project (FYP).

## Chapter 1: Introduction

* **1.1 Problem Statement**: Wildfires are becoming more frequent and severe due to climate change, yet current risk assessment tools (like FWI) are often static, non-interactive, and inaccessible to the general public.
* **1.2 Motivation**: To democratize wildfire risk analysis by creating an accessible, web-based platform that combines real-time weather data with ML-driven risk prediction.
* **1.3 Objectives**:
  * Develop a full-stack web application (React + FastAPI).
  * Implement a Random Forest model to predict risk from meteorological data.
  * Compare ML performance against traditional heuristic baselines.

## Chapter 2: Literature Review

* **2.1 Traditional Fire Indices**: Review of the Canadian Forest Fire Weather Index (FWI) system. Strengths (standardization) vs. Weaknesses (linearity, lack of granularity).
* **2.2 Machine Learning in Disaster Management**: Overview of recent attempts to use ML (SVM, Neural Nets) for fire prediction.
* **2.3 Research Gap**: Most ML models represent "black boxes" with no provenance. GeoFireNet addresses this by establishing a clear *Model Provenance* and *Input Contract*.

## Chapter 3: System Design & Architecture

* **3.1 High-Level Architecture**: Diagram showing the Frontend (React/Leaflet) <-> API (FastAPI) <-> ML Model (Scikit-Learn).
* **3.2 Data Flow**: How user inputs (sliders) translate to JSON requests (`model_input_contract.md`) and how predictions flow back to the UI.
* **3.3 Component Design**:
  * **Frontend**: Modular components (`RiskCard`, `RiskChart`) for visualization.
  * **Backend**: Pydantic validation for robust input handling (`backend/main.py`).

## Chapter 4: Methodology

* **4.1 Data Generation**: Justification for using 2000 synthetic samples based on California summer climate profiles to train the model (`experiment_traceability.md`).
* **4.2 Model Selection**: Rationale for choosing **Random Forest Regressor** (handling non-linear interactions) over simple Linear Regression.
* **4.3 Training Process**: Details of the training pipeline (`train_model.py`) and artifact freezing (`model_provenance.md`).
* **4.4 Safety Engineering**: Implementation of "Soft Enforcement" (clamping) for input robustness.

## Chapter 5: Evaluation & Results

* **5.1 Metrics Selection**: Justification for prioritizing **Recall** over Precision (Safety-First logic).
* **5.2 Threshold Calibration**: Analysis from `calibrate_thresholds.py` showing why **Threshold 50** was chosen (100% Recall) despite lower F1-score than Threshold 60.
* **5.3 Comparative Analysis**: Quantitative and qualitative comparison showing where ML outperforms the Baseline (Extreme Heat + Wind scenarios).

## Chapter 6: Conclusion & Future Work

* **6.1 Summary**: Successfully built a working prototype that demonstrates non-linear risk sensitivity.
* **6.2 Limitations**:
  * Reliance on synthetic training data (Sim2Real gap).
  * Simplified 4-feature input vector.
* **6.3 Future Work**:
  * Integration with live satellite APIs (NASA FIRMS).
  * Expansion to include terrain data (Slope/Aspect).
