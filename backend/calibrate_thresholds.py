import random
import os
import sys

# Pure Python Model Logic (Standalone)
class PurePythonModel:
    def __init__(self):
        pass

    def predict(self, temp, hum, wind, veg):
        # Fallback ML Logic (Simulated)
        n_temp = min(max(temp / 50.0, 0), 1)
        n_wind = min(max(wind / 100.0, 0), 1)
        n_hum = min(max(hum / 100.0, 0), 1)
        n_veg = min(max(veg, 0), 1)
        
        # Linear Score
        score = (40 * n_temp) + (20 * n_wind) - (30 * n_hum) - (30 * n_veg) + 40
        
        # Non-linear boost
        if n_temp > 0.8 and n_wind > 0.7:
            score += 20
        
        # Noise
        noise = random.uniform(-5, 5) 
        score += noise
        return min(max(score, 0), 100)

def generate_data(n=1000):
    data = []
    for _ in range(n):
        temp = random.uniform(0, 50)
        hum = random.uniform(0, 100)
        wind = random.uniform(0, 100)
        veg = random.uniform(0, 1)
        
        # Ground Truth Logic (Slightly different from model to simulate reality gap)
        nT = temp / 50.0
        nH = hum / 100.0
        nW = wind / 100.0
        
        # True risk (hidden variable)
        true_score = (40 * nT) + (20 * nW) - (30 * nH) - (30 * veg) + 40
        if nT > 0.8 and nW > 0.7: true_score += 20
        
        # Label: If true score > 60, it's a FIRE
        label = 1 if true_score > 60 else 0
        
        data.append({
            "features": [temp, hum, wind, veg],
            "label": label
        })
    return data

def analyze_thresholds():
    model = PurePythonModel()
    data = generate_data(2000)
    
    scores = []
    labels = []
    for d in data:
        s = model.predict(*d["features"])
        scores.append(s)
        labels.append(d["label"])
        
    print(f"Data Points: {len(data)}")
    print(f"Positive Labels (Fires): {sum(labels)}")
    
    # Test Thresholds
    thresholds = [30, 40, 50, 60, 70, 80, 85, 90]
    
    print("\n--- Threshold Analysis (Trying to detect Fire) ---")
    print(f"{'Threshold':<10} | {'Recall':<10} | {'Precision':<10} | {'F1':<10} | {'FP Rate':<10}")
    print("-" * 60)
    
    best_f1 = 0
    best_thresh = 0
    
    for t in thresholds:
        tp = 0
        fp = 0
        fn = 0
        tn = 0
        
        for score, label in zip(scores, labels):
            pred = 1 if score >= t else 0
            if pred == 1 and label == 1: tp += 1
            elif pred == 1 and label == 0: fp += 1
            elif pred == 0 and label == 1: fn += 1
            elif pred == 0 and label == 0: tn += 1
            
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        fp_rate = fp / (fp + tn) if (fp + tn) > 0 else 0
        
        print(f"{t:<10} | {recall:.2%}    | {precision:.2%}    | {f1:.2f}       | {fp_rate:.2%}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_thresh = t
            
    print(f"\nOptimal Single Threshold for F1: {best_thresh}")
    
    # Analyze Risk Levels distribution
    print("\n--- Proposed Levels Distribution (New Tuned Thresholds) ---")
    proposed_levels = [
        ("Low", 0, 30),
        ("Moderate", 30, 50),
        ("High", 50, 80),
        ("Extreme", 80, 100)
    ]
    
    counts = {l[0]: 0 for l in proposed_levels}
    for s in scores:
        for name, low, high in proposed_levels:
            if low <= s < high:
                counts[name] += 1
                break
        if s >= 100: counts["Extreme"] += 1 # Catch 100
                
    for name, count in counts.items():
        print(f"{name}: {count} ({count/len(scores):.1%})")

if __name__ == "__main__":
    analyze_thresholds()
