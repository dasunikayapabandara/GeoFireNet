import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import joblib
import os

print("Training final wildfire risk model...")

# 1. Generate Synthetic Training Data (Representing CA Climate)
np.random.seed(42)
n_samples = 2000

# Features
# Temperature (0-50 C) - High temp is bad
temp = np.random.uniform(0, 50, n_samples)
# Humidity (0-100 %) - Low humidity is bad
humidity = np.random.uniform(0, 100, n_samples)
# Wind Speed (0-100 km/h) - High wind is bad
wind = np.random.uniform(0, 100, n_samples)
# Vegetation Moisture (0-1 index) - Low moisture is bad
veg = np.random.uniform(0, 1, n_samples)

X = pd.DataFrame({
    'temp': temp,
    'humidity': humidity,
    'wind': wind,
    'veg': veg
})

# Target: Risk Score (0-100)
# Formula: Base weights (normalized features)
# Score = (40 * nT + 20 * nW - 30 * nH - 30 * nV) + Intercept
# Added interaction: High Temp (nT > 0.8) + High Wind (nW > 0.7) -> Additional +15 risk
nT = temp / 50.0
nH = humidity / 100.0
nW = wind / 100.0
nV = veg

score = (40 * nT) + (20 * nW) - (30 * nH) - (30 * nV) + 40

# Add non-linear interactions (e.g. Extreme Heat + Wind = Exponential Risk)
score += 20 * (nT * nW) 

# Add random noise and clip to 0-100
y = np.clip(score + np.random.normal(0, 5, n_samples), 0, 100)

# 2. Train Model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# 3. Save Model Artifact
output_path = os.path.join(os.path.dirname(__file__), "model.pkl")
joblib.dump(model, output_path)
print(f"Model saved to: {output_path}")

# Also copy to prototype_app for direct loading
proto_path = os.path.join(os.path.dirname(__file__), "../prototype_app/model.pkl")
joblib.dump(model, proto_path)
print(f"Model copied to: {proto_path}")
