import axios from 'axios';

// ─── Fee Types ───────────────────────────────────────────────────────
export interface FeeStructure {
    type: 'no_fee' | 'fiat' | 'fiat_percent' | 'percent';
    range: unknown | null;
    fiat: number;
    percent: number;
    vat?: number;
}

export interface TransferLimit {
    min: number;
    max: number;
}

export interface TransferRate {
    iso2?: string;
    currency: string;
    rate: string;
    free_transfer?: boolean;
}

export interface LocalTransfer {
    active: boolean;
    limit: TransferLimit;
    fee: FeeStructure;
    rates: TransferRate[];
}

export interface LocalSwap {
    active: boolean;
    limit: TransferLimit;
    fee: FeeStructure;
    rates: TransferRate[];
}

export interface PayoutSettings {
    status: string;
    limit: {
        individual: number;
        business: number;
    };
}

export interface DeliveryMethodDetail {
    active: boolean;
    fee: FeeStructure;
    id_types?: string[];
}

export interface DeliveryMethods {
    bank: DeliveryMethodDetail;
    mobile_money: DeliveryMethodDetail;
    crypto: DeliveryMethodDetail;
    cash_pickup: DeliveryMethodDetail;
}

export interface DeliveryWindow {
    id: string;
    name: string;
    duration: string;
    payout_method: string;
    payout_rail: string;
    recommended: boolean;
    rate: number;
    fee: FeeStructure;
}

export interface BankAccountType {
    id: string;
    name: string;
}

export interface InternationalRemittance {
    id: string;
    country: string;
    iso2: string;
    currency: string;
    currency_name: string;
    currency_symbol: string;
    currency_id: string;
    phonecode: string;
    swap_fee: FeeStructure;
    limit: TransferLimit;
    delivery_window_required: boolean;
    bank_account_types: BankAccountType[];
    bank_routing_types: string[];
    bank_iban_verify: boolean;
    bank_entity_type: {
        individual: boolean;
        business: boolean;
    };
    delivery_methods: DeliveryMethods;
    delivery_windows: DeliveryWindow[];
}

export interface CurrencySettings {
    topup: string;
    local_transfer: LocalTransfer;
    local_swap: LocalSwap;
    payout: PayoutSettings;
    international_remittance: InternationalRemittance[];
}

export interface Country {
    name: string;
    iso2: string;
}

export interface CurrencyDetail {
    id: string;
    name: string;
    currency: string;
    symbol: string;
    iso2: string;
    settings: CurrencySettings;
    // Computed convenience fields
    currency_code?: string;
    currency_name?: string;
    currency_symbol?: string;
    [key: string]: unknown;
}

// ─── Supported Countries ─────────────────────────────────────────────
export const SUPPORTED_ISO2_CODES = [
    'US', 'CA', 'GB', 'NG', 'TZ', 'KE', 'ZA', 'GH', 'UG', 'RW',
    'IN', 'PK', 'PH', 'MX', 'BR', 'DE', 'FR', 'ES', 'IT', 'NL',
    'AU', 'JP', 'CN', 'SG', 'AE', 'SA', 'EG', 'ET', 'CM', 'CD',
    'NO', 'SE', 'DK', 'FI', 'BE', 'AT', 'CH', 'PT', 'IE', 'PL',
];

// Country names for the selector (so we don't need to fetch all)
export const COUNTRY_NAMES: Record<string, string> = {
    US: 'United States', CA: 'Canada', GB: 'United Kingdom', NG: 'Nigeria',
    TZ: 'Tanzania', KE: 'Kenya', ZA: 'South Africa', GH: 'Ghana',
    UG: 'Uganda', RW: 'Rwanda', IN: 'India', PK: 'Pakistan',
    PH: 'Philippines', MX: 'Mexico', BR: 'Brazil', DE: 'Germany',
    FR: 'France', ES: 'Spain', IT: 'Italy', NL: 'Netherlands',
    AU: 'Australia', JP: 'Japan', CN: 'China', SG: 'Singapore',
    AE: 'United Arab Emirates', SA: 'Saudi Arabia', EG: 'Egypt',
    ET: 'Ethiopia', CM: 'Cameroon', CD: 'DR Congo',
    NO: 'Norway', SE: 'Sweden', DK: 'Denmark', FI: 'Finland',
    BE: 'Belgium', AT: 'Austria', CH: 'Switzerland', PT: 'Portugal',
    IE: 'Ireland', PL: 'Poland',
};

// ─── Local Currency Mapping ──────────────────────────────────────────
// Maps each country ISO2 code to its LOCAL/NATIVE currency
// This ensures we analyze the CORRECT currency for each country
export const COUNTRY_LOCAL_CURRENCY: Record<string, string> = {
    US: 'USD', CA: 'CAD', GB: 'GBP', NG: 'NGN',
    TZ: 'TZS', KE: 'KES', ZA: 'ZAR', GH: 'GHS',
    UG: 'UGX', RW: 'RWF', IN: 'INR', PK: 'PKR',
    PH: 'PHP', MX: 'MXN', BR: 'BRL', DE: 'EUR',
    FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR',
    AU: 'AUD', JP: 'JPY', CN: 'CNY', SG: 'SGD',
    AE: 'AED', SA: 'SAR', EG: 'EGP', ET: 'ETB',
    CM: 'XAF', CD: 'CDF', NO: 'NOK', SE: 'SEK',
    DK: 'DKK', FI: 'EUR', BE: 'EUR', AT: 'EUR',
    CH: 'CHF', PT: 'EUR', IE: 'EUR', PL: 'PLN',
};

