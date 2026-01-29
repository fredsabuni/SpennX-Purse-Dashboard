'use client';

import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { TodayTransactionsData } from '@/lib/types';
import { Clock, TrendingUp, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface TodayTransactionsChartProps {
  data: TodayTransactionsData | null;
  loading?: boolean;
}

// Status color mapping
const STATUS_COLORS = {
  success: '#10B981',
  pending: '#F59E0B',
  failed: '#EF4444',
  declined: '#F97316',
  reversed: '#A855F7',
  processing_swap: '#3B82F6',
  onchain: '#06B6D4',
} as const;

export function TodayTransactionsChart({ data, loading }: TodayTransactionsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] p-4 md:p-6 h-[350px] md:h-[450px]">
        <div className="flex justify-between mb-4 md:mb-6">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-[#2A2A2A] animate-pulse rounded" />
            <div className="h-4 w-64 bg-[#2A2A2A] animate-pulse rounded" />
          </div>
        </div>
        <div className="h-[250px] md:h-[340px] w-full bg-[#2A2A2A] animate-pulse rounded" />
      </div>
    );
  }

  if (!data || !data.transactions || data.transactions.length === 0) {
    return (
      <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] p-4 md:p-6 h-[350px] md:h-[450px] flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No transactions today</p>
          <p className="text-xs text-gray-600 mt-1">Transactions will appear here as they occur</p>
        </div>
      </div>
    );
  }

  // Parse number values
  const parseNumber = (value: number | string): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Convert time string to minutes since midnight for proper x-axis positioning
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes back to HH:MM format
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Transform data for the chart
  const chartData = data.transactions.map(txn => {
    const timeStr = txn.time.substring(0, 5); // HH:MM format
    return {
      time: timeStr,
      timeValue: timeToMinutes(timeStr), // Numeric value for x-axis
      fullTime: txn.time,
      amount: parseNumber(txn.amount_usd),
      charge: parseNumber(txn.charge_usd),
      status: txn.status,
      currency: txn.currency,
      originalAmount: txn.amount,
      originalCharge: txn.charge,
      description: txn.description,
      type: txn.type,
      id: txn.id,
    };
  });

  // Sort by time
  chartData.sort((a, b) => a.timeValue - b.timeValue);

  // Calculate summary stats
  const totalVolume = parseNumber(data.total_volume_usd);
  const totalRevenue = parseNumber(data.total_revenue_usd);
  const successRate = data.total_count > 0 ? (data.success_count / data.total_count) * 100 : 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const txn = payload[0].payload;
      return (
        <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-3 shadow-xl max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: STATUS_COLORS[txn.status as keyof typeof STATUS_COLORS] || '#666' }}
            />
            <span className="text-xs font-semibold text-white capitalize">{txn.status}</span>
            <span className="text-xs text-gray-500">• {txn.fullTime}</span>
          </div>
          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-400">Amount:</span>
              <div className="text-right">
                <span className="text-xs text-white font-semibold">${txn.amount.toFixed(2)}</span>
                <span className="text-[10px] text-gray-500 ml-1">({txn.originalAmount} {txn.currency})</span>
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-400">Charge:</span>
              <div className="text-right">
                <span className="text-xs text-white font-semibold">${txn.charge.toFixed(2)}</span>
                <span className="text-[10px] text-gray-500 ml-1">({txn.originalCharge} {txn.currency})</span>
              </div>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-xs text-gray-400">Type:</span>
              <span className="text-xs text-white capitalize">{txn.type}</span>
            </div>
            {txn.description && (
              <div className="pt-1 border-t border-[#2A2A2A] mt-2">
                <p className="text-[10px] text-gray-400 truncate">{txn.description}</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Get unique statuses for legend
  const uniqueStatuses = Array.from(new Set(chartData.map(d => d.status)));

  // Calculate counts per status
  const statusCounts = chartData.reduce((acc, txn) => {
    acc[txn.status] = (acc[txn.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A] p-4 md:p-6 h-[420px] md:h-[480px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#317CFF]" />
            Today's Transactions
          </h3>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Real-time transaction activity for {data.date}
          </p>
        </div>
        
        {/* Summary Stats */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20">
            <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Success Rate</p>
              <p className="text-xs font-semibold text-[#10B981]">{successRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#317CFF]/10 border border-[#317CFF]/20">
            <TrendingUp className="h-4 w-4 text-[#317CFF]" />
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Total Volume</p>
              <p className="text-xs font-semibold text-[#317CFF]">${totalVolume.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20">
            <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Total Charges</p>
              <p className="text-xs font-semibold text-[#F59E0B]">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[230px] md:h-[340px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
            <XAxis 
              type="number"
              dataKey="timeValue"
              domain={['dataMin', 'dataMax']}
              stroke="#666" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={8}
              tickFormatter={(value) => minutesToTime(value)}
              // Use mounted check to avoid hydration mismatch
              label={mounted && window.innerWidth > 768 ? { value: 'Time of Day', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#666' } : undefined}
            />
            <YAxis 
              dataKey="amount"
              stroke="#666" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
                return `$${value}`;
              }}
              dx={-5}
              // Use mounted check to avoid hydration mismatch
              label={mounted && window.innerWidth > 768 ? { value: 'Amount (USD)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#666' } : undefined}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
              formatter={(value) => {
                const count = statusCounts[value as string] || 0;
                return <span className="capitalize">{value}: {count}</span>;
              }}
            />
            {uniqueStatuses.map((status) => (
              <Scatter
                key={status}
                name={status}
                data={chartData.filter(d => d.status === status)}
                fill={STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#666'}
                shape="circle"
              >
                {chartData.filter(d => d.status === status).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || '#666'}
                    stroke="#fff"
                    strokeWidth={2}
                    r={8}
                    style={{ 
                      filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Mobile Summary Stats */}
      <div className="md:hidden flex items-center justify-between gap-2 mt-4 pt-4 border-t border-[#2A2A2A]">
        <div className="text-center flex-1">
          <p className="text-[10px] text-gray-400">Success Rate</p>
          <p className="text-sm font-semibold text-[#10B981]">{successRate.toFixed(1)}%</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-[10px] text-gray-400">Volume</p>
          <p className="text-sm font-semibold text-[#317CFF]">${totalVolume.toLocaleString()}</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-[10px] text-gray-400">Charges</p>
          <p className="text-sm font-semibold text-[#F59E0B]">${totalRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
