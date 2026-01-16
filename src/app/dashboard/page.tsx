'use client';
import { useState } from 'react';
import { useDashboardStats, useLiveView, useTransactionPulse, useDailyTrend } from '@/hooks/useSpennxData';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { VolumeChart } from '@/components/charts/VolumeChart';
import { DailyTrendChart } from '@/components/charts/DailyTrendChart';
import { PeriodStatsTable } from '@/components/dashboard/PeriodStatsTable';
// import { IncomePulseWidget } from '@/components/dashboard/IncomePulseWidget';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { RefreshControl } from '@/components/ui/RefreshControl';
import { DollarSign, TrendingUp, Users, AlertCircle, Zap, Bell } from 'lucide-react';
import { MOCK_STATS, MOCK_LIVE_VIEW, MOCK_PULSE, MOCK_DAILY_TREND } from '@/lib/mock-data';

// Calculate percentage change between two values
const calculateTrend = (current: number | string, previous: number | string) => {
  // Parse values if they're formatted strings
  const parseNumber = (value: number | string): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const currentNum = parseNumber(current);
  const previousNum = parseNumber(previous);

  if (previousNum === 0 || previousNum === undefined) {
    return { value: 0, isPositive: true };
  }
  const percentageChange = ((currentNum - previousNum) / previousNum) * 100;
  return {
    value: Math.round(Math.abs(percentageChange)),
    isPositive: percentageChange >= 0
  };
};

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<{start?: string, end?: string}>({});

  const { data: statsData, isLoading: statsLoading } = useDashboardStats({ start_date: dateRange.start, end_date: dateRange.end });
  const { data: liveViewData, isLoading: liveViewLoading } = useLiveView({ start_date: dateRange.start, end_date: dateRange.end });
  const { data: pulseData, isLoading: pulseLoading } = useTransactionPulse({ start_date: dateRange.start, end_date: dateRange.end });
  const { data: dailyTrendData, isLoading: dailyTrendLoading } = useDailyTrend({ start_date: dateRange.start, end_date: dateRange.end });
  // const { data: netIncomeData, isLoading: netIncomeLoading } = useNetIncome({ start_date: dateRange.start, end_date: dateRange.end });

  // Use Mock Data only if data is missing (e.g. API error or not connected)
  const stats = statsData || MOCK_STATS;
  const liveView = liveViewData || MOCK_LIVE_VIEW;
  const pulse = pulseData || MOCK_PULSE;
  const dailyTrend = dailyTrendData || MOCK_DAILY_TREND;
  // const netIncome = netIncomeData || MOCK_NET_INCOME;

  // Helper to parse numbers that might be formatted strings (e.g., "45,000" -> 45000)
  const parseNumber = (value: number | string): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove commas and parse
      const parsed = parseFloat(value.replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Prepare chart data (Last 30 Days trend could be simulated here, using available day stats)
  const chartData = [
    { 
      name: 'Last Month', 
      volume: parseNumber(liveView.previous_month.total_volume) / 4, 
      revenue: parseNumber(liveView.previous_month.total_revenue) / 4 
    },
    { 
      name: 'Last Week', 
      volume: parseNumber(liveView.previous_week.total_volume), 
      revenue: parseNumber(liveView.previous_week.total_revenue) 
    },
    { 
      name: 'Yesterday', 
      volume: parseNumber(liveView.previous_day.total_volume), 
      revenue: parseNumber(liveView.previous_day.total_revenue) 
    },
    { 
      name: 'Today', 
      volume: parseNumber(liveView.today.total_volume), 
      revenue: parseNumber(liveView.today.total_revenue) 
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Net Income & Live Pulse</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
             <DateRangePicker 
                onRangeChange={(range) => setDateRange(range)} 
                className="mr-2"
             />
             <RefreshControl 
                isLoading={statsLoading || liveViewLoading || pulseLoading || dailyTrendLoading}
                lastUpdated={new Date()}
                className="mr-2"
             />
             <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 bg-[#1F1F1F] px-3 py-1.5 rounded-full border border-[#1F1F1F]">
                <Bell className="h-3 w-3" />
                <span>SMS Alerts Active</span>
             </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#317CFF]/10 border border-[#317CFF]/20 text-[#317CFF] text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#317CFF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#317CFF]"></span>
                </span>
                Live
            </div>
        </div>
      </div>
      
      {/* Row 1: High Level Pulse Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Transactions (Today)"
          value={Number(liveView.today.total_transactions || 0).toLocaleString()}
          icon={Zap}
          description={`${Number(pulse?.transactions_per_minute || 0)} / min`}
          trend={calculateTrend(
            liveView.today.total_transactions || 0,
            liveView.previous_day.total_transactions || 0
          )}
          className="bg-gradient-to-br from-[#0A0A0A] to-[#121212] border-[#317CFF]/30"
          loading={liveViewLoading || pulseLoading}
        />
        <StatsCard
          title="Volume (Today)"
          value={`$${Number(liveView.today.total_volume || 0).toLocaleString()}`}
          icon={DollarSign}
          description="Total value moved"
          trend={calculateTrend(
            liveView.today.total_volume || 0,
            liveView.previous_day.total_volume || 0
          )}
          loading={liveViewLoading}
        />
         <StatsCard
          title="Net Revenue (Today)"
          value={`$${Number(liveView.today.net_revenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          description="After fees"
          trend={calculateTrend(
            liveView.today.net_revenue || 0,
            liveView.previous_day.net_revenue || 0
          )}
          loading={liveViewLoading}
        />
        {/* <StatsCard
          title="Active Users (DAU)"
          value={Number(pulse?.active_users_today || 0).toLocaleString()}
          icon={Users}
          description={`+${pulse?.new_users_today} new today`}
          trend={calculateTrend(
            pulse?.active_users_today || 0,
            pulse?.active_users_yesterday || 0
          )}
          loading={pulseLoading}
        /> */}
      </div>

      {/* Row 2: Daily Transaction Trends */}
      <div>
        <DailyTrendChart data={dailyTrend} loading={dailyTrendLoading} />
      </div>

      {/* Row 3: Transaction Volume Chart */}
      <div className="grid gap-6 lg:grid-cols-1">
        <div>
            <VolumeChart data={chartData} loading={liveViewLoading} />
        </div>
        {/* <div>
            <IncomePulseWidget data={netIncome} loading={netIncomeLoading} />
        </div> */}
      </div>

      {/* Row 4: Detail Period Breakdown */}
      <div>
           <PeriodStatsTable liveView={liveView} loading={liveViewLoading} />
      </div>
    </div>
  );
}
