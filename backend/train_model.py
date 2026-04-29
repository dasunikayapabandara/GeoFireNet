from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV
from backend import config
from backend import data_loader, features, model_registry

def train_and_compare():
    print("--- GeoFireNet ML Pipeline: Training Phase ---")
    
    # 1. Load Data
    df = data_loader.load_data()
    X_train, X_test, y_train, y_test = data_loader.get_train_test_splits(df)
    
    # Ensure consistent input feature order
    X_train = X_train[config.RAW_FEATURES]
    X_test = X_test[config.RAW_FEATURES]
    
    # 2. Get Preprocessor
    preprocessor = features.create_preprocessing_pipeline()
    
    # 3. Define the Production Model (Random Forest)
    rf = RandomForestClassifier(class_weight='balanced', random_state=config.RANDOM_SEED)
    
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', rf)
    ])
    
    param_grid = {
        'classifier__n_estimators': [100, 200],
        'classifier__max_depth': [10, 15, None],
        'classifier__min_samples_split': [2, 5]
    }
    
    print("\nStarting Hyperparameter Tuning (GridSearchCV) for Random Forest...")
    grid_search = GridSearchCV(
        pipeline, param_grid, cv=3, scoring='roc_auc', n_jobs=-1
    )
    
    grid_search.fit(X_train, y_train)
    
    best_pipeline = grid_search.best_estimator_
    best_params = grid_search.best_params_
    best_score = grid_search.best_score_
    
    print(f"\nOptimization Complete.")
    print(f"Best Parameters: {best_params}")
    print(f"Best Cross-Validation ROC_AUC: {best_score:.3f}")
    
    # 4. Save Artifacts
    model_registry.save_model(best_pipeline)
    
    # 5. Save Metadata
    meta = {
        "selected_model": "RandomForestClassifier",
        "features": config.RAW_FEATURES,
        "training_parameters": best_params,
        "metrics": {
            "ROC_AUC": best_score
        },
        "seed": config.RANDOM_SEED
    }
    
    import json
    import os
    os.makedirs(config.ARTIFACTS_DIR, exist_ok=True)
    with open(os.path.join(config.ARTIFACTS_DIR, "training_meta.json"), "w") as f:
        json.dump(meta, f, indent=4)
        
    print("Training Complete. Proceed to Evaluate and Calibrate.")

if __name__ == "__main__":
    train_and_compare()