// ─── API Client ──────────────────────────────────────────────────────
const localClient = axios.create({
    baseURL: '',
    headers: { 'Content-Type': 'application/json' },
});

// ─── Cache for countries (since they don't change often) ──────────────
let countriesCache: Country[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ─── API Methods ─────────────────────────────────────────────────────
export const feesApi = {
    /**
     * Fetch full currency details for a specific country via our proxy.
     * Returns the FULL response including settings, rates, fees, delivery methods.
     * IMPORTANT: Ensures we return the LOCAL currency for the country (e.g., TZS for Tanzania, not USD)
     */
    getCurrencyByIso2: async (iso2: string): Promise<CurrencyDetail> => {
        const token = process.env.NEXT_PUBLIC_SPENNX_API_TOKEN || '';
        const expectedLocalCurrency = COUNTRY_LOCAL_CURRENCY[iso2];
        
        let data: any;
        
        // Try fetch first (more reliable in browser)
        try {
            const response = await fetch(`/api/currencies/${iso2}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-ISO2-Code': iso2,
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            data = await response.json();
        } catch (fetchError) {
            // Fallback to axios
            try {
                const response = await localClient.get(`/api/currencies/${iso2}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-ISO2-Code': iso2
                    }
                });
                data = response.data;
            } catch (axiosError) {
                throw fetchError; // Throw the original fetch error
            }
        }
        
        // The API may return an array of currencies for a country
        // We need to find the LOCAL currency, not just take the first one
        let raw: any;
        
        if (Array.isArray(data)) {
            // Multiple currencies returned - find the local one
            if (expectedLocalCurrency) {
                const localCurrencyData = data.find(item => item.currency === expectedLocalCurrency);
                if (localCurrencyData) {
                    console.log(`[Currency API] ✓ Found local currency ${expectedLocalCurrency} for ${iso2}`);
                    raw = localCurrencyData;
                } else {
                    console.warn(`[Currency API] ⚠️ Local currency ${expectedLocalCurrency} not found for ${iso2}. Available:`, data.map(d => d.currency).join(', '));
                    console.warn(`[Currency API] ⚠️ Using first available currency: ${data[0]?.currency}`);
                    raw = data[0];
                }
            } else {
                console.warn(`[Currency API] ⚠️ No local currency mapping for ${iso2}, using first result`);
                raw = data[0];
            }
        } else if (data.data && Array.isArray(data.data)) {
            // Data wrapped in { data: [...] }
            if (expectedLocalCurrency) {
                const localCurrencyData = data.data.find((item: any) => item.currency === expectedLocalCurrency);
                if (localCurrencyData) {
                    console.log(`[Currency API] ✓ Found local currency ${expectedLocalCurrency} for ${iso2}`);
                    raw = localCurrencyData;
                } else {
                    console.warn(`[Currency API] ⚠️ Local currency ${expectedLocalCurrency} not found for ${iso2}. Available:`, data.data.map((d: any) => d.currency).join(', '));
                    console.warn(`[Currency API] ⚠️ Using first available currency: ${data.data[0]?.currency}`);
                    raw = data.data[0];
                }
            } else {
                raw = data.data[0];
            }
        } else {
            // Single object returned
            raw = data.data || data;
        }
        
        // Validate the currency matches what we expect for this country
        if (expectedLocalCurrency && raw.currency !== expectedLocalCurrency) {
            console.error(
                `[Currency API] ❌ CURRENCY MISMATCH for ${iso2}:`,
                `Expected ${expectedLocalCurrency}, got ${raw.currency}`
            );
        }
        
        return {
            ...raw,
            iso2: raw.iso2 || iso2,
            name: raw.name || COUNTRY_NAMES[iso2] || iso2,
            currency_code: raw.currency,
            currency_name: raw.name,
            currency_symbol: raw.symbol,
        };
    },

    /**
     * Fetch list of all available countries.
     * Automatically fetches ALL pages (page 1 & 2) via the server endpoint.
     * Cache expires after 5 minutes since country lists don't change often.
     */
    getCountries: async (): Promise<Country[]> => {
        // Check cache first
        const now = Date.now();
        if (countriesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
            console.log('[Countries API] Returning cached countries:', countriesCache.length);
            return countriesCache;
        }

        console.log('[Countries API] Cache miss, fetching fresh data from server...');

        // Fetch all countries - the server automatically fetches page 1 & 2
        try {
            const response = await fetch('/api/countries');
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            const countries: Country[] = data.data || [];

            console.log('[Countries API] Fetched and cached:', countries.length, 'countries');

            // Update cache
            countriesCache = countries;
            cacheTimestamp = now;

            return countries;

        } catch (fetchError) {
            // Fallback to axios if fetch fails
            try {
                const { data } = await localClient.get('/api/countries');
                const countries: Country[] = data.data || [];

                // Update cache
                countriesCache = countries;
                cacheTimestamp = now;

                return countries;
            } catch (axiosError) {
                throw fetchError;
            }
        }
    },

    /**
     * Fetch currency details for ALL supported countries in parallel.
     */
    getAllCurrencies: async (): Promise<CurrencyDetail[]> => {
        const results = await Promise.allSettled(
            SUPPORTED_ISO2_CODES.map(iso2 => feesApi.getCurrencyByIso2(iso2))
        );
        return results
            .filter((r): r is PromiseFulfilledResult<CurrencyDetail> => r.status === 'fulfilled')
            .map(r => r.value);
    },
};
