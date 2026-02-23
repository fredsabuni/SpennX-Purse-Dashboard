import { useQuery } from '@tanstack/react-query';
import { feesApi, type CurrencyDetail } from '@/lib/fees-api';

/**
 * Fetch currency details for a single country ISO2 code.
 * This is the PRIMARY hook for the Fee Checker – fetches ONE country
 * and returns the full settings object (rates, fees, limits, delivery methods).
 */
export const useCurrencyDetail = (iso2: string) => {
    return useQuery<CurrencyDetail>({
        queryKey: ['spennx-currency', iso2],
        queryFn: () => feesApi.getCurrencyByIso2(iso2),
        enabled: !!iso2,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

/**
 * Fetch all supported countries' currency details in parallel.
 * NOTE: This makes 30+ API calls – avoid unless strictly needed.
 * For the Fee Checker, use useCurrencyDetail() with a single country instead.
 */
export const useCountriesWithCurrencies = () => {
    return useQuery<CurrencyDetail[]>({
        queryKey: ['spennx-all-currencies'],
        queryFn: () => feesApi.getAllCurrencies(),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

/**
 * Fetch list of all available countries.
 */
export const useCountries = () => {
    return useQuery({
        queryKey: ['spennx-countries-v2'],
        queryFn: () => feesApi.getCountries(),
        staleTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: typeof window !== 'undefined', // Only run on client side
    });
};

