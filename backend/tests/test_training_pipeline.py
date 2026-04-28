import pytest
import pandas as pd
import numpy as np
from backend import data_loader, features
from backend import config

def test_data_loader_generation(tmp_path):
    """Test that synthetic data generates with correct columns and no extreme leaks."""
    test_path = tmp_path / "test_data.csv"
    df = data_loader.generate_synthetic_data(n_samples=100, save_path=test_path)
    assert len(df) == 100
    assert all(col in df.columns for col in config.RAW_FEATURES)
    assert config.TARGET_COLUMN in df.columns
    
    # Check bounds
    assert df['temp'].max() <= 50.0
    assert df['temp'].min() >= 0.0

def test_feature_engineering_pipeline():
    """Test that the scikit-learn pipeline correctly transforms data."""
    df = pd.DataFrame({
        'temp': [40, 20],
        'humidity': [10, 80],
        'wind': [80, 10],
        'veg_moisture': [0.1, 0.9]
    })
    
    pipeline = features.create_preprocessing_pipeline()
    transformed = pipeline.fit_transform(df)
    
    # Check that interaction feature was created and scaled
    assert 'temp_wind_interaction' in transformed.columns
    assert len(transformed.columns) == 5 # 4 original + 1 engineered
    
    # Check scaling (mean should be close to 0)
    assert np.isclose(transformed['temp'].mean(), 0, atol=1e-7)
    
def test_missing_value_imputation():
    """Test that the pipeline handles missing values without crashing."""
    df = pd.DataFrame({
        'temp': [40, 20, 30],
        'humidity': [10, np.nan, 30],
        'wind': [80, 10, 40],
        'veg_moisture': [0.1, np.nan, 0.5]
    })
    
    pipeline = features.create_preprocessing_pipeline()
    transformed = pipeline.fit_transform(df)
    
    # Ensure no NaNs remain
    assert not transformed.isna().any().any()
