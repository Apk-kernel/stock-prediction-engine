import { useState } from 'react';
import { PredictionCard } from './components/PredictionCard';
import { StockChart } from './components/StockChart';
import { Sidebar } from './components/Sidebar';
import { ReliabilityPanel } from './components/ReliabilityPanel';
import { BacktesterPanel } from './components/BacktesterPanel';
import { SentimentPanel } from './components/SentimentPanel';
import axios from 'axios';
import { Search } from 'lucide-react';

function App() {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchPrediction = async (symbol: string) => {
    setTicker(symbol);
    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await axios.get(`/api/predict/${symbol}`);
      setData(response.data);
    } catch (err: any) {
      console.error(err);
      const backendError = err.response?.data?.detail || err.message;
      setError(`Failed to fetch prediction: ${backendError}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = () => {
    if (ticker) fetchPrediction(ticker);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePredict();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar onSelect={fetchPrediction} activeTicker={ticker} />

      <div style={{ marginLeft: '260px', width: 'calc(100% - 260px)', minHeight: '100vh', padding: '0 0' }}>
        <div style={{
          height: '64px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          background: 'var(--bg-color)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
              Stock Prediction Engine
            </h1>
            {ticker && (
              <span style={{
                background: '#2b3139',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                {ticker}
              </span>
            )}
            {loading && (
              <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', marginLeft: '1rem' }}>
                Processing...
              </span>
            )}
          </div>

          <div style={{ width: '300px', position: 'relative' }}>
            <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search Symbol (e.g. AAPL)..."
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={handleKeyPress}
              disabled={loading}
              style={{
                paddingLeft: '36px',
                height: '36px',
                fontSize: '0.9rem',
                opacity: loading ? 0.7 : 1
              }}
            />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            background: 'rgba(246, 70, 93, 0.1)',
            borderBottom: '1px solid var(--danger-red)',
            color: 'var(--danger-red)',
            padding: '12px 32px',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Main Dashboard Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>

          {!data && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '60vh',
              color: 'var(--text-secondary)'
            }}>
              <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Select a stock from the watchlist or search to begin analysis</p>
            </div>
          )}

          {data && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Top Row: Prediction & Confidence */}
              <PredictionCard
                symbol={data.ticker}
                prediction={data.prediction}
                confidence={data.confidence}
                metrics={data.metrics}
              />

              {/* Main Chart Section */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Price History</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Historical validation period (60 days)
                    </p>
                  </div>
                </div>
                <StockChart data={data.history} />
              </div>

              {/* Reliability Panel */}
              {data.reliability && (
                <ReliabilityPanel data={data.reliability} />
              )}

              {/* Backtester Panel */}
              {data.backtest_data && (
                <BacktesterPanel data={data.backtest_data} />
              )}

              {/* Sentiment Panel */}
              {data.sentiment && (
                <SentimentPanel data={data.sentiment} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
