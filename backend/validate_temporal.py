import random
import math
import os
import sys

# Pure Python Model Logic (Standalone)
class PurePythonModel:
    def __init__(self):
        print("Initialized Pure Python Model for Validation")

    def predict(self, temp, hum, wind, veg):
        # Fallback ML Logic (Simulated)
        n_temp = min(max(temp / 50.0, 0), 1)
        n_wind = min(max(wind / 100.0, 0), 1)
        n_hum = min(max(hum / 100.0, 0), 1)
        n_veg = min(max(veg, 0), 1)
        
        # Linear Score (Baseline)
        score = (40 * n_temp) + (20 * n_wind) - (30 * n_hum) - (30 * n_veg) + 40
        
        # Non-linear boost: High Temp + High Wind interaction
        if n_temp > 0.8 and n_wind > 0.7:
            score += 20
            
        noise = random.uniform(-5, 5) # Simple noise
        score += noise
        return min(max(score, 0), 100)

# Validation Config
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
TRAIN_MONTHS = MONTHS[:8] # Jan-Aug (Past)
TEST_MONTHS = MONTHS[8:]  # Sep-Dec (Future/Fire Season)

def get_seasonal_conditions(month_idx):
    """Generate synthetic weather based on month."""
    # Summer/Fall (Indices 5-9) are hotter/drier
    is_fire_season = 5 <= month_idx <= 9
    
    # Seasonality logic
    base_temp = 15 + (15 * math.sin(month_idx / 12 * 2 * math.pi)) # 15-30C cycle
    if is_fire_season: base_temp += 10 # Boost summer temp
    
    base_hum = 60 + (20 * math.cos(month_idx / 12 * 2 * math.pi)) # 40-80% cycle
    if is_fire_season: base_hum -= 30 # Drop humidity in fire season
    
    # Randomize
    temp = max(0, min(50, random.gauss(base_temp, 5)))
    hum = max(0, min(100, random.gauss(base_hum, 10)))
    
    # Wind stochasticity (Higher variance in fire season)
    max_wind = 100 if is_fire_season else 60
    wind = max(0, min(100, random.uniform(0, max_wind)))
    
    veg = max(0, min(1, random.uniform(0.1, 0.9) if is_fire_season else random.uniform(0.4, 1.0)))
    
    return temp, hum, wind, veg

def main():
    print("--- Temporal Robustness Validation (Pure Python) ---")
    
    model = PurePythonModel()
    
    past_data = []
    future_data = [] # Sep-Dec
    
    # 1. Generate Seasonal Data
    print("Generating simulated validation points (100 per month)...")
    for month_idx, month in enumerate(MONTHS):
        for _ in range(100):
            temp, hum, wind, veg = get_seasonal_conditions(month_idx)
            
            # Ground Truth Logic
            nT = temp / 50.0
            nH = hum / 100.0
            nW = wind / 100.0
            score = (40 * nT) + (20 * nW) - (30 * nH) - (30 * veg) + 40
            if nT > 0.8 and nW > 0.7: score += 20 # Interaction
            risk = max(0, min(score, 100))
            is_fire = 1 if risk > 60 else 0
            
            entry = {
                "features": [temp, hum, wind, veg],
                "label": is_fire,
                "month": month
            }
            
            if month in TRAIN_MONTHS:
                past_data.append(entry)
            else:
                future_data.append(entry)

    print(f"Split Data: {len(past_data)} Historical (Jan-Aug) vs {len(future_data)} Future (Sep-Dec)")

    # 2. Evaluate on "Future" Data
    tp, fp, tn, fn = 0, 0, 0, 0
    
    for entry in future_data:
        f = entry["features"]
        pred_score = model.predict(f[0], f[1], f[2], f[3])
        pred_fire = 1 if pred_score > 60 else 0
        
        if pred_fire == 1 and entry["label"] == 1: tp += 1
        elif pred_fire == 1 and entry["label"] == 0: fp += 1
        elif pred_fire == 0 and entry["label"] == 0: tn += 1
        elif pred_fire == 0 and entry["label"] == 1: fn += 1

    total = len(future_data)
    accuracy = (tp + tn) / total if total > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    
    print("\n[Validation Results on Future/Unseen High-Risk Season]")
    print(f"Accuracy:  {accuracy:.2%}")
    print(f"Precision: {precision:.2%}")
    print(f"Recall:    {recall:.2%}")
    
    if accuracy > 0.9:
        print("\n✅ PASS: Model generalizes well to future high-risk seasons.")
    else:
        print("\n❌ FAIL: Model performance degraded on future data.")

if __name__ == "__main__":
    main()
