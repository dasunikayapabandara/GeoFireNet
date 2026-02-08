# 🔥 GeoFireNet: Wildfire Risk Prediction System

**An AI-driven dashboard for visualizing and predicting wildfire risk.**

This repository contains two implementation prototypes for the GeoFireNet system:
1.  **Frontend Dashboard (React + Vite)**: A comprehensive, component-based UI for large-scale deployment.
2.  **Model Prototype (Python + Streamlit)**: A functional data science sandbox for rapid model testing and visualization.

## 📂 Project Structure

```
GeoFireNet/
├── dashboard/          # Production-ready React Frontend
│   ├── src/features/   # Map & Dashboard Components
│   └── src/services/   # Mock Data Services
│
├── prototype_app/      # Python Data Science Prototype
│   ├── app.py          # Main Streamlit Application
│   ├── model.py        # Inference Logic (Mock/Real)
│   └── requirements.txt
│
└── README.md
```

## 🚀 Quick Start

### 1. Python Prototype (For Data Scientists)
Interact with the risk model, adjust climate sliders, and see real-time map updates.

```bash
cd prototype_app
pip install -r requirements.txt
streamlit run app.py
```

**Features:**
*   Interactive Sliders (Temp, Humidity, Wind).
*   Dynamic Risk Prediction using Random Forest Logic.
*   GeoJSON Visualization of specific California regions (Napa, Sonoma).

### 2. React Dashboard (For End Users)
Explore the production-grade interface with responsive design and modular architecture.

```bash
cd dashboard
npm install
npm run dev
```

**Features:**
*   Modern, Dark-Themed UI.
*   Interactive Leaflet Map with Risk Polygons.
*   Real-time Alerts & Analytics Charts.

## 🛠️ Technology Stack
*   **Frontend**: React, Vite, TypeScript, Leaflet, Chart.js
*   **Prototype**: Python, Streamlit, Folium, Pandas, Scikit-Learn
*   **Data**: GeoJSON, Mock API Services

## 🤝 Contributing
1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
