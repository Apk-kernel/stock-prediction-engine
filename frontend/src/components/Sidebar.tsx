import React, { useState } from 'react';
import { Activity } from 'lucide-react';

interface SidebarProps {
    onSelect: (ticker: string) => void;
    activeTicker: string;
}

const US_STOCKS = [
    { symbol: 'AAPL', name: 'Apple' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'NVDA', name: 'NVIDIA' },
    { symbol: 'GOOGL', name: 'Alphabet' },
    { symbol: 'AMZN', name: 'Amazon' },
    { symbol: 'TSLA', name: 'Tesla' },
    { symbol: 'META', name: 'Meta' },
    { symbol: 'AMD', name: 'AMD' },
    { symbol: 'SPY', name: 'S&P 500' },
    { symbol: 'QQQ', name: 'Nasdaq 100' },
];

const INDIAN_STOCKS = [
    { symbol: 'RELIANCE.NS', name: 'Reliance' },
    { symbol: 'TCS.NS', name: 'TCS' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
    { symbol: 'INFY.NS', name: 'Infosys' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
    { symbol: 'SBIN.NS', name: 'SBI' },
    { symbol: 'BHARTIARTL.NS', name: 'Airtel' },
    { symbol: 'ITC.NS', name: 'ITC' },
    { symbol: 'LT.NS', name: 'L&T' },
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onSelect, activeTicker }) => {
    const [tab, setTab] = useState<'US' | 'IN'>('US');

    const currentStocks = tab === 'US' ? US_STOCKS : INDIAN_STOCKS;

    return (
        <div style={{
            width: '260px',
            height: '100vh',
            background: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            left: 0,
            top: 0
        }}>
            <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="var(--accent-gold)" />
                    MARKET<span style={{ color: 'var(--text-secondary)' }}>SENSE</span>
                </h2>

                <div style={{ display: 'flex', background: '#2b3139', padding: '3px', borderRadius: '6px' }}>
                    <button
                        onClick={() => setTab('US')}
                        style={{
                            flex: 1,
                            padding: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            background: tab === 'US' ? '#474d57' : 'transparent',
                            color: tab === 'US' ? 'white' : 'var(--text-secondary)',
                            borderRadius: '4px'
                        }}
                    >
                        US
                    </button>
                    <button
                        onClick={() => setTab('IN')}
                        style={{
                            flex: 1,
                            padding: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            background: tab === 'IN' ? '#474d57' : 'transparent',
                            color: tab === 'IN' ? 'white' : 'var(--text-secondary)',
                            borderRadius: '4px'
                        }}
                    >
                        INDIA
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '12px 20px 8px', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>
                    WATCHLIST
                </div>
                {currentStocks.map((stock) => (
                    <div
                        key={stock.symbol}
                        onClick={() => onSelect(stock.symbol)}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            background: activeTicker === stock.symbol ? '#2b3139' : 'transparent',
                            borderLeft: activeTicker === stock.symbol ? '3px solid var(--accent-gold)' : '3px solid transparent',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'background 0.1s'
                        }}
                        className="sidebar-item"
                    >
                        <div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>
                                {stock.symbol.replace('.NS', '')}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                {stock.name}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
