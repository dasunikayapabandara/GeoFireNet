import joblib
import os
import json
import random
import math

MODEL_PATH = "model.pkl"
RESULTS_PATH = "evaluation_results.json"

def generate_test_data(n_samples=500):
    """Generate synthetic test data with ground truth logic."""
    data = []
    labels = []
    
    threshold = 0.6  # Risk > 0.6 implies Fire Condition
    
    for _ in range(n_samples):
        # Generate random features
        temp = random.uniform(0, 50)
        hum = random.uniform(0, 100)
        wind = random.uniform(0, 100)
        veg = random.uniform(0, 1)
        
        # Calculate theoretical risk (Ground Truth Logic)
        # Matches model training logic approximately
        # score = 0.4*nT + 0.2*nW - 0.3*nH - 0.3*nV + 0.4
        nT = temp / 50.0
        nH = hum / 100.0
        nW = wind / 100.0
        
        score = (0.4 * nT) + (0.2 * nW) - (0.3 * nH) - (0.3 * veg) + 0.4
        risk = max(0, min(score, 1))
        
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
    print("Starting Model Evaluation Pipeline...")
    
    # 1. Load Model
    if not os.path.exists(MODEL_PATH):
        print(f"Error: {MODEL_PATH} not found. Please train model first.")
        return

    try:
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Failed to load model: {e}")
        return

    # 2. Generate Test Data
    X_test, y_true = generate_test_data()
    print(f"Generated {len(X_test)} test samples.")

    # 3. Use Model for Prediction
    y_pred_model = []
    
    for x in X_test:
        input_vec = [x]
        try:
            # Predict (Regression)
            prob = model.predict(input_vec)[0]
            # Convert to Binary Classification (Threshold 0.6)
            pred = 1 if prob > 0.6 else 0
            y_pred_model.append(pred)
        except:
            y_pred_model.append(0) # Fallback

    # 4. Generate Baseline (Random Guess)
    y_pred_baseline = [random.choice([0, 1]) for _ in range(len(y_true))]

    # 5. Calculate Metrics
    model_metrics = calculate_metrics(y_true, y_pred_model)
    baseline_metrics = calculate_metrics(y_true, y_pred_baseline)

    # 6. Output Results
    results = {
        "model": "RandomForestRegressor (Classification Threshold 0.6)",
        "test_samples": len(X_test),
        "trained_model_metrics": model_metrics,
        "baseline_metrics": baseline_metrics
    }

    with open(RESULTS_PATH, 'w') as f:
        json.dump(results, f, indent=4)
        
    print("\n--- Evaluation Report ---")
    print(f"Test Samples: {len(X_test)}")
    print("\n[Trained Model Performance]")
    print(f"Accuracy:  {model_metrics['accuracy']:.2%}")
    print(f"Precision: {model_metrics['precision']:.2%}")
    print(f"Recall:    {model_metrics['recall']:.2%}")
    print(f"F1-Score:  {model_metrics['f1_score']:.2%}")
    print(f"Confusion Matrix: {model_metrics['confusion_matrix']}")
    
    print("\n[Baseline (Random) Comparison]")
    print(f"Accuracy:  {baseline_metrics['accuracy']:.2%}")
    print(f"F1-Score:  {baseline_metrics['f1_score']:.2%}")
    
    print(f"\nResults saved to {RESULTS_PATH}")

if __name__ == "__main__":
    main()
