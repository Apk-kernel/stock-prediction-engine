import pandas as pd
import numpy as np
from ml_engine.data_loader import fetch_data
from ml_engine.features import add_technical_features
from ml_engine.model import StockPredictor
import warnings

warnings.filterwarnings('ignore')

def optimize_threshold(ticker="AAPL"):
    print(f"--- Optimizing Threshold for {ticker} ---")
    
    # 1. Pipeline
    print("1. Fetching Data...")
    raw = fetch_data(ticker, period="5y") # Long period for simulation
    df = add_technical_features(raw)
    
    print("2. Training Hybrid Model...")
    predictor = StockPredictor(model_type='hybrid_model_xg_rf')
    res = predictor.train(df)
    
    # Extract test set data
    y_true = np.array(res['y_true'])
    y_probs = np.array(res['y_prob'])
    
    # We need the corresponding 'Daily_Return' for the test set periods to calculate profit.
    # The 'train' method splits the last 20% as test.
    # So we take the last 20% of the DataFrame.
    test_size = int(len(df) * 0.2)
    test_df = df.iloc[-test_size:].copy()
    
    # Verify alignment (simple check)
    if len(test_df) != len(y_probs):
        print(f"Warning: Length mismatch. Test DF: {len(test_df)}, Probs: {len(y_probs)}")
        # Adjust to min length
        min_len = min(len(test_df), len(y_probs))
        test_df = test_df.iloc[:min_len]
        y_probs = y_probs[:min_len]

    # Daily returns of the asset (Buy & Hold benchmark)
    # Target in features is shifted, but 'Daily_Return' is "Close/PrevClose - 1" for THAT day.
    # If we predict for tomorrow, we act tomorrow? 
    # Actually, model predicts target = (Close[t+1] > Close[t]).
    # If we predict UP at end of day t, we buy at Close[t] (or Open[t+1]) and sell at Close[t+1].
    # Ideally we use Close-to-Close return of t+1.
    # The 'Daily_Return' column in test_df is (Close[t] - Close[t-1])/Close[t-1].
    # So we need the NEXT day's return to evaluate the trade made on Today's prediction.
    
    # Let's shift the returns back to align with the prediction made at t.
    # Prediction at row i targets movement for i+1.
    # Return at row i+1 is the outcome.
    market_returns = test_df['Daily_Return'].shift(-1).fillna(0).values

    print("3. Simulating Trades...")
    thresholds = np.arange(0.3, 0.75, 0.05)
    results = []

    for t in thresholds:
        # Strategy: If prob > t, Buy (1). Else Cash (0).
        signals = (y_probs > t).astype(int)
        
        # Strategy Returns
        strategy_returns = signals * market_returns
        
        # Metrics
        total_return_pct = (np.prod(1 + strategy_returns) - 1) * 100
        
        # Sharpe Ratio (annualized)
        daily_mean = np.mean(strategy_returns)
        daily_std = np.std(strategy_returns)
        if daily_std == 0:
            sharpe = 0
        else:
            sharpe = (daily_mean / daily_std) * np.sqrt(252)
            
        # Win Rate of trades taken
        trades_taken = np.sum(signals)
        if trades_taken > 0:
            # A "Win" is when we bought (signal=1) and market went up (return > 0)
            wins = np.sum((signals == 1) & (market_returns > 0))
            win_rate = (wins / trades_taken) * 100
        else:
            win_rate = 0
            
        results.append({
            "Threshold": t,
            "Net Profit %": total_return_pct,
            "Sharpe": sharpe,
            "Trades": trades_taken,
            "Win Rate %": win_rate
        })
        
    # 4. Report
    rdf = pd.DataFrame(results)
    print("\n--- Simulation Results ---")
    print(rdf.round(2).to_string(index=False))
    
    # Best by Sharpe
    best_sharpe = rdf.loc[rdf['Sharpe'].idxmax()]
    print(f"\nBest Threshold (Sharpe): {best_sharpe['Threshold']:.2f}")
    
    # Best by Profit
    best_profit = rdf.loc[rdf['Net Profit %'].idxmax()]
    print(f"Best Threshold (Profit): {best_profit['Threshold']:.2f}")
    
    rdf.to_csv("threshold_results.csv", index=False)

if __name__ == "__main__":
    optimize_threshold()
