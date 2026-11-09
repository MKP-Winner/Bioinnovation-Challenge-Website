# alzheimers_prediction_model.py
"""
Alzheimer's Disease Prediction Model using Genetic Data
--------------------------------------------------------
This script creates a synthetic genetic dataset focusing on key risk alleles 
(such as APOE ε4 dosage and relevant TREM2, BIN1, and CLU SNPs) and implements 
a Machine Learning classification pipeline (Random Forest) to predict disease risk.

Author: AI Collaborator
Date: September 2026
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib

def generate_synthetic_genetic_data(num_samples=1000, random_seed=42):
    """
    Generates a synthetic dataset modeling genetic risk factors for Alzheimer's.
    Features:
      - APOE_e4_copies: 0, 1, or 2 copies (strongest genetic risk factor)
      - SNP_TREM2: 0, 1, or 2 risk alleles
      - SNP_BIN1: 0, 1, or 2 risk alleles
      - SNP_CLU: 0, 1, or 2 risk alleles
      - Polygenic_Score_Background: Continuous baseline genetic variance
    """
    np.random.seed(random_seed)
    
    # Simulating allele frequencies/dosages based on rough population genetics
    apoe_e4 = np.random.choice([0, 1, 2], size=num_samples, p=[0.75, 0.22, 0.03])
    trem2 = np.random.choice([0, 1, 2], size=num_samples, p=[0.95, 0.045, 0.005])
    bin1 = np.random.choice([0, 1, 2], size=num_samples, p=[0.60, 0.32, 0.08])
    clu = np.random.choice([0, 1, 2], size=num_samples, p=[0.65, 0.30, 0.05])
    background_polygenic = np.random.normal(0, 1, size=num_samples)
    
    # Calculate a log-odds risk score to determine the label (Alzheimer's vs Control)
    # Weights approximate the impact/odds ratios of these genetic markers
    log_odds = (-2.0 + 
                1.5 * apoe_e4 + 
                1.2 * trem2 + 
                0.4 * bin1 + 
                0.3 * clu + 
                0.5 * background_polygenic)
    
    # Convert log-odds to probabilities using the logistic function
    probabilities = 1 / (1 + np.exp(-log_odds))
    
    # Assign target label based on probability threshold
    target = (probabilities > np.random.uniform(0, 1, size=num_samples)).astype(int)
    
    df = pd.DataFrame({
        'APOE_e4_copies': apoe_e4,
        'SNP_TREM2': trem2,
        'SNP_BIN1': bin1,
        'SNP_CLU': clu,
        'Background_Polygenic_Score': background_polygenic,
        'Alzheimers_Status': target
    })
    
    return df

def build_pipeline():
    print("Step 1: Generating synthetic genetic dataset...")
    data = generate_synthetic_genetic_data(num_samples=1200)
    
    # Define features and target variable
    X = data.drop(columns=['Alzheimers_Status'])
    y = data['Alzheimers_Status']
    
    # Split into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )
    
    print(f"Dataset split: {len(X_train)} training samples, {len(X_test)} testing samples.\n")
    
    print("Step 2: Training Random Forest Classifier...")
    # Initialize Random Forest Model
    model = RandomForestClassifier(
        n_estimators=100, 
        max_depth=6, 
        random_state=42, 
        class_weight='balanced'
    )
    model.fit(X_train, y_train)
    
    print("Step 3: Evaluating model performance...")
    # Predictions
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    # Performance metrics
    print("\n=== Classification Report ===")
    print(classification_report(y_test, y_pred))
    
    auc_score = roc_auc_score(y_test, y_prob)
    print(f"ROC-AUC Score: {auc_score:.4f}")
    
    # Feature Importances
    print("\n=== Genetic Feature Importances ===")
    importances = model.feature_importances_
    for name, importance in zip(X.columns, importances):
        print(f"{name}: {importance:.4f}")
        
    # Save the trained model to disk
    joblib.dump(model, 'generated/alzheimers_genetic_model.pkl')
    print("\nModel successfully saved to 'generated/alzheimers_genetic_model.pkl'.")
    
if __name__ == '__main__':
    build_pipeline()
