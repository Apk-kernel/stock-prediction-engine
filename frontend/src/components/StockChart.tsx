import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ChartProps {
    data: any[];
}

export const StockChart: React.FC<ChartProps> = ({ data }) => {
    // Calculate color based on trend
    let chartColor = '#f0b90b'; // Default Gold

    if (data && data.length > 0) {
        const firstPrice = data[0].Close;
        const lastPrice = data[data.length - 1].Close;

        if (lastPrice > firstPrice) {
            chartColor = '#0ccb80'; // Success Green
        } else if (lastPrice < firstPrice) {
            chartColor = '#f6465d'; // Danger Red
        }
    }

    return (
        <div style={{ width: '100%', height: 450 }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.1} />
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" vertical={false} />
                    <XAxis
                        dataKey="Date"
                        stroke="#848e9c"
                        tick={{ fill: '#848e9c', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="#848e9c"
                        domain={['auto', 'auto']}
                        tick={{ fill: '#848e9c', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e2329',
                            border: '1px solid #2b3139',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            borderRadius: '4px',
                            color: '#eaecef'
                        }}
                        itemStyle={{ color: chartColor }}
                        labelStyle={{ color: '#848e9c', marginBottom: '0.5rem' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="Close"
                        stroke={chartColor}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorClose)"
                        activeDot={{ r: 6, fill: chartColor, stroke: '#1e2329', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
