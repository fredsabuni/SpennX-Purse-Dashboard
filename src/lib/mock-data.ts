import { DashboardStats, TransactionsLiveView, TransactionPulse, NetIncomeStats, PartnerFlow, CountryCurrencyVolume } from "./types";

export const MOCK_STATS: DashboardStats = {
    total_transactions: 12543,
    total_volume: 2450000.50,
    pending_count: 45,
    completed_count: 12450,
    failed_count: 48,
    avg_transaction_amount: 195.32
};

export const MOCK_PULSE: TransactionPulse = {
    transactions_per_minute: 126,
    transactions_per_hour: 7540,
    transactions_per_day: 154000,
    transaction_volume_usd: 45000.00,
    avg_transaction_size: 292.00,
    error_rate: 0.45,
    active_users_today: 3420,
    active_users_week: 15200,
    active_users_month: 45000,
    new_users_today: 120
};

const createPeriodStats = (name: string, volume: number) => ({
    period_name: name,
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    total_transactions: Math.floor(volume / 100),
    total_volume: volume,
    total_revenue: volume * 0.02,
    net_revenue: volume * 0.015,
    avg_transaction_amount: 100,
    avg_revenue_per_transaction: 2,
    error_rate: 0.5
});

export const MOCK_LIVE_VIEW: TransactionsLiveView = {
    today: createPeriodStats('Today', 45000),
    previous_day: createPeriodStats('Yesterday', 42000),
    current_week: createPeriodStats('This Week', 350000),
    previous_week: createPeriodStats('Last Week', 310000),
    current_month: createPeriodStats('This Month', 1200000),
    previous_month: createPeriodStats('Last Month', 1100000),
    year_to_date: createPeriodStats('YTD', 15000000)
};

export const MOCK_TOP_COUNTRIES: CountryCurrencyVolume[] = [
    { country: 'Nigeria', currency: 'NGN', volume: 500000, transaction_count: 4500 },
    { country: 'Kenya', currency: 'KES', volume: 350000, transaction_count: 3200 },
    { country: 'Ghana', currency: 'GHS', volume: 200000, transaction_count: 1800 },
    { country: 'Uganda', currency: 'UGX', volume: 150000, transaction_count: 1400 },
    { country: 'Tanzania', currency: 'TZS', volume: 100000, transaction_count: 950 },
];

export const MOCK_NET_INCOME: NetIncomeStats = {
    income_per_minute: 45.50,
    income_per_hour: 2730.00,
    income_per_day: 65520.00,
    total_value_moved_usd: 3500000.00,
    avg_amount_sent: 195.00,
    error_rate: 0.4,
    top_countries: MOCK_TOP_COUNTRIES,
    top_currencies: MOCK_TOP_COUNTRIES,
    accumulated_revenue_ytd: 250000.00,
    accumulated_revenue_budget: 300000.00,
    daily_inflows_outflows: [
        { partner_name: 'Partner A', inflow: 150000, outflow: 120000 },
        { partner_name: 'Partner B', inflow: 80000, outflow: 60000 },
        { partner_name: 'Partner C', inflow: 45000, outflow: 40000 },
    ]
};
