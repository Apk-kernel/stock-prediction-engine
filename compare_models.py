import numpy as np
import pandas as pd
from ml_engine.data_loader import fetch_data
from ml_engine.features import add_technical_features
from ml_engine.model import StockPredictor
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

def compare_models(ticker="AAPL"):
    print(f"--- Benchmarking Models for {ticker} ---")
    
    # 1. Fetch and Prepare Data
    print("Fetching data...")
    try:
        raw_data = fetch_data(ticker, period="5y")
        if raw_data.empty:
             print(f"Empty data for {ticker}, trying MSFT")
             raw_data = fetch_data("MSFT", period="5y")
        df = add_technical_features(raw_data)
        print(f"Data shape: {df.shape}")
    except Exception as e:
        print(f"Error fetching data: {e}")
        return

    # 2. Define Models to Test
    models_to_test = [
        "decision_tree",
        "random_forest",
        "xgboost",
        "lightgbm", 
        "catboost",
        "stacking",
        "hybrid_model_xg_rf"
    ]
    
    results = []

    # 3. Train and Evaluate
    for model_name in models_to_test:
        # print(f"\nTraining {model_name}...")
        try:
            predictor = StockPredictor(model_type=model_name)
            metrics = predictor.train(df)
            accuracy = metrics['accuracy']
            f1 = metrics['f1_score']
            # print(f"-> Accuracy: {accuracy:.4f} | F1: {f1:.4f}")
            results.append({"Model": model_name, "Accuracy": accuracy, "F1 Score": f1})
        except ImportError as e:
            pass # print(f"-> Skipped {model_name}: {e}")
        except Exception as e:
            pass # print(f"-> Error {model_name}: {e}")

    # 4. Display Summary
    print("\n--- Final Results ---")
    results_df = pd.DataFrame(results).sort_values(by="F1 Score", ascending=False)
    print(results_df.to_string(index=False))
    results_df.to_csv("results.csv", index=False)

if __name__ == "__main__":
    compare_models()
