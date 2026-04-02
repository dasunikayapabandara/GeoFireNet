import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.base import BaseEstimator, TransformerMixin
from backend.core import config

class WildfireFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Custom Scikit-Learn Transformer to engineer meaningful features.
    """
    def __init__(self, create_interactions=True):
        self.create_interactions = create_interactions
        self.feature_names_out_ = None
        
    def fit(self, X, y=None):
        return self

    def transform(self, X):
        # Allow processing of numpy arrays or dataframes
        if isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            df = pd.DataFrame(X, columns=config.RAW_FEATURES)
            
        # Optional: Clamp extreme outliers (soft enforcement)
        # Assuming Data is already clamped by the API, but doing it here ensures training/eval robustness
        df['temp'] = df['temp'].clip(lower=0, upper=60)
        df['humidity'] = df['humidity'].clip(lower=0, upper=100)
        df['wind'] = df['wind'].clip(lower=0, upper=150)
        df['veg_moisture'] = df['veg_moisture'].clip(lower=0, upper=1)
            
        if self.create_interactions:
            # Create a specific interaction proxy feature for: High Heat + High Wind = Exponential Drying
            # We scale them loosely to 0-1 ranges to make the multiplication meaningful
            n_temp = df['temp'] / 50.0 
            n_wind = df['wind'] / 100.0
            
            # The interaction feature
            df['temp_wind_interaction'] = n_temp * n_wind
            
        self.feature_names_out_ = df.columns.tolist()
        return df

    def get_feature_names_out(self, input_features=None):
        return self.feature_names_out_

def create_preprocessing_pipeline():
    """
    Creates the scikit-learn preprocessing pipeline.
    This pipeline handles missing values, scaling, and feature engineering.
    """
    
    # 1. Feature Engineering Step
    feature_eng = WildfireFeatureEngineer(create_interactions=True)
    
    # 2. Imputation and Scaling (applied to all features including engineered ones)
    # We use a placeholder for columns to be determined dynamically after feature engineering
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()) # Scaling helps LR models, RF is invariant but it doesn't hurt
    ])
    
    # Full Preprocessing Pipeline
    # Notice how we apply it. Feature Eng creates new columns, then we scale/impute them all.
    # Since all features in GeoFireNet are numeric right now, we can just apply numeric_transformer to all columns left after engineering.
    
    class FinalTransformer(BaseEstimator, TransformerMixin):
        def __init__(self, preprocessor):
            self.preprocessor = preprocessor
            
        def fit(self, X, y=None):
            X_transformed = feature_eng.fit_transform(X)
            self.preprocessor.fit(X_transformed)
            return self
            
        def transform(self, X):
            X_eng = feature_eng.transform(X)
            cols = feature_eng.get_feature_names_out()
            X_scaled = self.preprocessor.transform(X_eng)
            # Return DataFrame to keep feature names
            return pd.DataFrame(X_scaled, columns=cols, index=X.index if isinstance(X, pd.DataFrame) else None)
    
    # We wrap it nicely
    pipeline = Pipeline(steps=[
        ('feature_eng', WildfireFeatureEngineer(create_interactions=True)),
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Note: If we output a numpy array from SimpleImputer/StandardScaler, we will lose column names. 
    # To keep this clean for SHAP / Feature Importances, we will set set_output
    pipeline.set_output(transform="pandas")
    
    return pipeline
