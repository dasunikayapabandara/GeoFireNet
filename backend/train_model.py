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

# Target: Risk Score (0-1)
# Formula: 0.4*T + 0.2*W - 0.3*H - 0.3*V + small_noise
# Normalized roughly to 0-1
score = (0.4 * (temp/50)) + (0.2 * (wind/100)) - (0.3 * (humidity/100)) - (0.3 * veg) + 0.4
# Add non-linear interactions (e.g. High Temp + High Wind = Super Bad)
score += 0.2 * ((temp/50) * (wind/100)) 

# Clip to 0-1
y = np.clip(score + np.random.normal(0, 0.05, n_samples), 0, 1)

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
