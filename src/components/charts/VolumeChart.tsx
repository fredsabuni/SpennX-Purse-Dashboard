'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VolumeChartProps {
  data: Array<{
    name: string;
    volume: number;
    revenue: number;
  }>;
  loading?: boolean;
}

export function VolumeChart({ data, loading }: VolumeChartProps) {
  if (loading) {
    return (
        <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-4 md:p-6 h-[300px] md:h-[400px]">
            <div className="flex justify-between mb-4 md:mb-6">
                <div className="space-y-2">
                    <div className="h-5 md:h-6 w-24 md:w-32 bg-[#1F1F1F] animate-pulse rounded" />
                    <div className="h-3 md:h-4 w-36 md:w-48 bg-[#1F1F1F] animate-pulse rounded" />
                </div>
            </div>
            <div className="h-[220px] md:h-[300px] w-full bg-[#1F1F1F] animate-pulse rounded" />
        </div>
    );
  }
  return (
    <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-4 md:p-6 h-[300px] md:h-[400px]">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-white">Transaction Volume</h3>
          <p className="text-xs md:text-sm text-gray-500">Revenue and volume trends over time</p>
        </div>
      </div>
      <div className="h-[220px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#317CFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#317CFF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CCDF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4CCDF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#666" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={10}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#666" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                return `$${value}`;
              }}
              dx={-5}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0A0A0A', 
                border: '1px solid #1F1F1F',
                borderRadius: '8px',
                color: '#fff'
              }}
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ color: '#666', marginBottom: '8px' }}
              formatter={(value: number | undefined) => value !== undefined ? `$${value.toLocaleString()}` : '-'}
            />
            <Area 
              type="monotone" 
              dataKey="volume" 
              stroke="#317CFF" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorVolume)" 
              name="Volume"
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#4CCDF6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              name="Revenue"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
