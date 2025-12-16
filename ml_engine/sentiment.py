from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import yfinance as yf
import pandas as pd
from datetime import datetime
import random

# Initialize VADER
analyzer = SentimentIntensityAnalyzer()

def get_sentiment(ticker: str) -> dict:
    """
    Fetches news for a ticker and calculates a composite sentiment score.
    Returns a dict with:
    - score: float (-1 to 1)
    - headlines: list of dicts {title, sentiment, link}
    - summary: str
    """
    
    # 1. Fetch News
    try:
        t = yf.Ticker(ticker)
        news_list = t.news
        
        # Fallback if no news (common with yfinance sometimes)
        if not news_list:
            # Try to search generically or just use a mock fallback for the demo if completely empty
            # For a real app, you'd use a paid API like NewsAPI or similar.
            # Here we just return neutral.
            return {
                "score": 0.0,
                "label": "Neutral",
                "headlines": []
            }
            
    except Exception as e:
        print(f"Error fetching news for {ticker}: {e}")
        return {
            "score": 0.0,
            "label": "Neutral",
            "headlines": []
        }

    # 2. Analyze
    headlines_data = []
    total_score = 0
    count = 0
    
    for item in news_list:
        title = item.get('title', '')
        link = item.get('link', '#')
        publisher = item.get('publisher', 'Unknown')
        
        if not title:
            continue
            
        vs = analyzer.polarity_scores(title)
        compound = vs['compound']
        
        total_score += compound
        count += 1
        
        # Classify individual headline
        h_label = "Neutral"
        if compound >= 0.05: h_label = "Positive"
        elif compound <= -0.05: h_label = "Negative"
        
        headlines_data.append({
            "title": title,
            "score": compound,
            "label": h_label,
            "link": link,
            "publisher": publisher
        })
        
    # 3. Aggregate
    avg_score = total_score / count if count > 0 else 0
    
    # Overall Label
    if avg_score >= 0.05:
        overall_label = "Positive"
    elif avg_score <= -0.05:
        overall_label = "Negative"
    else:
        overall_label = "Neutral"
        
    return {
        "score": avg_score,
        "label": overall_label,
        "headlines": headlines_data[:5] # Top 5
    }
