'use client';

import { useState } from 'react';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { RefreshControl } from '@/components/ui/RefreshControl';
import { TransactionOverviewWidget } from '@/components/transactions/TransactionOverviewWidget';
import { StatusPieChart } from '@/components/transactions/StatusPieChart';
import { CurrencyVolumeChart } from '@/components/transactions/CurrencyVolumeChart';
import { TopCurrenciesWidget } from '@/components/transactions/TopCurrenciesWidget';
import { 
    useTransactionOverview, 
    useStatusBreakdown, 
    useCurrencyBreakdown,
    useTopCurrencies 
} from '@/hooks/useAnalyticsData';
import { Bell, Download } from 'lucide-react';

export default function TransactionsPage() {
    const [dateRange, setDateRange] = useState<{start?: string, end?: string}>({});
    const [overviewPeriod, setOverviewPeriod] = useState('today');
    const [topCurrenciesPeriod, setTopCurrenciesPeriod] = useState('today');

    const queryParams = {
        start_date: dateRange.start,
        end_date: dateRange.end,
        period: overviewPeriod
    };

    const topCurrenciesParams = {
        start_date: dateRange.start,
        end_date: dateRange.end,
        period: topCurrenciesPeriod
    };

    const { data: overviewData, isLoading: overviewLoading } = useTransactionOverview(queryParams);
    const { data: statusData, isLoading: statusLoading } = useStatusBreakdown(queryParams);
    
    // Fetch Top Currencies
    const { data: topCurrenciesData, isLoading: topCurrenciesLoading } = useTopCurrencies(topCurrenciesParams);
    
    // Fetch comparative data for Currency Chart
    const { data: yesterdayData, isLoading: yesterdayLoading } = useCurrencyBreakdown({ interval: 'previous_day' });
    const { data: lastWeekData, isLoading: lastWeekLoading } = useCurrencyBreakdown({ interval: 'previous_week' });
    const { data: lastMonthData, isLoading: lastMonthLoading } = useCurrencyBreakdown({ interval: 'previous_month' });

    const currencyLoading = yesterdayLoading || lastWeekLoading || lastMonthLoading;

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        Transactions Analytics
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 mt-1">Deep dive into your transaction metrics</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <DateRangePicker 
                        onRangeChange={(range) => {
                            setDateRange(range);
                            if (range.start || range.end) {
                                // If custom date range is picked, maybe we should clear the period?
                                // Or keep it? Usually custom range overrides period.
                            }
                        }} 
                        className="w-full sm:w-auto"
                    />
                    
                    <RefreshControl 
                        isLoading={overviewLoading || statusLoading || currencyLoading || topCurrenciesLoading}
                        lastUpdated={new Date()}
                        className="w-full sm:w-auto"
                    />
                    
                    <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1F1F1F] bg-[#1F1F1F] text-xs font-medium text-gray-300 hover:text-white transition-colors">
                        <Download className="h-3.5 w-3.5" />
                        Export
                    </button>
                </div>
            </div>

            {/* Overview Section */}
            <div className="grid gap-6">
                <div>
                    <TransactionOverviewWidget 
                        data={overviewData} 
                        loading={overviewLoading} 
                        activePeriod={overviewPeriod}
                        onPeriodChange={setOverviewPeriod}
                    />
                </div>
            </div>

            {/* Visualizations Grid */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                <StatusPieChart 
                    data={statusData} 
                    loading={statusLoading} 
                />
                <CurrencyVolumeChart 
                    yesterdayData={yesterdayData}
                    lastWeekData={lastWeekData}
                    lastMonthData={lastMonthData}
                    loading={currencyLoading} 
                />
            </div>

            {/* Top Currencies Section */}
            <div className="grid gap-6">
                <TopCurrenciesWidget 
                    data={topCurrenciesData}
                    loading={topCurrenciesLoading}
                    activePeriod={topCurrenciesPeriod}
                    onPeriodChange={setTopCurrenciesPeriod}
                />
            </div>
        </div>
    );
}
