import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from . import config
import os

def generate_synthetic_data(n_samples=3000, save_path=config.DATASET_PATH, seed=None):
    """
    Generate synthetic data mimicking California summer climate and save to disk.
    Allows for reproducible training runs.
    """
    if seed is not None:
        np.random.seed(seed)
    else:
        np.random.seed(config.RANDOM_SEED)
        
    print(f"Generating {n_samples} synthetic records...")
    
    # Feature distributions
    temp = np.random.uniform(0, 50, n_samples)
    humidity = np.random.uniform(0, 100, n_samples)
    wind = np.random.uniform(0, 100, n_samples)
    veg_moisture = np.random.uniform(0, 1, n_samples)
    
    df = pd.DataFrame({
        'temp': temp,
        'humidity': humidity,
        'wind': wind,
        'veg_moisture': veg_moisture
    })
    
    # Introduce a few Missing Values to simulate real-world data and test imputation
    n_missing = int(n_samples * 0.05)
    missing_idx = np.random.choice(n_samples, n_missing, replace=False)
    df.loc[missing_idx, 'humidity'] = np.nan
    
    # Ground Truth Risk Logic
    # Fill NA temporarily just for Ground Truth generation to not make it NA
    temp_hum = df['humidity'].fillna(method='ffill') 
    
    nT = df['temp'] / 50.0
    nH = temp_hum / 100.0
    nW = df['wind'] / 100.0
    nV = df['veg_moisture']
    
    # True underlying linear risk
    true_score = (40 * nT) + (20 * nW) - (30 * nH) - (30 * nV) + 40
    
    # True non-linear interaction (Extreme Heat + High Wind)
    interaction_mask = (nT > 0.8) & (nW > 0.7)
    true_score[interaction_mask] += 20
    
    # Add random noise
    true_score += np.random.normal(0, 5, n_samples)
    
    # Define Binary Target: Risk > 50 is a 'Fire Risk Event'
    # This establishes the dataset as a classification problem instead of regression
    df[config.TARGET_COLUMN] = (true_score > 50).astype(int)
    
    # Save to disk
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    df.to_csv(save_path, index=False)
    print(f"Dataset saved to {save_path}")
    print(f"Class distribution:\n{df[config.TARGET_COLUMN].value_counts(normalize=True)}")
    return df

def load_data(path=config.DATASET_PATH):
    """
    Load the dataset. If it doesn't exist, generate it.
    """
    if not os.path.exists(path):
        print(f"Dataset not found at {path}. Generating new synthetic dataset.")
        return generate_synthetic_data(save_path=path)
        
    print(f"Loading dataset from {path}...")
    df = pd.read_csv(path)
    return df

def get_train_test_splits(df):
    """
    Perform Stratified Train/Test split.
    """
    print(f"Splitting data with test_size={config.TEST_SIZE} and seed={config.RANDOM_SEED}...")
    X = df[config.RAW_FEATURES]
    y = df[config.TARGET_COLUMN]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=config.TEST_SIZE, 
        random_state=config.RANDOM_SEED,
        stratify=y # Stratification ensures class balance is maintained
    )
    
    print(f"Train samples: {len(X_train)} (Positive: {y_train.sum()})")
    print(f"Test samples: {len(X_test)} (Positive: {y_test.sum()})")
    
    return X_train, X_test, y_train, y_test
