# 🔥 GeoFireNet: Wildfire Risk Prediction System

**Status**: FROZEN ❄️ (v1.0-RC)
**Docs**: [System Freeze](file:///home/dasunika/.gemini/antigravity/brain/47bb03d4-c784-4fe4-a72d-f104bd22053b/system_freeze.md) | [Walkthrough](file:///home/dasunika/.gemini/antigravity/brain/47bb03d4-c784-4fe4-a72d-f104bd22053b/walkthrough.md)

**An AI-driven dashboard for visualizing and predicting wildfire risk using satellite data and climate metrics.**

## 🔥 The Paradigm Shift: Reactive vs. Predictive

GeoFireNet represents a fundamental change in how we approach wildfire management:

| Model | Workflow | Result |
| :--- | :--- | :--- |
| **Reactive** (Traditional) | Satellite Sensor → Active Fire Detection → Alert Generation | **Emergency Response** |
| **Predictive** (GeoFireNet) | Climate + Vegetation Data → ML Prediction → Early Warning | **Prevention & Mitigation** |

By moving the intervention point to *before* ignition, we shift from managing disasters to preventing them.

## 📂 Repository Structure

```text
GeoFireNet/
├── dashboard/          # [Frontend] React + Vite + Leaflet
│   ├── src/features/   # Map Visualization & Risk Analytics
│   └── public/         # Static Assets
│
├── backend/            # [Backend] FastAPI + Scikit-Learn
│   ├── main.py         # REST API Entry Point
│   ├── train_model.py  # Model Training Pipeline
│   ├── evaluate_model.py # Performance Metrics & Logic Validation
│   └── requirements.txt
│
├── prototype_app/      # [Prototype] Streamlit + Folium
│   ├── app.py          # Interactive Sandbox UI
│   ├── model.py        # Shared Logic Integration
│   └── requirements.txt
│
└── README.md           # Project Documentation
```

## 🚀 Quick Start Guide

### 1. Run the Frontend Dashboard (Recommended Demo)

The visual centerpiece of the project. Displays real-time risk alerts and interactive maps.

```bash
cd dashboard
npm install   # Install Node dependencies
npm run dev   # Start local dev server
```

> Open <http://localhost:5173>

### 2. Run the Data Science Prototype

For examining model variables and testing extreme scenarios.

```bash
cd prototype_app
pip install -r requirements.txt
streamlit run app.py
```

> Open <http://localhost:8501>

### 3. (Optional) Run the Full Backend API

To serve the unified model to both apps via REST API.

```bash
cd backend
pip install -r requirements.txt
python train_model.py  # Generate model.pkl
python main.py         # Start API Server
```

> API Docs at <http://localhost:8000/docs>

## 📊 Model Evaluation

To generate quantitative performance metrics (Accuracy, F1-Score, Confusion Matrix):

```bash
cd backend
python evaluate_model.py
```

*Results are saved to `evaluation_results.json`.*

## 🛠️ Technology Stack

* **Frontend**: React, TypeScript, Leaflet, Chart.js, CSS Modules
* **Backend**: Python, FastAPI, Uvicorn, Joblib
* **AI/ML**: Scikit-Learn (Random Forest Regressor), Pandas, NumPy
* **DevOps**: Vite, ESLint, npm

## 📜 License

Academic License - GeoFireNet Project Team.
