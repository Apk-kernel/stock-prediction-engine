import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Settings } from 'lucide-react';

interface BacktestPoint {
    date: string;
    prob: number;
    market_return: number;
}

interface BacktesterProps {
    data: BacktestPoint[];
}

export const BacktesterPanel: React.FC<BacktesterProps> = ({ data }) => {
    const [threshold, setThreshold] = useState(0.5);
    const [useShorts, setUseShorts] = useState(false);
    const [txCost, setTxCost] = useState(0.001); // 0.1%

    const simulation = useMemo(() => {
        let equity = 10000;
        const equityCurve = [];
        let wins = 0;
        let trades = 0;
        const returns = [];

        equityCurve.push({ date: data[0]?.date, equity: equity });

        for (const pt of data) {
            let signal = 0; // 0: Neutral, 1: Long, -1: Short

            if (pt.prob > threshold) {
                signal = 1;
            } else if (useShorts && pt.prob < (1 - threshold)) {
                // Symmetric threshold for shorting
                signal = -1;
            }

            if (signal !== 0) {
                trades++;
                // Calculate return
                // If Long: market_return
                // If Short: -market_return
                const gross_ret = signal * pt.market_return;
                const net_ret = gross_ret - txCost;

                equity = equity * (1 + net_ret);
                returns.push(net_ret);

                if (net_ret > 0) wins++;
            }
            // If neutral, equity stays same (assuming cash)

            equityCurve.push({ date: pt.date, equity: equity });
        }

        const total_return = (equity - 10000) / 10000;
        const win_rate = trades > 0 ? wins / trades : 0;

        // Sharpe
        const mean_ret = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
        const std_dev = Math.sqrt(returns.map(r => Math.pow(r - mean_ret, 2)).reduce((a, b) => a + b, 0) / (returns.length || 1));
        const sharpe = std_dev !== 0 ? (mean_ret / std_dev) * Math.sqrt(252) : 0;

        // Max Drawdown
        let max_equity = 10000;
        let max_dd = 0;
        for (const pt of equityCurve) {
            if (pt.equity > max_equity) max_equity = pt.equity;
            const dd = (max_equity - pt.equity) / max_equity;
            if (dd > max_dd) max_dd = dd;
        }

        return {
            equityCurve,
            finalEquity: equity,
            totalReturn: total_return,
            trades,
            winRate: win_rate,
            sharpe,
            maxDrawdown: max_dd
        };
    }, [data, threshold, useShorts, txCost]);

    return (
        <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Settings size={20} color="var(--accent-gold)" />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Profitability Backtester</h3>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
                {/* Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Threshold Slider */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Confidence Threshold</label>
                            <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>{(threshold * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.30"
                            max="0.90"
                            step="0.01"
                            value={threshold}
                            onChange={(e) => setThreshold(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Trades only when model is {'>'} {(threshold * 100).toFixed(0)}% sure.
                        </p>
                    </div>

                    {/* Transaction Cost */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Transaction Cost</label>
                            <span style={{ fontWeight: 600 }}>{(txCost * 100).toFixed(2)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.000"
                            max="0.005"
                            step="0.0005"
                            value={txCost}
                            onChange={(e) => setTxCost(parseFloat(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--text-secondary)' }}
                        />
                    </div>

                    {/* Strategy Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Allow Shorting</span>
                        <button
                            onClick={() => setUseShorts(!useShorts)}
                            style={{
                                background: useShorts ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                                color: useShorts ? '#000' : 'var(--text-primary)',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                        >
                            {useShorts ? 'ENABLED' : 'DISABLED'}
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Return</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: simulation.totalReturn >= 0 ? 'var(--success-green)' : 'var(--danger-red)' }}>
                                {(simulation.totalReturn * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sharpe Ratio</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                {simulation.sharpe.toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Win Rate</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                {(simulation.winRate * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Max Drawdown</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--danger-red)' }}>
                                {(simulation.maxDrawdown * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Trades Executed</div>
                            <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                                {simulation.trades}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div style={{ height: '400px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={simulation.equityCurve}>
                            <defs>
                                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                stroke="#555"
                                tick={{ fill: '#888', fontSize: 10 }}
                                minTickGap={30}
                            />
                            <YAxis
                                domain={['auto', 'auto']}
                                stroke="#555"
                                tick={{ fill: '#888', fontSize: 10 }}
                            />
                            <Tooltip
                                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--text-primary)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="equity"
                                stroke="var(--accent-gold)"
                                fill="url(#equityGradient)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
