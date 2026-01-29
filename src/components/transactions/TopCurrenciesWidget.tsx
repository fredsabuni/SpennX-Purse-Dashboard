import { TopPerformingCurrency } from '@/lib/types';
import { Layers, ArrowUpRight } from 'lucide-react';

interface TopCurrenciesWidgetProps {
    data?: TopPerformingCurrency[];
    loading?: boolean;
    activePeriod?: string;
    onPeriodChange?: (period: string) => void;
}

export function TopCurrenciesWidget({ data, loading, activePeriod = 'today', onPeriodChange }: TopCurrenciesWidgetProps) {
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
                            <div className="h-4 w-full max-w-[400px] bg-[#1F1F1F] animate-pulse rounded ml-4" />
                            <div className="h-4 w-24 bg-[#1F1F1F] animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
             <div className="w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
                <div className="p-6 border-b border-[#1F1F1F] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Top Performing Currencies</h3>
                        <p className="text-sm text-gray-400">By volume and transaction share</p>
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
                <div className="p-12 text-center text-gray-400 font-medium">
                     <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-3 rounded-full bg-[#1F1F1F]">
                            <Layers className="h-6 w-6 text-gray-500" />
                        </div>
                        <p>No currency data available for this period.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Helper to parse string percentage to number for progress bar width
    const parsePercentage = (percentStr: string | number | undefined) => {
        if (typeof percentStr === 'number') return percentStr;
        if (typeof percentStr === 'string') {
            return parseFloat(percentStr.replace('%', '')) || 0;
        }
        return 0;
    };

    // Color generation for currencies
    const getCurrencyColor = (currency: string) => {
        const colors = [
            { text: 'text-blue-500', bg: 'bg-blue-500/10', bar: 'bg-blue-500' },       // USD usually blue-ish (or green)
            { text: 'text-emerald-500', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500' }, // NGN/KES green-ish
            { text: 'text-violet-500', bg: 'bg-violet-500/10', bar: 'bg-violet-500' },    // GBP/EUR
            { text: 'text-amber-500', bg: 'bg-amber-500/10', bar: 'bg-amber-500' },       // Gold/Yellow-ish
            { text: 'text-rose-500', bg: 'bg-rose-500/10', bar: 'bg-rose-500' },         // Red-ish
            { text: 'text-cyan-500', bg: 'bg-cyan-500/10', bar: 'bg-cyan-500' },         // Cyan
            { text: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', bar: 'bg-fuchsia-500' }, // Pink-ish
            { text: 'text-orange-500', bg: 'bg-orange-500/10', bar: 'bg-orange-500' },   // Orange
        ];

        // Specific mappings for common currencies
        const map: Record<string, number> = {
            'USD': 0, // Blue
            'EUR': 2, // Violet
            'GBP': 2, // Violet
            'NGN': 1, // Emerald
            'KES': 4, // Rose
            'GHS': 3, // Amber
            'TZS': 5, // Cyan
            'UGX': 7, // Orange
            'RWF': 6, // Fuchsia
        };

        if (map[currency] !== undefined) {
            return colors[map[currency]];
        }

        // Fallback: deterministic color based on string hash
        let hash = 0;
        for (let i = 0; i < currency.length; i++) {
            hash = currency.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="w-full rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
            <div className="p-6 border-b border-[#1F1F1F] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">Top Performing Currencies</h3>
                    <p className="text-sm text-gray-400">By volume and transaction share</p>
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
                            <th className="px-6 py-4">Currency</th>
                            <th className="px-6 py-4 text-right">Transactions</th>
                            <th className="px-6 py-4 text-right">Volume</th>
                            <th className="px-6 py-4 text-right">Volume (USD)</th>
                            <th className="px-6 py-4 text-right">Avg Size</th>
                            <th className="px-6 py-4 w-1/4">Share</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F1F1F]">
                        {data.map((item) => {
                            const styles = getCurrencyColor(item.currency);
                            return (
                                <tr key={item.currency} className="hover:bg-[#1F1F1F]/30 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-white">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-colors ${styles.bg} ${styles.text}`}>
                                                {item.currency}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-300">
                                        {item.transaction_count.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-300 font-medium whitespace-nowrap">
                                        {item.total_volume}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-300 whitespace-nowrap">
                                        {item.total_volume_usd}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-400 whitespace-nowrap">
                                        {item.avg_transaction_size}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${styles.bar}`}
                                                    style={{ width: `${parsePercentage(item.percentage_of_total)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-gray-400 w-12 text-right">
                                                {item.percentage_of_total}
                                            </span>
                                        </div>
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
