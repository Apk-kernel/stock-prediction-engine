from ml_engine.pipeline import run_pipeline
import sys
import os

# Add root to path so we can import ml_engine
sys.path.append(os.getcwd())

print("Testing ML Pipeline...")
try:
    result = run_pipeline("AAPL")
    print(f"Prediction for AAPL: {result['prediction']}")
    print(f"Confidence: {result['confidence']:.2f}")
    if 'reliability' in result:
        r = result['reliability']
        print(f"Reliability - Acc: {r['accuracy_30d']:.2%} | Profit: {r['profit_30d']:.2%} | Avg: {r['avg_return']:.4%}")
        print(f"History Log: {len(r['history'])} entries")
    if 'backtest_data' in result:
        bd = result['backtest_data']
        print(f"Backtest Data: {len(bd)} points")
    print(f"Metric: {result['metrics']['accuracy']:.4f}")
    print(f"History points: {len(result['history'])}")
except Exception as e:
    print(f"ML Pipeline Error: {e}")
    sys.exit(1)
