import pandas as pd
import numpy as np

def add_technical_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds tabular technical features to the dataframe.
    """
    df = df.copy()
    
    # Ensure correct column names if MultiIndex
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    
    # --- Basic MAs ---
    df['MA5'] = df['Close'].rolling(window=5).mean()
    df['MA10'] = df['Close'].rolling(window=10).mean()
    df['MA20'] = df['Close'].rolling(window=20).mean()
    df['MA50'] = df['Close'].rolling(window=50).mean()
    
    # --- RSI (14) ---
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # --- MACD (12, 26, 9) ---
    exp12 = df['Close'].ewm(span=12, adjust=False).mean()
    exp26 = df['Close'].ewm(span=26, adjust=False).mean()
    df['MACD'] = exp12 - exp26
    df['MACD_Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
    df['MACD_Hist'] = df['MACD'] - df['MACD_Signal']
    
    # --- Bollinger Bands (20, 2) ---
    df['BB_Middle'] = df['Close'].rolling(window=20).mean()
    df['BB_Std'] = df['Close'].rolling(window=20).std()
    df['BB_Upper'] = df['BB_Middle'] + (df['BB_Std'] * 2)
    df['BB_Lower'] = df['BB_Middle'] - (df['BB_Std'] * 2)
    
    # Distance from bands (normalized)
    df['BB_Position'] = (df['Close'] - df['BB_Lower']) / (df['BB_Upper'] - df['BB_Lower'])
    
    # --- Returns & Volatility ---
    df['Daily_Return'] = df['Close'].pct_change()
    df['Volatility_5'] = df['Daily_Return'].rolling(window=5).std()
    
    # --- Ratios ---
    df['Close_to_Open'] = df['Close'] / df['Open']
    df['High_to_Low'] = df['High'] / df['Low']
    
    # --- Target ---
    df['Target'] = (df['Close'].shift(-1) > df['Close']).astype(int)
    
    # Drop NaNs
    df.dropna(inplace=True)
    
    return df
