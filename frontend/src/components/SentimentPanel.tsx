import React from 'react';
import { Newspaper, ExternalLink, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface SentimentData {
    score: number;
    label: string;
    headlines: Array<{
        title: string;
        score: number;
        label: string;
        link: string;
        publisher: string;
    }>;
}

interface SentimentPanelProps {
    data: SentimentData;
}

export const SentimentPanel: React.FC<SentimentPanelProps> = ({ data }) => {
    // Determine color based on label
    const getColor = (label: string) => {
        if (label === 'Positive') return 'var(--accent-green)';
        if (label === 'Negative') return 'var(--danger-red)';
        return 'var(--text-secondary)';
    };

    const getIcon = (label: string) => {
        if (label === 'Positive') return <ArrowUp size={20} />;
        if (label === 'Negative') return <ArrowDown size={20} />;
        return <Minus size={20} />;
    };

    // Normalize score to 0-100 for gauge
    const normalizedScore = Math.max(0, Math.min(100, (data.score + 1) * 50));

    return (
        <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Newspaper size={20} color="var(--accent-gold)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Market Sentiment (News)</h3>
            </div>

            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>

                {/* Left: Gauge / Score */}
                <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '24px' }}>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: getColor(data.label),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        {getIcon(data.label)}
                        {data.score.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '8px', fontWeight: 500 }}>
                        {data.label} Mood
                    </div>

                    {/* Simple Bar Gauge */}
                    <div style={{ width: '100%', height: '6px', background: '#333', marginTop: '24px', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            position: 'absolute',
                            left: '50%',
                            top: 0,
                            bottom: 0,
                            width: '2px',
                            background: '#fff',
                            zIndex: 2
                        }} />
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: data.score >= 0 ? '50%' : `${normalizedScore}%`,
                            width: `${Math.abs(data.score * 50)}%`,
                            background: getColor(data.label),
                            transition: 'all 0.5s ease'
                        }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        <span>Negative</span>
                        <span>Neutral</span>
                        <span>Positive</span>
                    </div>
                </div>

                {/* Right: Headlines */}
                <div style={{ flex: 1.5, minWidth: '300px' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Top Headlines</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {data.headlines.length === 0 && (
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                No recent news found for this ticker.
                            </div>
                        )}

                        {data.headlines.map((item, idx) => (
                            <div key={idx} style={{
                                padding: '12px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '8px',
                                borderLeft: `3px solid ${getColor(item.label)}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                gap: '12px'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{
                                        color: 'var(--text-primary)',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        marginBottom: '4px',
                                        display: 'block'
                                    }} className="hover:underline">
                                        {item.title}
                                    </a>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {item.publisher} • Score: {item.score.toFixed(2)}
                                    </div>
                                </div>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', opacity: 0.5 }}>
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
