import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.model_selection import cross_validate
from backend.core import config
from backend import data_loader, features, model_registry

def train_and_compare():
    print("--- GeoFireNet ML Pipeline: Training Phase ---")
    
    # 1. Load Data
    df = data_loader.load_data()
    X_train, X_test, y_train, y_test = data_loader.get_train_test_splits(df)
    
    # 2. Get Preprocessor
    preprocessor = features.create_preprocessing_pipeline()
    
    # 3. Define Models to Compare
    # We use class_weight='balanced' where available to handle potential imbalance
    models = {
        "Logistic Regression": LogisticRegression(class_weight='balanced', random_state=config.RANDOM_SEED),
        "Random Forest": RandomForestClassifier(n_estimators=100, class_weight='balanced', max_depth=10, random_state=config.RANDOM_SEED),
        "Gradient Boosting": HistGradientBoostingClassifier(random_state=config.RANDOM_SEED) # HistGB doesn't have class_weight directly, but it's very robust
    }
    
    results = {}
    best_model_name = None
    best_recall_score = -1.0
    best_pipeline = None

    print("\nStarting Cross-Validation (Metric: Recall for Safety-First prioritization)...")
    for name, model in models.items():
        # Create full pipeline
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', model)
        ])
        
        # We test cv=5 for robustness
        # Since this is an early warning system, we heavily favor Recall (Sensitivity)
        # However, we track F1 and ROC_AUC too.
        cv_res = cross_validate(
            pipeline, X_train, y_train, 
            cv=5, 
            scoring={'recall': 'recall', 'f1': 'f1', 'roc_auc': 'roc_auc'},
            n_jobs=-1
        )
        
        mean_recall = cv_res['test_recall'].mean()
        mean_f1 = cv_res['test_f1'].mean()
        mean_roc = cv_res['test_roc_auc'].mean()
        
        results[name] = {
            "Recall": mean_recall,
            "F1": mean_f1,
            "ROC_AUC": mean_roc
        }
        print(f"[{name}] Recall: {mean_recall:.3f} | F1: {mean_f1:.3f} | ROC_AUC: {mean_roc:.3f}")
        
    print("\n--- Model Selection ---")
    # For a project requiring defense of non-linear interactions mapping edge cases, 
    # RF or GB are theoretically superior. We will pick Random Forest usually due to interpretability 
    # via feature_importances_, but let's automate selection: If RF or GB recall is high, prefer it.
    
    # Let's just pick the best by F1 to be balanced, as we will threshold-tune for Recall later anyway.
    # Actually, the user asked to optimize for Recall.
    # But pre-threshold-tuning recall is just default threshold 0.5.
    # We will pick the model with the highest ROC_AUC, as it has the best discriminative power, 
    # and then calibrate the threshold for Recall in calibrate_thresholds.py.
    
    best_model_name = max(results, key=lambda k: results[k]['ROC_AUC'])
    print(f"Selected Model based on ROC-AUC (Global Discriminator Power): {best_model_name}")
    
    # 4. Train Final Best Model on all training data
    final_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', models[best_model_name])
    ])
    
    final_pipeline.fit(X_train, y_train)
    
    # 5. Save Artifacts
    model_registry.save_model(final_pipeline)
    
    # We can also save a small metadata file
    best_model_obj = models[best_model_name]
    meta = {
        "selected_model": best_model_name,
        "features": config.RAW_FEATURES,
        "training_parameters": best_model_obj.get_params() if hasattr(best_model_obj, "get_params") else {},
        "metrics": {
            "Recall": results[best_model_name]["Recall"],
            "F1": results[best_model_name]["F1"],
            "ROC_AUC": results[best_model_name]["ROC_AUC"]
        },
        "cv_results": results,
        "seed": config.RANDOM_SEED
    }
    import json
    import os
    os.makedirs(config.ARTIFACTS_DIR, exist_ok=True)
    with open(config.ARTIFACTS_DIR / "training_meta.json", "w") as f:
        json.dump(meta, f, indent=4)
        
    print("Training Complete. Proceed to Threshold Calibration.")

if __name__ == "__main__":
    train_and_compare()
