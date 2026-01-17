import { useQuery } from '@tanstack/react-query';
import { spennxApi } from '@/lib/api';
import type {
    DashboardStats,
    TransactionsLiveView,
    TransactionPulse,
    NetIncomeStats,
    Transaction,
    DailyTrendData,
    TodayTransactionsData,
} from '@/lib/types';

// Dashboard Stats
export const useDashboardStats = (params?: { start_date?: string; end_date?: string }) => {
    return useQuery({
        queryKey: ['dashboardStats', params],
        queryFn: async () => {
            const { data } = await spennxApi.getDashboardStats(params);
            return data as DashboardStats;
        },
        refetchInterval: 30000, // 30 seconds - core metrics
        staleTime: 15000, // Consider data stale after 15 seconds
    });
};

// Live View
export const useLiveView = (params?: { start_date?: string; end_date?: string }) => {
    return useQuery({
        queryKey: ['liveView', params],
        queryFn: async () => {
            const { data } = await spennxApi.getLiveView(params);
            return data as TransactionsLiveView;
        },
        refetchInterval: 45000, // 45 seconds - live view data
        staleTime: 20000,
    });
};

// Transaction Pulse (Real-time)
export const useTransactionPulse = (params?: { start_date?: string; end_date?: string }) => {
    return useQuery({
        queryKey: ['transactionPulse', params],
        queryFn: async () => {
            const { data } = await spennxApi.getTransactionPulse(params);
            return data as TransactionPulse;
        },
        refetchInterval: 15000, // 15 seconds - most critical real-time data
        staleTime: 10000,
    });
};

// Net Income
export const useNetIncome = (params?: { start_date?: string; end_date?: string }) => {
    return useQuery({
        queryKey: ['netIncome', params],
        queryFn: async () => {
            const { data } = await spennxApi.getNetIncome(params);
            return data as NetIncomeStats;
        },
        refetchInterval: 60000, // 1 minute - financial data
        staleTime: 30000,
    });
};

// Transactions
export const useTransactions = (params?: {
    skip?: number;
    limit?: number;
    status?: string;
    interval?: string;
}) => {
    return useQuery({
        queryKey: ['transactions', params],
        queryFn: async () => {
            const { data } = await spennxApi.getTransactions(params);
            return data as Transaction[];
        },
        refetchInterval: 30000, // 30 seconds
        staleTime: 15000,
    });
};

// Single Transaction
export const useTransaction = (id: string) => {
    return useQuery({
        queryKey: ['transaction', id],
        queryFn: async () => {
            const { data } = await spennxApi.getTransaction(id);
            return data as Transaction;
        },
        enabled: !!id,
        refetchInterval: 20000, // 20 seconds for individual transaction
        staleTime: 10000,
    });
};

// Daily Trend
export const useDailyTrend = (params?: { start_date?: string; end_date?: string }) => {
    return useQuery({
        queryKey: ['dailyTrend', params],
        queryFn: async () => {
            const { data } = await spennxApi.getDailyTrend(params);
            return data as DailyTrendData;
        },
        refetchInterval: 120000, // 2 minutes - historical trend data
        staleTime: 60000,
    });
};

// Today's Transactions
export const useTodayTransactions = () => {
    return useQuery({
        queryKey: ['todayTransactions'],
        queryFn: async () => {
            const { data } = await spennxApi.getTodayTransactions();
            return data as TodayTransactionsData;
        },
        refetchInterval: 30000, // 30 seconds - real-time today data
        staleTime: 15000,
    });
};
