'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyTrendData } from '@/lib/types';
import { TrendingUp, Activity, CheckCircle2 } from 'lucide-react';

interface DailyTrendChartProps {
  data: DailyTrendData | null;
  loading?: boolean;
}

export function DailyTrendChart({ data, loading }: DailyTrendChartProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] p-4 md:p-6 h-[350px] md:h-[450px]">
        <div className="flex justify-between mb-4 md:mb-6">
          <div className="space-y-2">
            <div className="h-6 w-40 bg-[#2A2A2A] animate-pulse rounded" />
            <div className="h-4 w-56 bg-[#2A2A2A] animate-pulse rounded" />
          </div>
        </div>
        <div className="h-[250px] md:h-[340px] w-full bg-[#2A2A2A] animate-pulse rounded" />
      </div>
    );
  }

  if (!data || !data.daily_data || data.daily_data.length === 0) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] p-4 md:p-6 h-[350px] md:h-[450px] flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Parse number values from potentially formatted strings
  const parseNumber = (value: number | string): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Transform data for the chart
  const chartData = data.daily_data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: item.date,
    transactions: item.transaction_count,
    successCount: item.success_count,
    successRate: item.success_rate,
    volume: parseNumber(item.total_volume_usd),
    revenue: parseNumber(item.total_revenue_usd),
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3 shadow-xl">
          <p className="text-gray-400 text-xs mb-2">{data.fullDate}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-xs text-gray-400">Transactions:</span>
              <span className="text-xs text-white font-semibold">{data.transactions.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6366F1]" />
              <span className="text-xs text-gray-400">Success Rate:</span>
              <span className="text-xs text-white font-semibold">{data.successRate.toFixed(2)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-xs text-gray-400">Volume:</span>
              <span className="text-xs text-white font-semibold">${data.volume.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] p-4 md:p-6 h-[350px] md:h-[450px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#10B981]" />
            Daily Transaction Trends
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Transaction volume and success metrics over time
          </p>
        </div>
        
        {/* Summary Stats */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
            <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Avg Success</p>
              <p className="text-xs font-semibold text-[#10B981]">{data.summary.overall_success_rate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20">
            <TrendingUp className="h-4 w-4 text-[#6366F1]" />
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Avg Daily</p>
              <p className="text-xs font-semibold text-[#6366F1]">{data.summary.avg_daily_transactions.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[250px] md:h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorSuccessRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#666" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              dy={8}
            />
            <YAxis 
              yAxisId="left"
              stroke="#666" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                return value.toString();
              }}
              dx={-5}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#666" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              dx={5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="transactions" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Transactions"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="successRate" 
              stroke="#6366F1" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#6366F1', r: 3 }}
              activeDot={{ r: 5 }}
              name="Success Rate (%)"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="volume" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={{ fill: '#F59E0B', r: 3 }}
              activeDot={{ r: 5 }}
              name="Volume ($)"
              hide={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
