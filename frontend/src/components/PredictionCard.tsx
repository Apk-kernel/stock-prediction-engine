import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PredictionProps {
    symbol: string;
    prediction: 'UP' | 'DOWN';
    confidence: number;
    metrics: any;
}

export const PredictionCard: React.FC<PredictionProps> = ({ prediction, confidence }) => {
    const isUp = prediction === 'UP';
    const color = isUp ? 'var(--success-green)' : 'var(--danger-red)';
    const Icon = isUp ? TrendingUp : TrendingDown;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', width: '100%' }}>
            {/* Signal Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ gridColumn: 'span 2' }}
            >
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>
                    AI Signal
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                        background: isUp ? 'rgba(14, 203, 129, 0.1)' : 'rgba(246, 70, 93, 0.1)',
                        padding: '1rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Icon size={48} color={color} />
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 700, color: color, lineHeight: 1 }}>
                            {prediction}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
                            Forecast for next market close
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Metrics Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card"
            >
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
                    Model Confidence
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100px', height: '100px', transform: 'rotate(-90deg)' }}>
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#2b3139"
                            strokeWidth="3"
                        />
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={color}
                            strokeWidth="3"
                            strokeDasharray={`${confidence * 100}, 100`}
                        />
                    </svg>
                    <div style={{ position: 'absolute', fontWeight: 700, fontSize: '1.25rem' }}>
                        {(confidence * 100).toFixed(0)}%
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Signal Strength
                </div>
            </motion.div>
        </div>
    );
};
