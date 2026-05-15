# GeoFireNet

GeoFireNet is a full-stack wildfire risk prediction and monitoring system. It combines a FastAPI backend, PostgreSQL storage, a calibrated scikit-learn risk model, and a React dashboard for geospatial fire-risk analysis, alerts, prediction history, and operational health checks.

## Project URLs

- Repository: https://github.com/dasunikayapabandara/GeoFireNet
- Dashboard, local development: http://localhost:5173
- API, local development: http://localhost:8000
- API Swagger docs: http://localhost:8000/docs
- pgAdmin, local development: http://localhost:5050

## Main Features

- Predict wildfire risk from temperature, humidity, wind speed, vegetation moisture, and location metadata.
- Fetch real-time weather from Open-Meteo by default, with optional OpenWeatherMap support.
- Store prediction logs, weather inputs, locations, model versions, active detections, and alert records.
- Generate actionable alerts for high and extreme risk predictions.
- View dashboard summaries, map layers, predictions, alerts, analytics, history, settings, and user access flows.
- Track backend readiness through health, database, model, and system-status endpoints.
- Train, evaluate, compare, and calibrate the wildfire risk model from local data.

## Tech Stack

- Backend: Python, FastAPI, SQLAlchemy, Alembic, Pydantic, PostgreSQL
- Machine learning: scikit-learn, pandas, NumPy, joblib, matplotlib, seaborn
- Frontend: React, TypeScript, Vite, Leaflet, Chart.js, lucide-react
- Prototype: Streamlit, Folium
- Local infrastructure: Docker Compose, PostgreSQL, pgAdmin

## Repository Structure

```text
GeoFireNet/
  backend/                 FastAPI app, API routes, database models, ML pipeline, tests
  backend/artifacts/       Model, thresholds, evaluation outputs, plots, metadata
  backend/data/            Training dataset used by the backend ML pipeline
  dashboard/               React and TypeScript Vite dashboard
  prototype_app/           Streamlit prototype dashboard
  Climate Data/            Raw or external climate data workspace
  NASA FIRMS Dataset/      Raw or external NASA FIRMS data workspace
  Sentinel-2 Imagery/      Raw or external Sentinel-2 imagery workspace
  docker-compose.yml       Local PostgreSQL and pgAdmin services
```

Large data directories and generated model files are ignored by Git, so regenerate or provide them locally when setting up a fresh clone.

## Prerequisites

- Python 3.11 or newer
- Node.js 20 or newer
- npm
- Docker and Docker Compose
- PostgreSQL client tools are optional, but helpful for manual database inspection

## Backend Setup

Run these commands from the repository root.

```bash
docker compose up -d postgres pgadmin
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
alembic -c backend/alembic.ini upgrade head
python -m backend.seed_db
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The backend uses these default local database settings:

```text
Database: geofirenet_db
User: dasunika
Password: geofirenet_dev
Host: localhost
Port: 5432
```

To override settings, create `backend/.env`. Useful variables include:

```env
DATABASE_URL=postgresql://dasunika:geofirenet_dev@localhost:5432/geofirenet_db
CORS_ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
WEATHER_API_PROVIDER=open-meteo
WEATHER_API_KEY=
```

Use `WEATHER_API_PROVIDER=open-weather` only when `WEATHER_API_KEY` is configured for OpenWeatherMap. Open-Meteo is the default and does not require a key.

## Dashboard Setup

Run these commands in a second terminal.

```bash
cd dashboard
npm install
npm run dev
```

The dashboard reads the backend URL from `VITE_API_BASE_URL`. Create `dashboard/.env` if you need to override the default:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Default local dashboard login:

```text
Email: admin@geofirenet.com
Password: GeoFireNet123
```

The dashboard also supports a public user flow from the login screen. Authentication is local-browser storage for development/demo use, not production identity management.

## API Overview

Important local endpoints:

- `GET /` - API root status
- `GET /docs` - Swagger UI
- `GET /health` - overall API health
- `GET /health/db` - database connectivity
- `GET /health/model` - model artifact readiness
- `GET /system/status` - aggregated system readiness
- `POST /predict` - wildfire risk prediction
- `GET /history` - prediction history
- `GET /alerts` - alert list
- `GET /alerts/summary` - alert dashboard summary
- `GET /analytics/global_summary` - risk and alert analytics
- `GET /detections` - active detection logs
- `GET /weather/current` - live weather lookup
- `WS /ws` - WebSocket channel for live alert updates

Example prediction request:

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "temp": 38,
    "humidity": 22,
    "wind": 45,
    "veg_moisture": 0.18,
    "country": "USA",
    "admin_region": "California",
    "latitude": 38.5,
    "longitude": -122.3
  }'
```

If any environmental inputs are omitted, provide explicit latitude and longitude so the backend can fetch weather data.

## Machine Learning Pipeline

The backend stores the selected scikit-learn pipeline in `backend/artifacts/model.pkl` and calibrated thresholds in `backend/artifacts/thresholds.json`. If artifacts are missing, rebuild them with:

```bash
source .venv/bin/activate
python -m backend.data_loader
python -m backend.train_model
python -m backend.evaluate_model
python -m backend.calibrate_thresholds
```

The pipeline generates or loads `backend/data/dataset.csv`, trains a Random Forest classifier, compares it against baseline models, saves evaluation metrics, writes confusion matrix outputs, and calibrates probability thresholds for low, moderate, high, and extreme risk levels.

## Prototype App

The Streamlit prototype is kept in `prototype_app/`.

```bash
cd prototype_app
pip install -r requirements.txt
streamlit run app.py
```

## Testing and Quality Checks

Backend tests:

```bash
source .venv/bin/activate
pytest backend/tests
```

Dashboard checks:

```bash
cd dashboard
npm run lint
npm run build
```

## Common Troubleshooting

- If the dashboard cannot reach the API, confirm the backend is running at http://localhost:8000 and `dashboard/.env` contains `VITE_API_BASE_URL=http://localhost:8000`.
- If predictions return a model-readiness error, run the ML pipeline commands to regenerate `backend/artifacts/model.pkl` and `backend/artifacts/thresholds.json`.
- If migrations cannot connect, confirm Docker is running and the `postgres` service is healthy with `docker compose ps`.
- If OpenWeatherMap is selected, make sure `WEATHER_API_KEY` is present in `backend/.env`.
