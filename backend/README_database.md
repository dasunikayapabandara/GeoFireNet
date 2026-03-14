# GeoFireNet Database Architecture

## 📋 Overview

To ensure this Final Year Project is academically defendable and mimics a true production environment, GeoFireNet utilizes a strongly-typed, fully relational **PostgreSQL** database.

This architecture explicitly eschews lightweight document stores (like MongoDB) or flat files in favor of PostgreSQL to guarantee **Relational Integrity and ACID compliance**, which are specifically crucial when logging auditable alerts and model provenance.

## 🏗️ Technical Stack

* **Engine**: PostgreSQL 15+
* **ORM**: SQLAlchemy 2.0 (Synchronous implementation)
* **Migrations**: Alembic
* **Configuration**: `pydantic-settings`

### Why Synchronous over Asynchronous?

We specifically chose to use standard synchronous `psycopg2` drivers rather than `asyncpg`. In a Machine Learning API where the primary bottleneck is Scikit-Learn CPU inference (loading dataframes, computing probabilities), an `asyncio` event loop can easily become blocked if not perfectly managed with ThreadPoolExecutors. A synchronous standard ensures absolute stability and predictability for demonstration without unnecessary enterprise-scale overhead.

## 🗄️ Core Tables (Normalized)

1. **`locations`**: Geospatial tracking for specific monitored zones.
2. **`weather_inputs`**: Immutable exact copies of the telemetry that triggered a specific prediction.
3. **`model_versions`**: Tracking provenance (who made this prediction, and with what Scikit-Learn pipeline metrics?).
4. **`risk_prediction_logs`**: The central fact table connecting a `weather_input` and `model_version` to a generated `risk_score` and probability.
5. **`alerts`**: Sub-table automatically generated strictly when a `risk_prediction_log` identifies "High" or "Extreme" danger.
6. **`system_logs`**: Basic audit events.

## 🚀 How to Run for the Defense

1. Spin up the Database and `pgAdmin` visualizer using Docker Compose (so you don't need to configure local postgres accounts):

   ```bash
   docker-compose up -d
   ```

2. Run database migrations to construct the tables:

   ```bash
   cd backend
   alembic upgrade head
   ```

3. Inject the highly-realistic 90-record demonstration dataset (Generates 30 days of data, alerts, and locations):

   ```bash
   python seed_db.py
   ```

4. Start the backend as usual.

You can then browse to `http://localhost:5050` (pgAdmin) during your defense to visually prove the data is structuring correctly behind the scenes!
