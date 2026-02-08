from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import os
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="GeoFireNet Risk API")

# Allow CORS for React Dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
model = None

try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f"Loaded model from {MODEL_PATH}")
    else:
        print("Warning: model.pkl not found. API will use mock logic.")
except Exception as e:
    print(f"Error loading model: {e}")

class WildfireFeatures(BaseModel):
    temp: float
    humidity: float
    wind: float
    veg_moisture: float

class RiskPrediction(BaseModel):
    risk_score: float
    risk_level: str

def get_risk_level(prob):
    if prob < 0.3: return "Low"
    if prob < 0.6: return "Moderate"
    if prob < 0.85: return "High"
    return "Extreme"

@app.post("/predict", response_model=RiskPrediction)
async def predict_risk(features: WildfireFeatures):
    if model:
        # Use trained model
        # Input shape: [[temp, humid, wind, veg]] matches training
        input_vector = [[features.temp, features.humidity, features.wind, features.veg_moisture]]
        try:
            prediction = model.predict(input_vector)[0]
            # Handle float32/64 output
            prediction = float(prediction)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
    else:
        # Fallback Mock Logic (Matches model.py)
        n_temp = min(features.temp / 50.0, 1.0)
        n_hum = min(features.humidity / 100.0, 1.0)
        n_wind = min(features.wind / 100.0, 1.0)
        n_veg = min(features.veg_moisture, 1.0)
        
        score = (0.4 * n_temp) + (0.2 * n_wind) - (0.3 * n_hum) - (0.3 * n_veg) + 0.2
        prediction = max(0.0, min(score, 1.0))

    return {
        "risk_score": round(prediction, 4),
        "risk_level": get_risk_level(prediction)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
