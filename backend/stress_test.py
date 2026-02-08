import os
import sys

# Pure Python Model Logic (Standalone for Stress Testing)
class PurePythonModel:
    def __init__(self):
        print("Initialized Stress Test Model")

    def predict(self, temp, hum, wind, veg):
        # Logic mirroring the main model
        n_temp = min(max(temp / 50.0, 0), 1)
        n_hum = min(max(hum / 100.0, 0), 1)
        n_wind = min(max(wind / 100.0, 0), 1)
        n_veg = min(max(veg, 0), 1)
        
        # Linear Score
        # Score = (40 * nT + 20 * nW - 30 * nH - 30 * nV) + 40
        score = (40 * n_temp) + (20 * n_wind) - (30 * n_hum) - (30 * n_veg) + 40
        
        # Non-linear boosts
        if n_temp > 0.8 and n_wind > 0.7:
            score += 20
            
        return max(0.0, min(float(score), 100.0))

def run_test(name, inputs):
    model = PurePythonModel()
    print(f"\n--- Test: {name} ---")
    print(f"Inputs: {inputs}")
    
    score = model.predict(inputs['temp'], inputs['hum'], inputs['wind'], inputs['veg'])
    print(f"Output Score: {score:.2f}")
    
    # Validation Rules
    if score < 0 or score > 100:
        print("❌ FAIL: Score out of bounds (0-100)")
        return False
        
    # Contextual Checks
    if name == "Max Disaster" and score < 95:
        print("❌ FAIL: Expected score ~100 for max disaster inputs")
        return False
    if name == "Absolute Zero Risk" and score > 5:
        print("❌ FAIL: Expected score ~0 for zero risk inputs")
        return False
        
    print("✅ PASS")
    return True

def main():
    print("Starting GeoFireNet Stress Test...")
    
    tests = [
        ("Max Disaster", {"temp": 50, "hum": 0, "wind": 100, "veg": 0.0}), # Max Temp, Max Wind, Min Hum, Min Veg
        ("Absolute Zero Risk", {"temp": 0, "hum": 100, "wind": 0, "veg": 1.0}), # Min Temp, Min Wind, Max Hum, Max Veg
        ("High Bound Check", {"temp": 100, "hum": -50, "wind": 200, "veg": -1.0}), # Inputs way out of bounds
        ("Low Bound Check", {"temp": -50, "hum": 200, "wind": -100, "veg": 2.0}), # Inputs way out of bounds
        ("Drought Only", {"temp": 40, "hum": 10, "wind": 10, "veg": 0.1}),
        ("Wind Storm Only", {"temp": 15, "hum": 50, "wind": 90, "veg": 0.5}),
    ]
    
    passed = 0
    for t_name, t_inputs in tests:
        if run_test(t_name, t_inputs):
            passed += 1
            
    print(f"\nSummary: {passed}/{len(tests)} Tests Passed")

if __name__ == "__main__":
    main()
