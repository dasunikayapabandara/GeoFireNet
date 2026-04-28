import json
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, f1_score, precision_recall_curve, auc
from backend import config
from backend import data_loader, model_registry

def evaluate():
    print("--- GeoFireNet ML Pipeline: Evaluation Phase ---")
    
    # 1. Load Data & Model
    df = data_loader.load_data()
    _, X_test, _, y_test = data_loader.get_train_test_splits(df)
    
    try:
        model = model_registry.load_model()
    except Exception as e:
        print(f"Failed to load model: {e}")
        return
        
    print(f"Evaluating model on {len(X_test)} test samples...")
    
    # 2. Predict (using default 0.5 threshold for standard metrics)
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1] # Probability of High Risk
    
    # 3. Calculate Core Metrics
    roc_auc = roc_auc_score(y_test, y_proba)
    precision, recall, thresholds_pr = precision_recall_curve(y_test, y_proba)
    pr_auc = auc(recall, precision)
    
    report = classification_report(y_test, y_pred, output_dict=True)
    
    results = {
        "test_samples": len(X_test),
        "roc_auc": float(roc_auc),
        "pr_auc": float(pr_auc),
        "classification_report": report
    }
    
    # Save JSON metrics
    with open(config.EVAL_RESULTS_PATH, 'w') as f:
        json.dump(results, f, indent=4)
        
    print(f"ROC-AUC: {roc_auc:.3f}")
    print(f"PR-AUC: {pr_auc:.3f}")
    print(f"F1 Score (Threshold=0.5): {report['1']['f1-score']:.3f}")
    print(f"Recall (Threshold=0.5): {report['1']['recall']:.3f}")
    
    # 4. Generate & Save Confusion Matrix Plot
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Low Risk', 'High Risk'], 
                yticklabels=['Low Risk', 'High Risk'])
    plt.ylabel('Actual')
    plt.xlabel('Predicted (Threshold 0.5)')
    plt.title('Wildfire Risk Confusion Matrix')
    plt.tight_layout()
    plt.savefig(config.CONFUSION_MATRIX_PATH)
    plt.close()
    print(f"Saved Confusion Matrix to {config.CONFUSION_MATRIX_PATH}")
    
    # 5. Extract Feature Importances (if applicable)
    classifier = model.named_steps['classifier']
    feature_eng = model.named_steps['preprocessor'].named_steps['feature_eng']
    
    if hasattr(classifier, 'feature_importances_'):
        feature_names = feature_eng.get_feature_names_out()
        importances = classifier.feature_importances_
        
        # Plot
        plt.figure(figsize=(8, 5))
        sns.barplot(x=importances, y=feature_names, palette='viridis')
        plt.title('Feature Importances for Wildfire Risk')
        plt.xlabel('Relative Importance')
        plt.tight_layout()
        plt.savefig(config.FEATURE_IMPORTANCE_PATH)
        plt.close()
        print(f"Saved Feature Importances to {config.FEATURE_IMPORTANCE_PATH}")
    else:
        print("Selected model does not support feature_importances_. Plot skipped.")

if __name__ == "__main__":
    evaluate()
