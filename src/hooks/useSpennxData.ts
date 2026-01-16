import { useQuery } from '@tanstack/react-query';
import { spennxApi } from '@/lib/api';
import type {
    DashboardStats,
    TransactionsLiveView,
    TransactionPulse,
    NetIncomeStats,
    Transaction,
} from '@/lib/types';

// Dashboard Stats
export const useDashboardStats = (params?: { start_date?: string; end_date?: string }) => {
    return useQuery({
        queryKey: ['dashboardStats', params],
        queryFn: async () => {
            const { data } = await spennxApi.getDashboardStats(params);
            return data as DashboardStats;
        },
        refetchInterval: 30000,
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
        refetchInterval: 60000,
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
        refetchInterval: 10000,
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
        refetchInterval: 30000,
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
        refetchInterval: 30000,
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
    });
};
