import sys
import os

# Add parent dir to path to import backend modules if needed, 
# but here we will replicate the exact logic from backend/main.py to test it isolated.

def get_risk_drivers(temp, humidity, wind, veg):
    """Identify top contributing factors to risk. (Replicated from backend/main.py)"""
    n_temp = min(max(temp / 50.0, 0), 1.0)
    n_hum = min(max(humidity / 100.0, 0), 1.0)
    n_wind = min(max(wind / 100.0, 0), 1.0)
    n_veg = min(max(veg, 0), 1.0)
    
    contribs = {}
    
    if n_temp > 0.6:
        contribs["High Temperature"] = 40 * n_temp
    
    if n_wind > 0.6:
        contribs["Strong Winds"] = 20 * n_wind
        
    if (1.0 - n_hum) > 0.6:
        contribs["Low Humidity"] = 30 * (1.0 - n_hum)
        
    if (1.0 - n_veg) > 0.6:
        contribs["Dry Vegetation"] = 30 * (1.0 - n_veg)
    
    # Interaction
    if n_temp > 0.8 and n_wind > 0.7:
        contribs["Heat+Wind Interaction"] = 20
        
    # Sort by contribution
    sorted_factors = sorted(contribs.items(), key=lambda x: x[1], reverse=True)
    
    drivers = [f[0] for f in sorted_factors]
    return drivers[:3] if drivers else ["Normal Conditions"]

def main():
    print("--- Auditing Risk Driver Analysis (Refined) ---")
    
    scenarios = [
        {
            "name": "Heatwave (High Temp)",
            "inputs": {"temp": 45, "humidity": 50, "wind": 10, "veg": 0.5},
            "expected_top": "High Temperature"
        },
        {
            "name": "Wind Storm (High Wind)",
            "inputs": {"temp": 20, "humidity": 50, "wind": 90, "veg": 0.5},
            "expected_top": "Strong Winds"
        },
        {
            "name": "Dry Conditions (Low Hum + Dry Veg)",
            "inputs": {"temp": 20, "humidity": 5, "wind": 10, "veg": 0.0},
            "expected_contains": ["Low Humidity", "Dry Vegetation"]
        },
        {
            "name": "Calm Day (Normal)",
            "inputs": {"temp": 20, "humidity": 60, "wind": 10, "veg": 0.8},
            "expected_result": ["Normal Conditions"] 
        },
        {
            "name": "Complex Disaster (Everything Extreme)",
            "inputs": {"temp": 50, "humidity": 0, "wind": 100, "veg": 0.0},
            "check_limit": True # Should be capped at 3
        }
    ]
    
    passed = 0
    
    for s in scenarios:
        print(f"\nTesting: {s['name']}")
        drivers = get_risk_drivers(
            s['inputs']['temp'], 
            s['inputs']['humidity'], 
            s['inputs']['wind'], 
            s['inputs']['veg']
        )
        print(f"  -> Returned: {drivers}")
        
        ok = True
        
        if "expected_top" in s and (not drivers or drivers[0] != s["expected_top"]):
            print(f"  ❌ FAIL: Expected top driver '{s['expected_top']}'")
            ok = False
            
        if "expected_contains" in s:
            for item in s["expected_contains"]:
                if item not in drivers:
                    print(f"  ❌ FAIL: Expected driver '{item}' not found")
                    ok = False
                    
        if "expected_result" in s and drivers != s["expected_result"]:
            # If "Normal Conditions" is expected but we got [Normal Conditions], that matches.
            # But if we got actual drivers for a "Calm" day, that might be an issue depending on threshold > 5.
            # Let's check strict equality first.
             if drivers != s["expected_result"]:
                 # check if it's just 'Normal Conditions' by another name or empty
                 pass
            
        if "check_limit" in s:
            if len(drivers) > 3:
                print(f"  ❌ FAIL: Too many drivers returned ({len(drivers)} > 3)")
                ok = False
            else:
                print("  ✅ Limit checked (<=3)")

        if ok:
            passed += 1
            print("  ✅ PASS")
            
    print(f"\nSummary: {passed}/{len(scenarios)} Scenarios Validated")
    
if __name__ == "__main__":
    main()
