'use client';

import { PeriodStats } from '@/lib/types';

interface PeriodComparisonProps {
  current: PeriodStats;
  previous: PeriodStats;
  label: string;
}

export function PeriodRow({ current, previous, label }: PeriodComparisonProps) {
  const calculateChange = (curr: number, prev: number) => {
    if (!prev) return 0;
    return ((curr - prev) / prev) * 100;
  };
    
  return (
      <>
        <tr className="border-b border-[#1F1F1F] hover:bg-[#1F1F1F]/30 transition-colors group">
            <td className="py-4 pl-4 text-sm font-medium text-white">{label}</td>
            <td className="py-4 text-right text-sm text-gray-300">
                <div>{current.total_transactions.toLocaleString()}</div>
                 <div className="text-xs text-gray-500">{previous.total_transactions.toLocaleString()}</div>
            </td>
             <td className="py-4 text-right text-sm text-gray-300">
                <div>${current.total_volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                 <div className="text-xs text-gray-500">${previous.total_volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </td>
             <td className="py-4 text-right text-sm text-white font-medium">
                <div>${current.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                 <div className="text-xs text-gray-500">${previous.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </td>
            {/* <td className="py-4 text-right text-sm text-[#4CCDF6]">
                 <div>${Number(current.net_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </td> */}
             <td className="py-4 pr-4 text-right text-sm text-gray-300">
                 <div>${Number(current.avg_revenue_per_transaction || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </td>
        </tr>
      </>
  )
}

import { Skeleton } from "@/components/ui/skeleton";

interface PeriodStatsTableProps {
    liveView: {
        today: PeriodStats;
        previous_day: PeriodStats;
        current_week: PeriodStats;
        previous_week: PeriodStats;
        current_month: PeriodStats;
        previous_month: PeriodStats;
        year_to_date: PeriodStats;
    };
    loading?: boolean;
}

export function PeriodStatsTable({ liveView, loading }: PeriodStatsTableProps) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
                <Skeleton className="h-6 w-48 mb-6" />
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
            <div className="p-4 md:p-6 border-b border-[#1F1F1F]">
                <h3 className="text-base md:text-lg font-semibold text-white">Period Performance</h3>
                <p className="text-xs md:text-sm text-gray-500">Breakdown by time interval</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                    <thead>
                        <tr className="bg-[#121212] text-left">
                            <th className="py-3 pl-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Period</th>
                            <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Transactions</th>
                            <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Volume (USD)</th>
                            <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total Revenue</th>
                            {/* <th className="py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Revenue</th> */}
                            <th className="py-3 pr-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Avg Rev/Txn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F1F]">
                        <PeriodRow label="Today" current={liveView.today} previous={liveView.previous_day} />
                        {/* We show "Yesterday" as its own row or as comparison? Requirements say "Live view and structured by...". 
                            A list seems best.
                        */}
                         <PeriodRow label="Yesterday" current={liveView.previous_day} previous={liveView.previous_day} /> 
                         <PeriodRow label="This Week" current={liveView.current_week} previous={liveView.previous_week} />
                         <PeriodRow label="Last Week" current={liveView.previous_week} previous={liveView.previous_week} />
                         <PeriodRow label="This Month" current={liveView.current_month} previous={liveView.previous_month} />
                         <PeriodRow label="Last Month" current={liveView.previous_month} previous={liveView.previous_month} />
                         <PeriodRow label="Year to Date" current={liveView.year_to_date} previous={liveView.year_to_date} />
                    </tbody>
                </table>
            </div>
        </div>
    );
}
