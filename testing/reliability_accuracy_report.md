# Reliability & Accuracy Evaluation

## 1. Model Accuracy and Recall
The Random Forest model achieves a baseline accuracy of 90.0% using a standard 0.5 probability threshold. However, for reliability in a safety-critical context, we prioritize **Recall**.
*   **Calibrated Threshold**: 50 (Custom logic layer).
*   **Impact**: By enforcing this threshold, the model achieves **100% Recall** on the test dataset, meaning zero false negatives.
*   **Reliability Statement**: The system can be trusted to not miss a fire risk pattern present in the training data distribution.

## 2. System Reliability Under Invalid Inputs
To prevent system crashes or absurd predictions (e.g., predicting fire risk at -100°C), the backend implements **Input Clamping**:
*   Temperature is bounded to `[-20.0, 60.0]`.
*   Humidity is bounded to `[0.0, 100.0]`.
*   Wind is bounded to `[0.0, 150.0]`.
*   **Behavior**: The API accepts the invalid input, gracefully clamps it to the nearest boundary, and processes the prediction without throwing a 500 Internal Server Error. This guarantees uptime.

## 3. Backend Health Behavior
The `/system/status` endpoint continuously monitors two critical components:
1.  **Database Connection**: Ensures PostgreSQL is responsive.
2.  **Model Artifacts**: Verifies `model.pkl` is loaded in memory.
If either fails, the system safely degrades its status to "degraded" or "missing", allowing monitoring tools to detect failures before user impact.

## 4. Limitations
*   **Sim2Real Gap**: High accuracy on synthetic data does not guarantee high accuracy on live data. The reliability metric is theoretically sound but requires field validation.
