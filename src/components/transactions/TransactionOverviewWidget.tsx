import { TransactionOverview } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, XCircle, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface TransactionOverviewWidgetProps {
    data?: TransactionOverview;
    loading?: boolean;
    activePeriod?: string;
    onPeriodChange?: (period: string) => void;
}

export function TransactionOverviewWidget({ data, loading, activePeriod = 'today', onPeriodChange }: TransactionOverviewWidgetProps) {
    const periods = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'Week', value: 'week' },
        { label: 'Month', value: 'month' },
        { label: 'YTD', value: 'ytd' },
        { label: 'All', value: 'all' },
    ];

    if (loading) {
        return (
            <div className="w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="space-y-2">
                        <div className="h-6 w-48 bg-[#1F1F1F] animate-pulse rounded" />
                        <div className="h-4 w-64 bg-[#1F1F1F] animate-pulse rounded" />
                    </div>
                    <div className="h-10 w-full md:w-64 bg-[#1F1F1F] animate-pulse rounded-xl" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-[#1F1F1F]/50">
                            <div className="h-4 w-24 bg-[#1F1F1F] animate-pulse rounded" />
                            <div className="h-4 w-32 bg-[#1F1F1F] animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-center text-gray-400">
                <div className="flex flex-col items-center justify-center py-8">
                    <p>No transaction data available.</p>
                </div>
            </div>
        );
    }

    const statusConfig = {
        success: { label: 'Success', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
        pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        failed: { label: 'Failed', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        declined: { label: 'Declined', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        reversed: { label: 'Reversed', icon: ArrowDownLeft, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    };

    return (
        <div className="w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
            <div className="p-6 border-b border-[#1F1F1F] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">Transaction Status Overview</h3>
                    <p className="text-sm text-gray-400">Detailed breakdown by transaction status</p>
                </div>

                {/* Period Filters */}
                <div className="flex bg-[#1A1A1A] p-1 rounded-xl border border-[#2A2A2A] overflow-x-auto no-scrollbar">
                    {periods.map((period) => (
                        <button
                            key={period.value}
                            onClick={() => onPeriodChange?.(period.value)}
                            className={`px-3 py-1.5 text-[10px] sm:text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                                activePeriod === period.value
                                    ? 'bg-[#317CFF] text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]'
                            }`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#121212] text-gray-400 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Count</th>
                            <th className="px-6 py-4 text-right">Volume (USD)</th>
                            <th className="px-6 py-4 text-right">Revenue (USD)</th>
                            <th className="px-6 py-4 text-right">%</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F1F]">
                        {Object.entries(data.status_breakdown).map(([key, metric]) => {
                            const config = statusConfig[key as keyof typeof statusConfig] || { label: key, icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-500/10' };
                            const Icon = config.icon;

                            return (
                                <tr key={key} className="hover:bg-[#1F1F1F]/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-1.5 rounded-full", config.bg)}>
                                                <Icon className={cn("h-4 w-4", config.color)} />
                                            </div>
                                            <span className="font-medium text-white capitalize">{config.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-300 font-medium">
                                        {metric.count.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-300">
                                        ${metric.volume_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-300">
                                        ${metric.revenue_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="px-2 py-1 rounded bg-[#1F1F1F] text-xs font-medium text-gray-400">
                                            {metric.percentage}%
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
