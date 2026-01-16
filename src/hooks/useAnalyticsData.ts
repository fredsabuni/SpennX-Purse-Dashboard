import { useQuery } from '@tanstack/react-query';
import { spennxApi } from '@/lib/api';
import type {
    TransactionOverview,
    StatusBreakdown,
    CurrencyBreakdown,
} from '@/lib/types';

export const useTransactionOverview = (params?: { start_date?: string; end_date?: string; interval?: string }) => {
    return useQuery({
        queryKey: ['transactionOverview', params],
        queryFn: async () => {
            const { data } = await spennxApi.getTransactionOverview(params);
            return data as TransactionOverview;
        },
        refetchInterval: 45000, // 45 seconds - overview analytics
        staleTime: 20000,
    });
};

export const useStatusBreakdown = (params?: { start_date?: string; end_date?: string; interval?: string }) => {
    return useQuery({
        queryKey: ['statusBreakdown', params],
        queryFn: async () => {
            const { data } = await spennxApi.getStatusBreakdown(params);
            return data as StatusBreakdown;
        },
        refetchInterval: 60000, // 1 minute - status breakdown
        staleTime: 30000,
    });
};

export const useCurrencyBreakdown = (params?: { start_date?: string; end_date?: string; interval?: string; status?: string }) => {
    return useQuery({
        queryKey: ['currencyBreakdown', params],
        queryFn: async () => {
            const { data } = await spennxApi.getCurrencyBreakdown(params);
            return data as CurrencyBreakdown[];
        },
        refetchInterval: 90000, // 1.5 minutes - currency analytics
        staleTime: 45000,
    });
};
