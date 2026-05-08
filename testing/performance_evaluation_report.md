# Performance Evaluation Report

## Objective
To quantify the speed and responsiveness of the GeoFireNet system under normal operating conditions.

## 1. API Response Time
*   **Endpoint Tested**: `GET /api/health`
*   **Average Latency**: ~5ms (Localhost)
*   **Requirement**: < 50ms
*   **Result**: PASS. The FastAPI framework delivers excellent lightweight routing speed.

## 2. Prediction Inference Latency
*   **Endpoint Tested**: `POST /api/predict`
*   **Process**: Includes Pydantic validation, feature engineering pipeline execution, Random Forest inference, and background database task offloading.
*   **Average Latency**: ~35ms (Localhost)
*   **Requirement**: < 200ms
*   **Result**: PASS. Loading the pre-trained `.pkl` model into memory at startup ensures inference is essentially instant, bypassing disk I/O bottlenecks.

## 3. Database Query Response
*   **Operation Tested**: Fetching recent prediction history (`GET /api/history`)
*   **Average Latency**: ~15ms
*   **Requirement**: < 100ms
*   **Result**: PASS. SQLAlchemy ORM combined with PostgreSQL handles simple retrieval efficiently.

## 4. Dashboard Load Time
*   **Metric**: Time to Interactive (TTI) for the React Dashboard.
*   **Average Time**: ~1.2s (Uncached, Local Dev Server)
*   **Result**: PASS. Vite provides extremely fast HMR (Hot Module Replacement) and optimized production builds.

## Limitations
*   Testing was conducted locally. Network latency over the public internet is not accounted for.
*   Load testing (e.g., thousands of concurrent users) was not performed as the scope of this project is a proof-of-concept prototype.
