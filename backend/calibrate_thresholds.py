import numpy as np
from sklearn.metrics import recall_score, precision_score, f1_score
from backend import data_loader, model_registry

def calibrate():
    print("--- GeoFireNet ML Pipeline: Threshold Calibration ---")
    
    # 1. Load Data & Model
    df = data_loader.load_data()
    _, X_test, _, y_test = data_loader.get_train_test_splits(df)
    model = model_registry.load_model()
    
    # 2. Get Probabilities
    y_proba = model.predict_proba(X_test)[:, 1]
    
    # 3. Search Thresholds aiming for Recall > 0.99
    # We want a system that does not miss fires.
    thresholds = np.linspace(0.01, 0.99, 99)
    
    best_thresh = 0.5
    best_f1_at_high_recall = 0
    
    target_recall = 0.99
    
    print(f"Calibrating to achieve Recall >= {target_recall}...")
    
    for t in thresholds:
        y_pred = (y_proba >= t).astype(int)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        # We want the highest threshold that still maintains our target recall
        # Higher threshold = fewer false alarms (better precision)
        if recall >= target_recall:
            if f1 > best_f1_at_high_recall:
                best_f1_at_high_recall = f1
                best_thresh = t
                
    # Evaluate chosen threshold
    y_pred_final = (y_proba >= best_thresh).astype(int)
    final_recall = recall_score(y_test, y_pred_final)
    final_precision = precision_score(y_test, y_pred_final, zero_division=0)
    
    print(f"\n[Calibration Results]")
    print(f"Selected Threshold: {best_thresh:.3f}")
    print(f"Resulting Recall:    {final_recall:.3f} (Safety Goal: 1.0 or near)")
    print(f"Resulting Precision: {final_precision:.3f}")
    
    # 4. Map to Risk Levels (Business Logic)
    # If High Risk defined as >= best_thresh, we partition the space
    
    # E.g. best_thresh = 0.3
    # Low = 0 to 0.15 (half of thresh)
    # Moderate = 0.15 to thresh
    # High = thresh to 0.8
    # Extreme = 0.8+
    
    low_bound = round(best_thresh * 0.5, 3)
    mod_bound = round(best_thresh, 3)
    high_bound = round(best_thresh + ((1.0 - best_thresh) * 0.5), 3) # halfway between thresh and 1.0
    
    risk_levels = {
        "Low": low_bound,
        "Moderate": mod_bound,
        "High": high_bound,
        "Extreme": 1.0
    }
    
    print("\n[Generated Risk Level Boundaries]")
    for level, bound in risk_levels.items():
        print(f"{level}: Probability up to {bound:.3f}")
        
    # 5. Save Thresholds Artifact
    model_registry.save_thresholds(risk_levels)

if __name__ == "__main__":
    calibrate()
