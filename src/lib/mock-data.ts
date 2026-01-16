import { DashboardStats, TransactionsLiveView, TransactionPulse, NetIncomeStats, PartnerFlow, CountryCurrencyVolume, DailyTrendData } from "./types";

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

export const MOCK_DAILY_TREND: DailyTrendData = {
    start_date: '2026-01-01',
    end_date: '2026-01-07',
    total_days: 7,
    daily_data: [
        {
            date: '2026-01-01',
            transaction_count: 145,
            success_count: 132,
            failed_count: 5,
            pending_count: 8,
            total_volume_usd: '14,250.00',
            total_revenue_usd: '285.00',
            avg_transaction_size_usd: '98.27',
            success_rate: 91.03
        },
        {
            date: '2026-01-02',
            transaction_count: 178,
            success_count: 165,
            failed_count: 3,
            pending_count: 10,
            total_volume_usd: '18,900.00',
            total_revenue_usd: '378.00',
            avg_transaction_size_usd: '106.18',
            success_rate: 92.70
        },
        {
            date: '2026-01-03',
            transaction_count: 156,
            success_count: 142,
            failed_count: 7,
            pending_count: 7,
            total_volume_usd: '16,450.00',
            total_revenue_usd: '329.00',
            avg_transaction_size_usd: '105.45',
            success_rate: 91.03
        },
        {
            date: '2026-01-04',
            transaction_count: 192,
            success_count: 180,
            failed_count: 4,
            pending_count: 8,
            total_volume_usd: '21,300.00',
            total_revenue_usd: '426.00',
            avg_transaction_size_usd: '110.94',
            success_rate: 93.75
        },
        {
            date: '2026-01-05',
            transaction_count: 168,
            success_count: 155,
            failed_count: 6,
            pending_count: 7,
            total_volume_usd: '17,800.00',
            total_revenue_usd: '356.00',
            avg_transaction_size_usd: '105.95',
            success_rate: 92.26
        },
        {
            date: '2026-01-06',
            transaction_count: 201,
            success_count: 188,
            failed_count: 5,
            pending_count: 8,
            total_volume_usd: '22,500.00',
            total_revenue_usd: '450.00',
            avg_transaction_size_usd: '111.94',
            success_rate: 93.53
        },
        {
            date: '2026-01-07',
            transaction_count: 185,
            success_count: 172,
            failed_count: 4,
            pending_count: 9,
            total_volume_usd: '19,800.00',
            total_revenue_usd: '396.00',
            avg_transaction_size_usd: '107.03',
            success_rate: 92.97
        }
    ],
    summary: {
        total_transactions: 1225,
        total_success: 1134,
        overall_success_rate: 92.57,
        total_volume_usd: '131,000.00',
        total_revenue_usd: '2,620.00',
        avg_daily_transactions: 175,
        avg_daily_volume_usd: '18,714.29',
        avg_transaction_size_usd: '106.94'
    }
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
