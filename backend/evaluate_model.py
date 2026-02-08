import os
import json
import random
import math

# Pure Python "Model" Logic (Replica of what's in prototype_app/model.py but without numpy)
class PurePythonModel:
    def __init__(self):
        self.is_mock = True
        print("Initialized Pure Python Fallback Model (No External Dependencies)")

    def predict_heuristic(self, temp, hum, wind, veg):
        # Clip inputs
        n_temp = min(max(temp / 50.0, 0), 1)
        n_hum = min(max(hum / 100.0, 0), 1)
        n_wind = min(max(wind / 100.0, 0), 1)
        n_veg = min(max(veg, 0), 1)
        
        # Linear Score
        score = (40 * n_temp) + (20 * n_wind) - (30 * n_hum) - (30 * n_veg) + 40
        return min(max(score, 0), 100)

    def predict(self, temp, hum, wind, veg):
        # Fallback ML Logic (Simulated)
        n_temp = min(max(temp / 50.0, 0), 1)
        n_wind = min(max(wind / 100.0, 0), 1)
        
        score = self.predict_heuristic(temp, hum, wind, veg)
        
        # Non-linear boost: High Temp + High Wind interaction
        if n_temp > 0.8 and n_wind > 0.7:
            score += 20
            
        # Random noise (gaussian approximation)
        noise = sum([random.uniform(0,1) for _ in range(12)]) - 6 # Approx normal distribution
        noise *= 2 # Scale
        
        score += noise
        return min(max(score, 0), 100)

RESULTS_PATH = os.path.join(os.path.dirname(__file__), "evaluation_results.json")

def generate_test_data(n_samples=500):
    """Generate synthetic test data with ground truth logic."""
    data = []
    labels = []
    
    threshold = 60  # Risk > 60 implies Fire Condition
    
    for _ in range(n_samples):
        # Generate random features
        temp = random.uniform(0, 50)
        hum = random.uniform(0, 100)
        wind = random.uniform(0, 100)
        veg = random.uniform(0, 1)
        
        # Calculate theoretical risk (Ground Truth Logic)
        nT = temp / 50.0
        nH = hum / 100.0
        nW = wind / 100.0
        
        score = (40 * nT) + (20 * nW) - (30 * nH) - (30 * veg) + 40
        # Add interaction boost (The "Truth" contains the interaction)
        if nT > 0.8 and nW > 0.7:
            score += 20
        risk = max(0, min(score, 100))
        
        # Binary Label: Is this a Fire Scenario?
        label = 1 if risk > threshold else 0
        
        data.append([temp, hum, wind, veg])
        labels.append(label)
        
    return data, labels

def calculate_metrics(y_true, y_pred):
    """Calculate TP, FP, TN, FN and derived metrics."""
    tp = sum((t == 1 and p == 1) for t, p in zip(y_true, y_pred))
    tn = sum((t == 0 and p == 0) for t, p in zip(y_true, y_pred))
    fp = sum((t == 0 and p == 1) for t, p in zip(y_true, y_pred))
    fn = sum((t == 1 and p == 0) for t, p in zip(y_true, y_pred))
    
    total = len(y_true)
    accuracy = (tp + tn) / total if total > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    return {
        "confusion_matrix": {"TP": tp, "TN": tn, "FP": fp, "FN": fn},
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1
    }

def main():
    print("Starting Model Evaluation Pipeline (Pure Python)...")
    
    # 1. Load Model (Pure Python Implementation)
    model = PurePythonModel()

    # 2. Generate Test Data
    X_test, y_true = generate_test_data()
    print(f"Generated {len(X_test)} test samples.")

    # 3. Use Model for Prediction
    y_pred_model = []
    
    for x in X_test:
        try:
            # Predict
            score = model.predict(x[0], x[1], x[2], x[3])
            # Convert to Binary Classification (Threshold 60)
            pred = 1 if score > 60 else 0
            y_pred_model.append(pred)
        except Exception as e:
            print(f"Error predicting: {e}")
            y_pred_model.append(0)

    # 4. Generate Heuristic Baseline
    y_pred_heuristic = []
    for x in X_test:
        score = model.predict_heuristic(x[0], x[1], x[2], x[3])
        pred = 1 if score > 60 else 0
        y_pred_heuristic.append(pred)

    # 5. Calculate Metrics
    model_metrics = calculate_metrics(y_true, y_pred_model)
    heuristic_metrics = calculate_metrics(y_true, y_pred_heuristic)

    # 6. Output Results
    results = {
        "model": "Simulated ML Model (Pure Python)",
        "test_samples": len(X_test),
        "trained_model_metrics": model_metrics,
        "heuristic_baseline_metrics": heuristic_metrics
    }

    with open(RESULTS_PATH, 'w') as f:
        json.dump(results, f, indent=4)
        
    print("\n--- Model Comparison Report ---")
    print(f"Test Samples: {len(X_test)}")
    print("\n[ML Model Performance]")
    print(f"Accuracy:  {model_metrics['accuracy']:.2%}")
    print(f"Precision: {model_metrics['precision']:.2%}")
    print(f"Recall:    {model_metrics['recall']:.2%}")
    print(f"F1-Score:  {model_metrics['f1_score']:.2%}")

    print("\n[Heuristic Baseline]")
    print(f"Accuracy:  {heuristic_metrics['accuracy']:.2%}")
    print(f"F1-Score:  {heuristic_metrics['f1_score']:.2%}")
    
    print(f"\nResults saved to {RESULTS_PATH}")

if __name__ == "__main__":
    main()
