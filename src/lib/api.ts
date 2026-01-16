import axios from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spennx.kasuku.xyz'; http://0.0.0.0:8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spennx.kasuku.xyz'; 

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API endpoints
export const spennxApi = {
    // Dashboard Stats
    getDashboardStats: (params?: { start_date?: string; end_date?: string }) => apiClient.get('/api/dashboard/stats', { params }),

    // Live View (all time intervals)
    getLiveView: (params?: { start_date?: string; end_date?: string }) => apiClient.get('/api/live-view', { params }),

    // Transaction Pulse (real-time)
    getTransactionPulse: (params?: { start_date?: string; end_date?: string }) => apiClient.get('/api/transaction-pulse', { params }),

    // Net Income
    getNetIncome: (params?: { start_date?: string; end_date?: string }) => apiClient.get('/api/net-income', { params }),

    // Transactions
    getTransactions: (params?: {
        skip?: number;
        limit?: number;
        status?: string;
        interval?: string;
    }) => apiClient.get('/api/transactions', { params }),

    // Single transaction
    getTransaction: (id: string) => apiClient.get(`/api/transactions/${id}`),

    // Analytics Endpoints
    getTransactionOverview: (params?: { start_date?: string; end_date?: string; interval?: string }) => apiClient.get('/api/analytics/transaction-overview', { params }),

    getStatusBreakdown: (params?: { start_date?: string; end_date?: string; interval?: string }) => apiClient.get('/api/analytics/status-breakdown', { params }),

    getCurrencyBreakdown: (params?: { start_date?: string; end_date?: string; interval?: string; status?: string }) => apiClient.get('/api/analytics/currency-breakdown', { params }),

    // Transactions by status
    getTransactionsByStatus: (status: string, params?: {
        skip?: number;
        limit?: number;
    }) => apiClient.get(`/api/transactions/status/${status}`, { params }),

    // Daily Trend
    getDailyTrend: (params?: { start_date?: string; end_date?: string }) => apiClient.get('/api/analytics/daily-trend', { params }),
};
