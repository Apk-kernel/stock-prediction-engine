import React from 'react';
import { CheckCircle, XCircle, DollarSign, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface TradeLog {
    date: string;
    signal: string;
    prob: number;
    actual: string;
    return: number;
    is_correct: boolean;
}

interface ReliabilityProps {
    data: {
        accuracy_30d: number;
        profit_30d: number;
        avg_return: number;
        history: TradeLog[];
    };
}

export const ReliabilityPanel: React.FC<ReliabilityProps> = ({ data }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

                {/* Accuracy Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ background: 'rgba(14, 203, 129, 0.1)', padding: '8px', borderRadius: '8px' }}>
                            <CheckCircle size={20} color="var(--success-green)" />
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Win Rate (30d)</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {(data.accuracy_30d * 100).toFixed(1)}%
                    </div>
                </motion.div>

                {/* Profit Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '8px', borderRadius: '8px' }}>
                            <DollarSign size={20} color="var(--accent-gold)" />
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Projected Profit</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: data.profit_30d >= 0 ? 'var(--success-green)' : 'var(--danger-red)' }}>
                        {data.profit_30d >= 0 ? '+' : ''}{(data.profit_30d * 100).toFixed(1)}%
                    </div>
                </motion.div>

                {/* Avg Return Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ background: 'rgba(100, 100, 255, 0.1)', padding: '8px', borderRadius: '8px' }}>
                            <Activity size={20} color="#6495ED" />
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Avg Return/Trade</span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {(data.avg_return * 100).toFixed(2)}%
                    </div>
                </motion.div>
            </div>

            {/* History Table */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card"
            >
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>Prediction History (Last 30)</h3>

                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
                            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                                <th style={{ padding: '12px', fontWeight: 500 }}>Date</th>
                                <th style={{ padding: '12px', fontWeight: 500 }}>Signal</th>
                                <th style={{ padding: '12px', fontWeight: 500 }}>Confidence</th>
                                <th style={{ padding: '12px', fontWeight: 500 }}>Outcome</th>
                                <th style={{ padding: '12px', fontWeight: 500, textAlign: 'right' }}>Return</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.history.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{item.date}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            color: item.signal === 'UP' ? 'var(--success-green)' : 'var(--danger-red)',
                                            fontWeight: 600
                                        }}>
                                            {item.signal}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {(item.prob * 100).toFixed(0)}%
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {item.is_correct ? (
                                                <CheckCircle size={16} color="var(--success-green)" />
                                            ) : (
                                                <XCircle size={16} color="var(--danger-red)" />
                                            )}
                                            <span style={{ color: item.is_correct ? 'var(--success-green)' : 'var(--text-secondary)' }}>
                                                {item.is_correct ? 'Correct' : 'Incorrect'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                                        <span style={{ color: item.return > 0 ? 'var(--success-green)' : item.return < 0 ? 'var(--danger-red)' : 'var(--text-secondary)' }}>
                                            {item.return > 0 ? '+' : ''}{(item.return * 100).toFixed(2)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};
