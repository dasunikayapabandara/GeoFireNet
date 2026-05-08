# Testing Methods and Limitations

## 1. Synthetic Data Limitation
The core machine learning model is trained and evaluated on 2,000 synthetic data points modeled after California summer climate profiles. 
*   **Limitation**: While it correctly learns the non-linear physics of fire risk (hot + dry + windy = extreme risk), it has not been validated against a historical dataset of actual, verified fire ignitions. This introduces a "Sim2Real" gap.

## 2. Real-Time API Dependency
The system can fallback to fetching real-time weather via the Open-Meteo API.
*   **Limitation**: If the Open-Meteo API is rate-limited or goes offline, predictions lacking manual inputs will fail.

## 3. Regional Generalization
The model's baseline thresholds are implicitly tuned for a Mediterranean climate (California).
*   **Limitation**: Applying this model to a tropical rainforest or a tundra environment will likely yield highly inaccurate risk scores without recalibration.

## 4. Model Deployment Limitation
The system currently runs via `uvicorn` and a local PostgreSQL container.
*   **Limitation**: True production scalability (e.g., Kubernetes deployment, load balancing, caching layers) has not been tested.

## 5. Usability Testing Sample-Size Limitation
*   **Limitation**: Usability testing was conducted with a small sample of peer evaluators. It lacks formal statistical significance and feedback from actual domain experts (e.g., wildland firefighters or meteorologists).

## 6. Performance Testing Environment
*   **Limitation**: Performance metrics (API latency < 50ms) were gathered in a local development environment. Network latency, TLS overhead, and database query contention under heavy concurrent load remain untested.
