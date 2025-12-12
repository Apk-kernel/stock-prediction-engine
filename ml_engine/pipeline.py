from .data_loader import fetch_data
from .features import add_technical_features
from .model import StockPredictor
import pandas as pd

def run_pipeline(ticker: str):
    # 1. Fetch data
    df = fetch_data(ticker)
    
    # 2. Features
    df_features = add_technical_features(df)
    
    if len(df_features) < 50:
        raise ValueError("Not enough data to train model")

    # 3. Train
    predictor = StockPredictor(model_type='hybrid_model_xg_rf')
    metrics = predictor.train(df_features)
    
    # 4. Predict
    prob = predictor.predict_proba(df_features)
    
    # Threshold logic (0.5 optimal)
    prediction = 1 if prob > 0.5 else 0
    
    # --- Reliability Metrics (New) ---
    # Extract test data portion to match model's test split
    test_size = int(len(df_features) * 0.2)
    test_df = df_features.iloc[-test_size:].copy()
    
    # Get actuals and probs from metrics
    y_true = metrics['y_true']
    y_prob = metrics['y_prob']
    
    # Match lengths if necessary (sometimes slight mismatch due to rounding in split)
    min_len = min(len(test_df), len(y_true))
    test_df = test_df.iloc[-min_len:]
    y_true = y_true[-min_len:]
    y_prob = y_prob[-min_len:]
    
    # --- Backtest Data (Full Test Set) ---
    # Shift returns for PnL calculation
    full_market_returns = test_df['Daily_Return'].shift(-1).fillna(0).values
    full_dates = test_df.index if isinstance(test_df.index, pd.DatetimeIndex) else pd.to_datetime(test_df['Date']) if 'Date' in test_df else range(len(test_df))
    
    backtest_data = []
    for i in range(len(y_prob)):
        d_str = full_dates[i].strftime('%Y-%m-%d') if hasattr(full_dates[i], 'strftime') else str(full_dates[i])
        backtest_data.append({
            "date": d_str,
            "prob": float(y_prob[i]),
            "market_return": float(full_market_returns[i])
        })

    # Focus on LAST 30 trades for the panel
    lookback = 30
    if len(y_true) > lookback:
        test_df = test_df.iloc[-lookback:]
        y_true = y_true[-lookback:]
        y_prob = y_prob[-lookback:]
        
    # Calculate Metrics for these 30 days
    correct_predictions = 0
    strategy_returns = []
    trade_log = []
    
    # Shift returns: We predict for T+1. The return is realized at T+1.
    # But 'Daily_Return' in the row is usually (Close[T] - Close[T-1])/Close[T-1].
    # So if we predict at index i (Close[T]), we want the return at index i+1 (Close[T+1]).
    # We will use the NEXT day's return for profit calc.
    market_returns = test_df['Daily_Return'].shift(-1).fillna(0).values
    
    dates = test_df.index if isinstance(test_df.index, pd.DatetimeIndex) else pd.to_datetime(test_df['Date']) if 'Date' in test_df else range(len(test_df))
    
    for i in range(len(y_true)):
        p = y_prob[i]
        actual = y_true[i]
        date_str = dates[i].strftime('%Y-%m-%d') if hasattr(dates[i], 'strftime') else str(dates[i])
        
        # Trade Signal
        signal = 1 if p > 0.5 else 0
        
        # Check correctness (Direction)
        is_correct = (signal == actual)
        if is_correct:
            correct_predictions += 1
            
        # PnL
        # If we bought (1), we get market return. If 0, we get 0.
        ret = market_returns[i] if signal == 1 else 0
        strategy_returns.append(ret)
        
        trade_log.append({
            "date": date_str,
            "signal": "UP" if signal == 1 else "DOWN",
            "prob": p,
            "actual": "UP" if actual == 1 else "DOWN",
            "return": ret,
            "is_correct": bool(is_correct)
        })

    # Summary Stats
    acc_30 = correct_predictions / len(y_true) if len(y_true) > 0 else 0
    net_profit = (pd.Series(strategy_returns) + 1).prod() - 1
    avg_return = pd.Series(strategy_returns).mean()

    reliability = {
        "accuracy_30d": acc_30,
        "profit_30d": net_profit,
        "avg_return": avg_return,
        "history": trade_log[::-1] # Reverse to show newest first
    }

    # 5. Prepare history for frontend (Chart data)
    # Take last 60 days
    recent_data = df_features.tail(60).copy()
    
    # Handle index (Date)
    if isinstance(recent_data.index, pd.DatetimeIndex):
        recent_data = recent_data.reset_index()
    
    # Ensure Date is string
    if 'Date' in recent_data.columns:
        recent_data['Date'] = recent_data['Date'].dt.strftime('%Y-%m-%d')
    
    # Convert to dict
    history = recent_data.to_dict(orient='records')
    
    return {
        "ticker": ticker.upper(),
        "prediction": "UP" if prediction == 1 else "DOWN",
        "confidence": prob, 
        "metrics": metrics,
        "reliability": reliability,
        "backtest_data": backtest_data, # For interactive backtester
        "history": history
    }
