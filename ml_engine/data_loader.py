import yfinance as yf
import pandas as pd

def fetch_data(ticker: str, period: str = "5y") -> pd.DataFrame:
    """
    Fetches historical OHLCV data for a given ticker.
    """
    try:
        data = yf.download(ticker, period=period, progress=False)
        if data.empty:
            raise ValueError(f"No data found for ticker {ticker}")
        return data
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        raise
