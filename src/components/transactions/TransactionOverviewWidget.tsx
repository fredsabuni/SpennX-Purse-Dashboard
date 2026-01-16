import { TransactionOverview } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownLeft, XCircle, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface TransactionOverviewWidgetProps {
    data?: TransactionOverview;
    loading?: boolean;
}

export function TransactionOverviewWidget({ data, loading }: TransactionOverviewWidgetProps) {
    if (loading) {
        return (
            <div className="w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
                <div className="h-6 w-48 bg-[#1F1F1F] animate-pulse rounded mb-6" />
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

    if (!data) return null;

    const statusConfig = {
        success: { label: 'Success', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
        pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        failed: { label: 'Failed', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        declined: { label: 'Declined', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        reversed: { label: 'Reversed', icon: ArrowDownLeft, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    };

    return (
        <div className="w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
            <div className="p-6 border-b border-[#1F1F1F]">
                <h3 className="text-lg font-semibold text-white">Transaction Status Overview</h3>
                <p className="text-sm text-gray-400">Detailed breakdown by transaction status</p>
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
