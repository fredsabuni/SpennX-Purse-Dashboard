'use client';

import { CurrencyBreakdown } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface CurrencyVolumeChartProps {
    yesterdayData?: CurrencyBreakdown[];
    lastWeekData?: CurrencyBreakdown[];
    lastMonthData?: CurrencyBreakdown[];
    loading?: boolean;
}

export function CurrencyVolumeChart({ yesterdayData, lastWeekData, lastMonthData, loading }: CurrencyVolumeChartProps) {
    if (loading) {
        return (
            <div className="h-[400px] w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 flex flex-col gap-4">
                 <div className="h-6 w-32 bg-[#1F1F1F] animate-pulse rounded" />
                 <div className="flex-1 bg-[#1F1F1F]/20 animate-pulse rounded" />
            </div>
        );
    }

    if (!yesterdayData && !lastWeekData && !lastMonthData) {
        return (
            <div className="h-[400px] w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 flex flex-col items-center justify-center text-gray-500">
                <p>No currency data available</p>
            </div>
        );
    }

    // Process data to merge by currency
    const allCurrencies = Array.from(new Set([
        ...(yesterdayData?.map(d => d.currency) || []),
        ...(lastWeekData?.map(d => d.currency) || []),
        ...(lastMonthData?.map(d => d.currency) || [])
    ]));

    // Map converting currency to formatted data object
    const chartData = allCurrencies.map(currency => {
        const yesterday = yesterdayData?.find(d => d.currency === currency);
        const lastWeek = lastWeekData?.find(d => d.currency === currency);
        const lastMonth = lastMonthData?.find(d => d.currency === currency);

        return {
            currency,
            Yesterday: yesterday?.total_volume || 0,
            'Last Week': lastWeek?.total_volume || 0,
            'Last Month': lastMonth?.total_volume || 0,
            // Helper for USD scale if needed, but we used normalized volume for now.
            // Actually, we must visualize using USD amount for the BARS to be comparable on Y-Axis, 
            // but show Native amount in tooltips.
            // Correction: Request says "values are returned with respect currency so we should display with that currency".
            // However, plotting raw NGN (millions) vs USD (thousands) on one chart makes the USD bars invisible.
            // The request says "show values in comma separated... display with that currency".
            // It arguably implies the tooltip/labels. The chart scale MUST be uniform (likely USD) or separated.
            // Given "Volume by Currency" is one chart, USD Y-axis is the only logical choice for the BARS height.
            // We'll use USD for 'value' (height) and pass 'native' params for tooltip.
            
            YesterdayUSD: yesterday?.total_volume_usd || 0,
            LastWeekUSD: lastWeek?.total_volume_usd || 0,
            LastMonthUSD: lastMonth?.total_volume_usd || 0,

            YesterdayNative: yesterday?.total_volume || 0,
            LastWeekNative: lastWeek?.total_volume || 0,
            LastMonthNative: lastMonth?.total_volume || 0,
        };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-3 rounded-xl shadow-xl">
                    <p className="font-semibold text-white mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => {
                         // Find the native value matching the dataKey (e.g., YesterdayUSD -> YesterdayNative)
                         const period = entry.name;
                         const nativeValue = entry.payload[`${period.replace(' ', '')}Native`];
                         
                        return (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-gray-400">{period}:</span>
                                <span className="text-white font-medium">
                                    {nativeValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[400px] w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Volume by Currency (Timeline Comparison)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F1F1F" />
                        <XAxis 
                            dataKey="currency" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#6b7280', fontSize: 12 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1F1F1F', opacity: 0.4 }} />
                        <Legend 
                             verticalAlign="top" 
                             align="right"
                             iconType="circle"
                             wrapperStyle={{ paddingBottom: '20px' }} 
                        />
                        <Bar 
                            dataKey="YesterdayUSD" 
                            name="Yesterday" 
                            fill="#F59E0B" // Amber
                            radius={[4, 4, 0, 0]} 
                        />
                         <Bar 
                            dataKey="LastWeekUSD" 
                            name="Last Week" 
                            fill="#317CFF" // Blue
                            radius={[4, 4, 0, 0]} 
                        />
                         <Bar 
                            dataKey="LastMonthUSD" 
                            name="Last Month" 
                            fill="#10B981" // Emerald
                            radius={[4, 4, 0, 0]} 
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
