export interface DashboardStats {
    total_transactions: number;
    total_volume: number;
    pending_count: number;
    completed_count: number;
    failed_count: number;
    avg_transaction_amount: number;
}

export interface PeriodStats {
    period_name: string;
    start_date: string;
    end_date: string;
    total_transactions: number;
    total_volume: number;
    total_revenue: number;
    net_revenue: number;
    avg_transaction_amount: number;
    avg_revenue_per_transaction: number;
    error_rate: number;
}

export interface TransactionsLiveView {
    today: PeriodStats;
    previous_day: PeriodStats;
    current_week: PeriodStats;
    previous_week: PeriodStats;
    current_month: PeriodStats;
    previous_month: PeriodStats;
    year_to_date: PeriodStats;
}

export interface TransactionPulse {
    transactions_per_minute: number;
    transactions_per_hour: number;
    transactions_per_day: number;
    transaction_volume_usd: number;
    avg_transaction_size: number;
    error_rate: number;
    active_users_today: number;
    active_users_week: number;
    active_users_month: number;
    new_users_today: number;
}

export interface CountryCurrencyVolume {
    country: string | null;
    currency: string | null;
    volume: number;
    transaction_count: number;
}

export interface PartnerFlow {
    partner_name: string;
    inflow: number;
    outflow: number;
}

export interface NetIncomeStats {
    income_per_minute: number;
    income_per_hour: number;
    income_per_day: number;
    total_value_moved_usd: number;
    avg_amount_sent: number;
    error_rate: number;
    top_countries: CountryCurrencyVolume[];
    top_currencies: CountryCurrencyVolume[];
    accumulated_revenue_ytd: number;
    accumulated_revenue_budget: number;
    daily_inflows_outflows: PartnerFlow[];
}

export interface RecipientData {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    country?: string;
    currency_code?: string;
    bank_name?: string;
    account_number?: string;
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    human_readable_amount: number;
    charge: number;
    human_readable_charge: number;
    status: string;
    decline_reason?: string;
    mode: string;
    type: string;
    description?: string;
    created_at: string;
    recipient?: RecipientData;
}
// Analytics Types
export interface TransactionStatusMetric {
    count: number;
    volume_usd: number;
    revenue_usd: number;
    percentage: number;
}

export interface TransactionOverview {
    total_transactions: number;
    success_count: number;
    success_rate: number;
    total_volume_usd: number;
    total_revenue_usd: number;
    avg_transaction_size: number;
    status_breakdown: {
        success: TransactionStatusMetric;
        pending: TransactionStatusMetric;
        failed: TransactionStatusMetric;
        declined: TransactionStatusMetric;
        reversed: TransactionStatusMetric;
    };
}

export interface StatusBreakdown {
    total_transactions: number;
    statuses: {
        [key: string]: {
            count: number;
            percentage: number;
        };
    };
}

export interface CurrencyBreakdown {
    currency: string;
    transaction_count: number;
    total_volume: number;
    total_volume_usd: number;
    avg_transaction_size: number;
    percentage_of_total: number;
}

export interface DailyTrendDataPoint {
    date: string;
    transaction_count: number;
    success_count: number;
    failed_count: number;
    pending_count: number;
    total_volume_usd: string | number;
    total_revenue_usd: string | number;
    avg_transaction_size_usd: string | number;
    success_rate: number;
}

export interface DailyTrendData {
    start_date: string;
    end_date: string;
    total_days: number;
    daily_data: DailyTrendDataPoint[];
    summary: {
        total_transactions: number;
        total_success: number;
        overall_success_rate: number;
        total_volume_usd: string | number;
        total_revenue_usd: string | number;
        avg_daily_transactions: number;
        avg_daily_volume_usd: string | number;
        avg_transaction_size_usd: string | number;
    };
}
