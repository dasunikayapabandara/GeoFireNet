import math
import os

MODEL_PATH = "model.pkl"

def get_risk_level(score):
    if score < 30: return "Low", "Normal"
    if score < 50: return "Moderate", "Caution"
    if score < 80: return "High", "Warning"
    return "Extreme", "Evacuate"

def predict_risk(temp, hum, wind, veg):
    try:
        import joblib
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            # Assuming input shape matches training: [[Temp, Hum, Wind, Veg]]
            input_vec = [[temp, hum, wind, veg]]
            return float(model.predict(input_vec)[0])
    except ImportError:
        print("Required 'joblib' not found. Using Standard Risk Formula (Fallback).")
    except Exception as e:
        print(f"Model Error: {e}. Using Fallback.")

    # Tuned Fallback Logic (Matches model.py)
    n_temp = min(temp / 50.0, 1.0)
    n_hum = min(hum / 100.0, 1.0)
    n_wind = min(wind / 100.0, 1.0)
    n_veg = min(veg, 1.0)
    
    score = (40 * n_temp) + (20 * n_wind) - (30 * n_hum) - (30 * n_veg) + 40
    if n_temp > 0.8 and n_wind > 0.7:
        score += 20
        
    return max(0.0, min(score, 100.0))

def run_scenario(name, inputs):
    print(f"\n--- Scenario: {name} ---")
    print(f"Inputs: Temp={inputs['temp']}C, Humidity={inputs['hum']}%, Wind={inputs['wind']}km/h, Vegetation={inputs['veg']}")
    
    risk_score = predict_risk(inputs['temp'], inputs['hum'], inputs['wind'], inputs['veg'])
    level, action = get_risk_level(risk_score)
    
    print(f"-> Risk Score: {risk_score:.2f}/100")
    print(f"-> Risk Level: {level.upper()}")
    print(f"-> Action: {action}")
    
    # Validation Logic
    if name == "Extreme Drought" and level != "Extreme":
        print("❌ FAIL: Expected Extreme Risk")
    elif name == "Wet Season" and level != "Low":
        print("❌ FAIL: Expected Low Risk")
    elif name == "Medium Transition" and level not in ["Moderate", "High"]:
        print("❌ FAIL: Expected Moderate/High Risk")
    else:
        print("✅ PASS: Result matches expected behavior.")

if __name__ == "__main__":
    print("Verifying Realistic Wildfire Scenarios...")
    
    # 1. Extreme Summer Drought
    # High Temp (45), Low Hum (5), High Wind (60), Dry Veg (0.05)
    run_scenario("Extreme Drought", {"temp": 45, "hum": 5, "wind": 60, "veg": 0.05})
    
    # 2. Low-Risk Wet Season
    # Low Temp (15), High Hum (80), Low Wind (10), Wet Veg (0.9)
    run_scenario("Wet Season", {"temp": 15, "hum": 80, "wind": 10, "veg": 0.9})
    
    # 3. Medium-Risk Transitional
    # Avg Temp (25), Avg Hum (40), Avg Wind (20), Med Veg (0.5)
    run_scenario("Medium Transition", {"temp": 25, "hum": 40, "wind": 20, "veg": 0.5})
