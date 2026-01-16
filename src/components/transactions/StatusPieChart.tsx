'use client';

import { StatusBreakdown } from '@/lib/types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface StatusPieChartProps {
    data?: StatusBreakdown;
    loading?: boolean;
}

const COLORS = {
  success: '#10b981', // Emerald 500
  pending: '#f59e0b', // Amber 500
  failed: '#ef4444',  // Red 500
  declined: '#f97316', // Orange 500
  reversed: '#a855f7', // Purple 500
  processing_swap: '#6366f1' // Indigo 500
};

export function StatusPieChart({ data, loading }: StatusPieChartProps) {
    if (loading) {
        return (
            <div className="h-[350px] w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 flex items-center justify-center">
                <div className="h-48 w-48 rounded-full border-4 border-[#1F1F1F] border-t-[#317CFF] animate-spin" />
            </div>
        );
    }

    if (!data || Object.keys(data.statuses).length === 0) {
        return (
            <div className="h-[350px] w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 flex flex-col items-center justify-center text-gray-500">
                <p>No data available</p>
            </div>
        );
    }

    const chartData = Object.entries(data.statuses)
        .filter(([_, metrics]) => metrics.count > 0)
        .map(([status, metrics]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
            value: metrics.count,
            percentage: metrics.percentage,
            rawStatus: status
        }));

    return (
        <div className="h-[350px] w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Status Distribution</h3>
            <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[entry.rawStatus as keyof typeof COLORS] || '#8884d8'} 
                                    stroke="#0A0A0A"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#0A0A0A', 
                                borderColor: '#1F1F1F',
                                borderRadius: '12px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => <span className="text-gray-400 text-sm ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
