import json
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, f1_score, precision_recall_curve, auc, accuracy_score, precision_score, recall_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.pipeline import Pipeline
from backend import config
from backend import data_loader, features, model_registry

def evaluate():
    print("--- GeoFireNet ML Pipeline: Evaluation Phase ---")
    
    # 1. Load Data & Model
    df = data_loader.load_data()
    X_train, X_test, y_train, y_test = data_loader.get_train_test_splits(df)
    
    try:
        rf_model = model_registry.load_model()
    except Exception as e:
        print(f"Failed to load model: {e}")
        return
        
    print(f"Evaluating models on {len(X_test)} test samples...")
    
    # 2. Setup Comparison Models (Logistic Regression & Gradient Boosting as XGBoost fallback)
    preprocessor = features.create_preprocessing_pipeline()
    
    lr_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(class_weight='balanced', random_state=config.RANDOM_SEED, max_iter=1000))
    ])
    
    gb_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', GradientBoostingClassifier(random_state=config.RANDOM_SEED))
    ])
    
    # Train comparison models
    print("Training Logistic Regression and Gradient Boosting models for comparison...")
    lr_pipeline.fit(X_train, y_train)
    gb_pipeline.fit(X_train, y_train)
    
    models = {
        "Random Forest (Selected)": rf_model,
        "Logistic Regression": lr_pipeline,
        "Gradient Boosting": gb_pipeline
    }
    
    comparison_results = {}
    
    for name, model in models.items():
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1]
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc = roc_auc_score(y_test, y_proba)
        
        comparison_results[name] = {
            "Accuracy": float(acc),
            "Precision": float(prec),
            "Recall": float(rec),
            "F1-Score": float(f1),
            "ROC-AUC": float(roc)
        }
        
    # Save comparison results
    with open(os.path.join(config.ARTIFACTS_DIR, "model_comparison.json"), "w") as f:
        json.dump(comparison_results, f, indent=4)
    print("Saved Model Comparison to model_comparison.json")
    
    # 3. Detailed Evaluation for Selected Model (Random Forest)
    y_pred_rf = rf_model.predict(X_test)
    y_proba_rf = rf_model.predict_proba(X_test)[:, 1]
    
    report = classification_report(y_test, y_pred_rf, output_dict=True)
    
    # 4. Generate & Save Confusion Matrix Plot
    cm = confusion_matrix(y_test, y_pred_rf)
    tn, fp, fn, tp = cm.ravel()
    
    print("\n--- Confusion Matrix Interpretation (Random Forest) ---")
    print(f"True Positives (TP): {tp} - High-risk wildfire condition correctly detected. (SUCCESS)")
    print(f"True Negatives (TN): {tn} - Safe condition correctly identified. (SUCCESS)")
    print(f"False Positives (FP): {fp} - Unnecessary alert generated. (ACCEPTABLE COST)")
    print(f"False Negatives (FN): {fn} - Missed dangerous condition. (CRITICAL FAILURE)")
    print("Safety-first design prioritizes minimizing FN (maximizing Recall) even if FP increases.")
    
    cm_results = {
        "TP": int(tp), "TN": int(tn), "FP": int(fp), "FN": int(fn)
    }
    with open(os.path.join(config.ARTIFACTS_DIR, "confusion_matrix_values.json"), "w") as f:
        json.dump(cm_results, f, indent=4)
        
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Low Risk', 'High Risk'], 
                yticklabels=['Low Risk', 'High Risk'])
    plt.ylabel('Actual')
    plt.xlabel('Predicted (Threshold 0.5)')
    plt.title('Wildfire Risk Confusion Matrix (Random Forest)')
    plt.tight_layout()
    plt.savefig(config.CONFUSION_MATRIX_PATH)
    plt.close()
    print(f"Saved Confusion Matrix to {config.CONFUSION_MATRIX_PATH}")
    
    # 5. Extract Feature Importances (if applicable)
    classifier = rf_model.named_steps['classifier']
    feature_eng = rf_model.named_steps['preprocessor'].named_steps['feature_eng']
    
    if hasattr(classifier, 'feature_importances_'):
        feature_names = feature_eng.get_feature_names_out()
        importances = classifier.feature_importances_
        
        feature_importance_dict = {
            name: float(importance) 
            for name, importance in zip(feature_names, importances)
        }
        with open(config.FEATURE_IMPORTANCE_JSON_PATH, 'w') as f:
            json.dump(feature_importance_dict, f, indent=4)
        print(f"Saved Feature Importances JSON to {config.FEATURE_IMPORTANCE_JSON_PATH}")
        
        plt.figure(figsize=(8, 5))
        sns.barplot(x=importances, y=feature_names, palette='viridis')
        plt.title('Feature Importances for Wildfire Risk')
        plt.xlabel('Relative Importance')
        plt.tight_layout()
        plt.savefig(config.FEATURE_IMPORTANCE_PATH)
        plt.close()
    else:
        print("Selected model does not support feature_importances_.")

if __name__ == "__main__":
    evaluate()
