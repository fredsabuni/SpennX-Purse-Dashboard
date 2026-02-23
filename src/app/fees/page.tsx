'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
    ArrowUpDown, Loader2, Search, ChevronDown, X,
    ArrowRight, Shield, Globe2, Banknote, Smartphone,
    Bitcoin, Landmark, Truck, Clock, CheckCircle2,
    AlertCircle, Zap, TrendingUp, RefreshCw, Info
} from 'lucide-react';
import { useCurrencyDetail } from '@/hooks/useCurrencyData';
import {
    type CurrencyDetail, type FeeStructure,
    type InternationalRemittance, type DeliveryWindow,
    type Country, feesApi, COUNTRY_LOCAL_CURRENCY
} from '@/lib/fees-api';
import { cn } from '@/lib/utils';

// ─── Flag helper ─────────────────────────────────────────────────────
function iso2ToFlag(iso2: string): string {
    if (!iso2) return '🏳️';
    const code = iso2.toUpperCase();
    return String.fromCodePoint(
        ...code.split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
    );
}

// ─── Currency Symbol Mapper ──────────────────────────────────────────
// Maps currency codes to their symbols for display in exchange rates
const CURRENCY_SYMBOLS: Record<string, string> = {
    // Major currencies
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', CHF: 'Fr',
    AUD: 'A$', CAD: 'C$', NZD: 'NZ$', SGD: 'S$', HKD: 'HK$',
    
    // African currencies
    NGN: '₦', KES: 'KSh', GHS: '₵', ZAR: 'R', TZS: 'TSh',
    UGX: 'USh', RWF: 'FRw', ETB: 'Br', EGP: '£E', MAD: 'DH',
    XOF: 'CFA', XAF: 'FCFA', CDF: 'FC', ZMW: 'ZK', BWP: 'P',
    MZN: 'MT', AOA: 'Kz', SSP: '£', SDG: '£', TND: 'DT',
    DZD: 'DA', LYD: 'LD', KMF: 'CF', MGA: 'Ar', MUR: '₨',
    SCR: '₨', SOS: 'Sh', DJF: 'Fdj', ERN: 'Nfk', GMD: 'D',
    GNF: 'FG', LRD: 'L$', MWK: 'MK', SLL: 'Le', STN: 'Db',
    SZL: 'L', LSL: 'L', NAD: 'N$', BIF: 'FBu', CVE: '$',
    
    // Asian currencies
    INR: '₹', PKR: '₨', BDT: '৳', PHP: '₱', THB: '฿',
    VND: '₫', IDR: 'Rp', MYR: 'RM', KRW: '₩', TWD: 'NT$',
    MMK: 'K', KHR: '៛', LAK: '₭', NPR: '₨', LKR: '₨',
    AFN: '؋', IRR: '﷼', IQD: 'ع.د', JOD: 'JD', KWD: 'KD',
    BHD: 'BD', OMR: 'OMR', QAR: 'QR', SAR: 'SR', AED: 'د.إ',
    ILS: '₪', SYP: '£S', LBP: 'LL', YER: '﷼', UZS: 'soʻm',
    KZT: '₸', AZN: '₼', GEL: '₾', AMD: '֏', KGS: 'с',
    TJS: 'SM', TMT: 'T', MNT: '₮', BND: 'B$',
    
    // European currencies
    NOK: 'kr', SEK: 'kr', DKK: 'kr', ISK: 'kr', PLN: 'zł',
    CZK: 'Kč', HUF: 'Ft', RON: 'lei', BGN: 'лв', HRK: 'kn',
    RSD: 'din', MKD: 'ден', ALL: 'L', BAM: 'KM', MDL: 'lei',
    UAH: '₴', BYN: 'Br', RUB: '₽', TRY: '₺',
    
    // Americas
    MXN: 'Mex$', BRL: 'R$', ARS: 'AR$', CLP: 'CL$', COP: 'COL$',
    PEN: 'S/', UYU: '$U', PYG: '₲', BOB: 'Bs', VES: 'Bs.S',
    CRC: '₡', GTQ: 'Q', HNL: 'L', NIO: 'C$', PAB: 'B/.',
    DOP: 'RD$', JMD: 'J$', TTD: 'TT$', BBD: 'Bds$', BSD: 'B$',
    BZD: 'BZ$', XCD: 'EC$', HTG: 'G', CUP: '₱', AWG: 'ƒ',
    
    // Oceania
    FJD: 'FJ$', PGK: 'K', TOP: 'T$', WST: 'WS$', VUV: 'VT',
};

function getCurrencySymbol(currencyCode: string): string {
    return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

// ─── Fee formatter ───────────────────────────────────────────────────
function formatFee(fee: FeeStructure | undefined, currencyCode?: string): string {
    if (!fee) return 'N/A';
    if (fee.type === 'no_fee') return 'Free';
    const parts: string[] = [];
    if (fee.fiat && fee.fiat > 0) parts.push(`${fee.fiat.toFixed(2)} ${currencyCode || ''}`);
    if (fee.percent && fee.percent > 0) parts.push(`${fee.percent}%`);
    if (parts.length === 0) return 'Free';
    return parts.join(' + ').trim();
}

// ─── Tabs ────────────────────────────────────────────────────────────
type TabId = 'limits' | 'rates' | 'remittance' | 'delivery';

const TABS: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'limits', label: 'Transfer Limits', icon: Shield, desc: 'Min/Max amounts per channel' },
    { id: 'rates', label: 'Exchange Rates', icon: TrendingUp, desc: 'Live rates by destination' },
    { id: 'remittance', label: 'Intl. Remittance', icon: Globe2, desc: 'Countries, swap fees & windows' },
    { id: 'delivery', label: 'Delivery Methods', icon: Truck, desc: 'Channels and their fees' },
];

// ─── Main Page ───────────────────────────────────────────────────────
export default function FeeCheckerPage() {
    const [selectedIso2, setSelectedIso2] = useState('');
    const [activeTab, setActiveTab] = useState<TabId>('limits');
    const [remittanceSearch, setRemittanceSearch] = useState('');
    
    // Simple state management for countries (bypass React Query)
    const [countries, setCountries] = useState<Country[]>([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    
    const { data: currencyData, isLoading, error, isFetching } = useCurrencyDetail(selectedIso2);
    
    // Load countries directly with useEffect
    useEffect(() => {
        const loadCountries = async () => {
            try {
                setLoadingCountries(true);
                console.log('[Fees Page] Fetching countries...');
                
                const countriesData = await feesApi.getCountries();
                console.log('[Fees Page] Received countries:', countriesData?.length);
                
                if (countriesData && Array.isArray(countriesData) && countriesData.length > 0) {
                    setCountries(countriesData);
                    console.log('[Fees Page] Successfully loaded', countriesData.length, 'countries');
                } else {
                    setCountries([]);
                    console.warn('[Fees Page] No countries data received');
                }
            } catch (error) {
                setCountries([]);
                console.error('[Fees Page] Error loading countries:', error);
            } finally {
                setLoadingCountries(false);
            }
        };
        
        loadCountries();
    }, []);

    const handleSelect = useCallback((iso2: string) => {
        setSelectedIso2(iso2);
        setActiveTab('limits');
        setRemittanceSearch('');
    }, []);

    const selectedCountryName = useMemo(() => {
        console.log('selectedCountryName calc - countries state:', countries.length);
        return countries.find(c => c.iso2 === selectedIso2)?.name || selectedIso2;
    }, [countries, selectedIso2]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        Fee &amp; Currency Checker
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Select a source country to inspect transfer limits, exchange rates, remittance corridors &amp; delivery fees
                    </p>
                </div>
                {currencyData && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                        <span>Live from SpennX API</span>
                    </div>
                )}
            </div>

            {/* Country Selector Card */}
            <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] min-h-[200px]">
                <div className="h-0.5 w-full bg-gradient-to-r from-[#317CFF] via-[#4CCDF6] to-[#317CFF] opacity-60" />
                <div className="p-5 md:p-6 min-h-[180px]">
                    <QuickCountrySelector
                        selectedIso2={selectedIso2}
                        onSelect={handleSelect}
                        isFetching={isFetching}
                        countries={countries}
                        isLoadingCountries={loadingCountries}
                    />
                </div>
            </div>

            {/* Loading */}
            {isLoading && selectedIso2 && (
                <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-12 flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="h-10 w-10 rounded-full border-2 border-[#1F1F1F]" />
                        <Loader2 className="h-10 w-10 text-[#317CFF] animate-spin absolute inset-0" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-white">Loading {selectedCountryName}…</p>
                        <p className="text-xs text-gray-600 mt-1">Fetching fees, rates &amp; limits</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && !isLoading && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <Info className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="text-center max-w-md">
                        <p className="text-sm font-medium text-white">Unable to load currency data</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Check your API token in .env.local and try again.
                        </p>
                        <button
                            onClick={() => setSelectedIso2(selectedIso2)}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1F1F1F] bg-[#1F1F1F] text-xs font-medium text-white hover:bg-[#2A2A2A] transition-colors"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!selectedIso2 && (
                <div className="rounded-2xl border border-dashed border-[#1F1F1F] bg-[#060606] p-16 flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-3xl bg-[#317CFF]/10 flex items-center justify-center">
                        <Globe2 className="h-7 w-7 text-[#317CFF]" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-white">Select a country above</p>
                        <p className="text-xs text-gray-600 mt-1">
                            All fee details, exchange rates, and delivery options will appear here
                        </p>
                    </div>
                </div>
            )}

            {/* Main Data Area */}
            {currencyData && !isLoading && !error && (
                <div className="space-y-5">
                    {/* Currency Banner */}
                    <CurrencyBanner data={currencyData} iso2={selectedIso2} />

                    {/* Tab Bar */}
                    <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-1.5">
                        <div className="flex gap-1 overflow-x-auto no-scrollbar">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'flex-1 min-w-[140px] flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-all duration-200',
                                        activeTab === tab.id
                                            ? 'bg-[#317CFF]/10 border border-[#317CFF]/30 text-white'
                                            : 'text-gray-500 hover:text-gray-300 hover:bg-[#111111] border border-transparent'
                                    )}
                                >
                                    <tab.icon className={cn(
                                        'h-4 w-4 shrink-0',
                                        activeTab === tab.id ? 'text-[#317CFF]' : ''
                                    )} />
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold truncate">{tab.label}</p>
                                        <p className="text-[10px] text-gray-600 truncate hidden md:block">{tab.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="animate-in fade-in duration-300">
                        {activeTab === 'limits' && (
                            <TransferLimitsTab data={currencyData} />
                        )}
                        {activeTab === 'rates' && (
                            <ExchangeRatesTab data={currencyData} countries={countries} />
                        )}
                        {activeTab === 'remittance' && (
                            <RemittanceTab
                                data={currencyData}
                                search={remittanceSearch}
                                onSearchChange={setRemittanceSearch}
                            />
                        )}
                        {activeTab === 'delivery' && (
                            <DeliveryMethodsTab data={currencyData} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Quick Country Selector ──────────────────────────────────────────
function QuickCountrySelector({
    selectedIso2,
    onSelect,
    isFetching,
    countries,
    isLoadingCountries,
}: {
    selectedIso2: string;
    onSelect: (iso2: string) => void;
    isFetching: boolean;
    countries: Country[];
    isLoadingCountries: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [showAllResults, setShowAllResults] = useState(false);

    // Most searched countries that appear first
    const popularCountries = ['NG', 'US', 'GH', 'AE', 'GB'];

    const { displayCountries, hasMore, filteredCount } = useMemo(() => {
        if (!countries || countries.length === 0) {
            return { displayCountries: [], hasMore: false, filteredCount: 0 };
        }

        let filtered: Country[];
        
        if (!search.trim()) {
            // No search - show popular countries first, then others
            const popular = countries.filter(c => popularCountries.includes(c.iso2));
            const others = countries.filter(c => !popularCountries.includes(c.iso2));
            filtered = [...popular, ...others];
        } else {
            // Search mode - filter by search term
            const q = search.toLowerCase().trim();
            filtered = countries.filter(c => 
                c && c.name && c.iso2 &&
                (c.name.toLowerCase().includes(q) || c.iso2.toLowerCase().includes(q))
            );
        }

        // Limit results unless "show all" is requested
        const limit = search.trim() ? filtered.length : (showAllResults ? filtered.length : 25);
        const displayCountries = filtered.slice(0, limit);
        const hasMore = filtered.length > limit;
        const filteredCount = filtered.length;

        return { displayCountries, hasMore, filteredCount };
    }, [search, countries, showAllResults, popularCountries]);

    const selected = countries.find(c => c.iso2 === selectedIso2);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('[data-country-selector]')) {
                setIsOpen(false);
            }
        };
        
        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isOpen]);

    return (
        <div className="relative" data-country-selector>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#317CFF] mb-2">
                Source Country
            </label>
            
            {/* Search Input Design */}
            <div className="relative">
                <div className={cn(
                    'w-full flex items-center gap-3 rounded-xl px-4 py-3',
                    'border border-[#1F1F1F] bg-[#060606] transition-all duration-200',
                    isOpen && 'border-[#317CFF]/50 ring-1 ring-[#317CFF]/20',
                    isLoadingCountries && 'opacity-60'
                )}>
                    {isLoadingCountries ? (
                        <>
                            <Loader2 className="h-5 w-5 text-[#317CFF] animate-spin" />
                            <span className="text-sm text-gray-500">Loading countries…</span>
                        </>
                    ) : selected ? (
                        <>
                            <span className="text-2xl leading-none">{iso2ToFlag(selected.iso2)}</span>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">{selected.name}</div>
                                <div className="text-xs text-gray-500 font-mono mt-0.5">{selected.iso2}</div>
                            </div>
                            {isFetching && (
                                <Loader2 className="h-4 w-4 text-[#317CFF] animate-spin shrink-0" />
                            )}
                            <button
                                onClick={() => {
                                    onSelect('');
                                    setSearch('');
                                }}
                                className="p-1 rounded-lg hover:bg-[#1F1F1F] transition-colors"
                            >
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Search className="h-5 w-5 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setIsOpen(true);
                                    setShowAllResults(false);
                                }}
                                onFocus={() => setIsOpen(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setIsOpen(true);
                                    }
                                }}
                                placeholder="Search for a country..."
                                className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                                disabled={isLoadingCountries}
                            />
                            {search && (
                                <button
                                    onClick={() => {
                                        setSearch('');
                                        setShowAllResults(false);
                                    }}
                                    className="p-1 rounded-lg hover:bg-[#1F1F1F] transition-colors"
                                >
                                    <X className="h-4 w-4 text-gray-500" />
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Results Panel */}
                {isOpen && !isLoadingCountries && countries.length > 0 && (
                    <div className={cn(
                        'absolute z-[100] left-0 right-0 mt-2',
                        'rounded-xl border border-[#1F1F1F] bg-[#0A0A0A]/95 backdrop-blur-xl',
                        'shadow-2xl shadow-black/50',
                        'animate-in fade-in slide-in-from-top-2 duration-200'
                    )}>
                        {!search && !selected && (
                            <div className="px-4 py-3 border-b border-[#1F1F1F] flex items-center justify-between">
                                <p className="text-xs text-gray-500">Most searched countries</p>
                                <p className="text-xs text-gray-600">{countries.length} total</p>
                            </div>
                        )}
                        
                        {search && (
                            <div className="px-4 py-3 border-b border-[#1F1F1F]">
                                <p className="text-xs text-gray-500">
                                    {filteredCount} {filteredCount === 1 ? 'country' : 'countries'} found
                                </p>
                            </div>
                        )}
                        
                        <div className="max-h-[500px] overflow-y-auto">
                            {displayCountries.length === 0 ? (
                                <div className="px-4 py-8 text-center">
                                    {search ? (
                                        <>
                                            <Search className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500">
                                                No countries found for &ldquo;{search}&rdquo;
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                Try searching by country name or code
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <Globe2 className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500">No countries available</p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div className="py-2">
                                        {displayCountries.map((country, index) => {
                                            const isSelected = selectedIso2 === country.iso2;
                                            const isPopular = popularCountries.includes(country.iso2) && !search;
                                            
                                            return (
                                                <button
                                                    key={country.iso2}
                                                    onClick={() => {
                                                        onSelect(country.iso2);
                                                        setIsOpen(false);
                                                        setSearch('');
                                                        setShowAllResults(false);
                                                    }}
                                                    className={cn(
                                                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                                                        isSelected 
                                                            ? 'bg-[#317CFF]/10 border-r-2 border-[#317CFF]' 
                                                            : 'hover:bg-[#1F1F1F]'
                                                    )}
                                                >
                                                    <span className="text-xl leading-none">{iso2ToFlag(country.iso2)}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                'text-sm font-medium truncate',
                                                                isSelected ? 'text-[#317CFF]' : 'text-white'
                                                            )}>
                                                                {country.name}
                                                            </span>
                                                            {isPopular && (
                                                                <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-full bg-[#317CFF]/15 text-[#317CFF]">
                                                                    Popular
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-gray-500 font-mono">{country.iso2}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <CheckCircle2 className="h-4 w-4 text-[#317CFF] shrink-0" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    
                                    {hasMore && (
                                        <div className="border-t border-[#1F1F1F] p-3">
                                            <button
                                                onClick={() => setShowAllResults(true)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#1F1F1F] bg-[#060606] hover:bg-[#0E0E0E] transition-colors text-xs text-gray-400 hover:text-gray-300"
                                            >
                                                <ArrowUpDown className="h-3.5 w-3.5" />
                                                Show all {countries.length} countries
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Currency Banner ─────────────────────────────────────────────────
function CurrencyBanner({ data, iso2 }: { data: CurrencyDetail; iso2: string }) {
    const settings = data.settings;
    const remittanceCount = settings?.international_remittance?.length || 0;
    const rateCount = settings?.local_transfer?.rates?.length || 0;
    
    // Validate if we're analyzing the LOCAL currency for this country
    const expectedLocalCurrency = COUNTRY_LOCAL_CURRENCY[iso2];
    const isLocalCurrency = !expectedLocalCurrency || data.currency === expectedLocalCurrency;

    return (
        <div className="space-y-3">
            {/* Currency Mismatch Warning */}
            {!isLocalCurrency && expectedLocalCurrency && (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-yellow-400">Currency Mismatch Detected</p>
                        <p className="text-xs text-yellow-200/80 mt-1">
                            You selected <span className="font-semibold">{data.name}</span>, but the data shows <span className="font-mono font-semibold">{data.currency}</span> instead of the local currency <span className="font-mono font-semibold">{expectedLocalCurrency}</span>.
                            This may be displaying foreign currency data for this country.
                        </p>
                    </div>
                </div>
            )}
            
            <div className="rounded-2xl border border-[#1F1F1F] bg-gradient-to-br from-[#0A0A0A] to-[#0F0F0F] p-5 md:p-6">
                <div className="flex items-center gap-4">
                    <div className="text-4xl leading-none">{iso2ToFlag(iso2)}</div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-white">{data.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className={cn(
                                "text-xs font-mono px-2 py-0.5 rounded-md",
                                isLocalCurrency 
                                    ? "text-gray-400 bg-[#1F1F1F]" 
                                    : "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20"
                            )}>
                                {data.currency}
                                {!isLocalCurrency && " ⚠️"}
                            </span>
                            <span className="text-xs text-gray-500">{data.symbol} • {data.iso2}</span>
                            {isLocalCurrency && expectedLocalCurrency && (
                                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
                                    ✓ Local Currency
                                </span>
                            )}
                        </div>
                    </div>
                </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-5">
                <QuickStat
                    label="Local Transfer"
                    value={settings?.local_transfer?.active ? 'Active' : 'Disabled'}
                    active={settings?.local_transfer?.active}
                />
                <QuickStat
                    label="Exchange Rates"
                    value={`${rateCount} currencies`}
                    active={rateCount > 0}
                />
                <QuickStat
                    label="Remittance"
                    value={`${remittanceCount} corridors`}
                    active={remittanceCount > 0}
                />
            </div>
            </div>
        </div>
    );
}

function QuickStat({ label, value, active }: { label: string; value: string; active?: boolean }) {
    return (
        <div className="rounded-xl bg-[#060606] border border-[#1A1A1A] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-0.5">{label}</p>
            <div className="flex items-center gap-1.5">
                <div className={cn(
                    'h-1.5 w-1.5 rounded-full shrink-0',
                    active ? 'bg-green-500' : 'bg-gray-600'
                )} />
                <p className="text-sm font-medium text-white truncate">{value}</p>
            </div>
        </div>
    );
}

// ─── Tab 1: Transfer Limits ──────────────────────────────────────────
// NOTE: Uses data.symbol & data.currency from the selected country's API response
// This ensures each country displays its own currency (e.g., ₦ NGN for Nigeria, $ USD for USA)
// ONLY displays sections with actual data from the API - no fabricated data
function TransferLimitsTab({ data }: { data: CurrencyDetail }) {
    const s = data.settings;
    
    // Debug logging to see actual API structure
    console.log('[Transfer Limits] Settings data:', s);
    console.log('[Transfer Limits] Has local_transfer?', !!s?.local_transfer);
    
    if (!s) return <EmptyTab message="No settings data available" />;

    // Build sections array with ONLY real data from API
    // NOTE: Only showing Local Transfer - this is the only confirmed transfer limit data from API
    // local_swap exists but contains exchange rates, not limit/fee data for this tab
    const allSections = [
        {
            title: 'Transfer',
            icon: ArrowRight,
            active: s.local_transfer?.active,
            limit: s.local_transfer?.limit,
            fee: s.local_transfer?.fee,
            color: '#317CFF',
            exists: !!s.local_transfer,
        },
    ];

    const sections = allSections.filter(sec => sec.exists);
    
    console.log('[Transfer Limits] Displaying', sections.length, 'sections:', sections.map(s => s.title).join(', '));

    // If no data at all, show empty state
    if (sections.length === 0) {
        return <EmptyTab message="No transfer limit data available for this currency" />;
    }

    return (
        <div className="space-y-4">
            {/* Info Banner */}
            {sections.length < allSections.length && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 flex items-start gap-3">
                    <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-200/90">
                            Showing {sections.length} of {allSections.length} available sections. 
                            Only displaying data returned by the API for {data.currency}.
                        </p>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map(sec => (
                <div
                    key={sec.title}
                    className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 hover:border-[#2A2A2A] transition-colors"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${sec.color}15` }}
                        >
                            <sec.icon className="h-4 w-4" style={{ color: sec.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white">{sec.title}</h3>
                            <p className="text-[10px] text-gray-600 mt-0.5 font-mono">{data.currency}</p>
                        </div>
                        <StatusBadge active={sec.active} />
                    </div>

                    {sec.limit && (
                        <div className="grid grid-cols-2 gap-3">
                            {/* Using selected country's symbol from API */}
                            <DataCell label="Min Amount" value={`${data.symbol} ${sec.limit.min.toLocaleString()}`} />
                            <DataCell label="Max Amount" value={`${data.symbol} ${sec.limit.max.toLocaleString()}`} />
                        </div>
                    )}
                </div>
            ))}
            </div>
        </div>
    );
}

// ─── Tab 2: Exchange Rates ───────────────────────────────────────────
function ExchangeRatesTab({ data, countries }: { data: CurrencyDetail; countries: Country[] }) {
    const [rateSearch, setRateSearch] = useState('');
    const s = data.settings;

    const localRates = s?.local_transfer?.rates || [];
    const swapRates = s?.local_swap?.rates || [];

    // Group rates by country
    const groupedRates = useMemo(() => {
        const groups: Record<string, { countryName: string; iso2: string; currencies: typeof localRates }> = {};
        
        for (const rate of localRates) {
            if (!rate.iso2) continue;
            
            if (!groups[rate.iso2]) {
                const country = countries.find(c => c.iso2 === rate.iso2);
                groups[rate.iso2] = {
                    countryName: country?.name || rate.iso2,
                    iso2: rate.iso2,
                    currencies: [],
                };
            }
            groups[rate.iso2].currencies.push(rate);
        }
        
        return Object.values(groups);
    }, [localRates, countries]);

    // Filter grouped rates by search
    const filteredGroupedRates = useMemo(() => {
        if (!rateSearch) return groupedRates;
        const q = rateSearch.toLowerCase();
        return groupedRates.filter(group =>
            group.countryName.toLowerCase().includes(q) ||
            group.iso2.toLowerCase().includes(q) ||
            group.currencies.some(c => c.currency.toLowerCase().includes(q))
        );
    }, [rateSearch, groupedRates]);

    const filteredSwap = useMemo(() => {
        if (!rateSearch) return swapRates;
        const q = rateSearch.toLowerCase();
        return swapRates.filter(r =>
            r.currency.toLowerCase().includes(q)
        );
    }, [rateSearch, swapRates]);

    if (localRates.length === 0 && swapRates.length === 0) {
        return <EmptyTab message="No exchange rates available for this currency" />;
    }

    const totalCurrencies = groupedRates.reduce((sum, group) => sum + group.currencies.length, 0);

    return (
        <div className="space-y-5">
            {/* Search + Stats */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                    <input
                        type="text"
                        value={rateSearch}
                        onChange={e => setRateSearch(e.target.value)}
                        placeholder="Search country or currency…"
                        className="w-full h-9 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] pl-9 pr-4 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#317CFF] transition-colors"
                    />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{groupedRates.length} {groupedRates.length === 1 ? 'country' : 'countries'}</span>
                    <span className="text-gray-700">•</span>
                    <span>{totalCurrencies} {totalCurrencies === 1 ? 'currency' : 'currencies'}</span>
                </div>
            </div>

            {/* Local Transfer Rates - Grouped by Country */}
            {filteredGroupedRates.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <ArrowRight className="h-4 w-4 text-[#317CFF]" />
                        <span className="text-xs font-semibold text-white">Local Transfer Rates by Country</span>
                        <span className="text-[10px] text-gray-600 ml-1">
                            1 {data.currency} = X destination currency
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredGroupedRates.map(group => (
                            <div
                                key={group.iso2}
                                className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden hover:border-[#2A2A2A] transition-colors"
                            >
                                {/* Country Header */}
                                <div className="px-4 py-3 bg-gradient-to-r from-[#0A0A0A] to-[#0F0F0F] border-b border-[#1A1A1A] flex items-center gap-3">
                                    <span className="text-2xl leading-none">{iso2ToFlag(group.iso2)}</span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-white truncate">{group.countryName}</h4>
                                        <p className="text-[10px] text-gray-500 font-mono">{group.iso2}</p>
                                    </div>
                                    <span className="px-2 py-1 rounded-lg bg-[#317CFF]/10 text-[10px] font-semibold text-[#317CFF]">
                                        {group.currencies.length} {group.currencies.length === 1 ? 'currency' : 'currencies'}
                                    </span>
                                </div>
                                
                                {/* Currency List */}
                                <div className="divide-y divide-[#1A1A1A]">
                                    {group.currencies.map(rate => (
                                        <div
                                            key={rate.currency}
                                            className="px-4 py-3 flex items-center gap-3 hover:bg-[#0E0E0E] transition-colors"
                                        >
                                            <div className="h-9 w-9 rounded-xl bg-[#1F1F1F] flex items-center justify-center shrink-0">
                                                <span className="text-sm">{getCurrencySymbol(rate.currency)}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-white font-mono">{rate.currency}</div>
                                                <div className="text-[10px] text-gray-600 mt-0.5">
                                                    1 {data.currency} = {parseFloat(rate.rate).toFixed(6)} {rate.currency}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-base font-mono font-bold text-white">
                                                    {parseFloat(rate.rate).toFixed(4)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Swap Rates */}
            {filteredSwap.length > 0 && (
                <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
                    <div className="px-5 py-3 border-b border-[#1F1F1F] flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-[#4CCDF6]" />
                        <span className="text-xs font-semibold text-white">Swap Rates</span>
                        <span className="text-[10px] text-gray-600 ml-1">
                            1 {data.currency} = X swap currency
                        </span>
                        {s?.local_swap?.fee && (
                            <span className="ml-auto text-[10px] text-gray-500">
                                Swap fee: {formatFee(s.local_swap.fee, data.currency)}
                            </span>
                        )}
                    </div>
                    <div className="divide-y divide-[#1A1A1A]">
                        {filteredSwap.map(rate => (
                            <div key={rate.currency} className="flex items-center gap-3 px-5 py-3 hover:bg-[#0E0E0E] transition-colors">
                                <div className="h-8 w-8 rounded-lg bg-[#1F1F1F] flex items-center justify-center shrink-0">
                                    <span className="text-xs font-mono font-bold text-gray-400">{rate.currency.slice(0, 2)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-white font-mono">{rate.currency}</span>
                                </div>
                                <span className="text-sm font-mono text-white">{parseFloat(rate.rate).toFixed(8)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Tab 3: International Remittance ─────────────────────────────────
function RemittanceTab({
    data,
    search,
    onSearchChange,
}: {
    data: CurrencyDetail;
    search: string;
    onSearchChange: (v: string) => void;
}) {
    const remittances = data.settings?.international_remittance || [];
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        if (!search) return remittances;
        const q = search.toLowerCase();
        return remittances.filter(r =>
            r.country.toLowerCase().includes(q) ||
            r.iso2.toLowerCase().includes(q) ||
            r.currency.toLowerCase().includes(q)
        );
    }, [search, remittances]);

    if (remittances.length === 0) {
        return <EmptyTab message="No international remittance corridors available for this currency" />;
    }

    return (
        <div className="space-y-4">
            {/* Search + Count */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Search by country, code, or currency…"
                        className="w-full h-9 rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] pl-9 pr-4 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#317CFF] transition-colors"
                    />
                </div>
                <span className="text-xs text-gray-500">
                    {filtered.length} of {remittances.length} corridors
                </span>
            </div>

            {/* Remittance List */}
            <div className="space-y-3">
                {filtered.map(rem => (
                    <RemittanceCard
                        key={rem.id}
                        rem={rem}
                        sourceCurrency={data.currency}
                        sourceSymbol={data.symbol}
                        expanded={expandedId === rem.id}
                        onToggle={() => setExpandedId(expandedId === rem.id ? null : rem.id)}
                    />
                ))}
            </div>
        </div>
    );
}

function RemittanceCard({
    rem,
    sourceCurrency,
    sourceSymbol,
    expanded,
    onToggle,
}: {
    rem: InternationalRemittance;
    sourceCurrency: string;
    sourceSymbol: string;
    expanded: boolean;
    onToggle: () => void;
}) {
    const activeDeliveryMethods = Object.entries(rem.delivery_methods || {}).filter(
        ([, v]) => v.active
    );

    return (
        <div className={cn(
            'rounded-2xl border bg-[#0A0A0A] overflow-hidden transition-all duration-200',
            expanded ? 'border-[#317CFF]/30' : 'border-[#1F1F1F] hover:border-[#2A2A2A]'
        )}>
            {/* Header – always visible */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 px-5 py-4 text-left"
            >
                <span className="text-2xl leading-none">{iso2ToFlag(rem.iso2)}</span>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-white truncate">{rem.country}</h4>
                        <span className="text-xs font-mono text-gray-500">{rem.currency}</span>
                        <span className="text-xs text-gray-600">{rem.currency_symbol}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500">
                            Limit: {rem.currency_symbol}{rem.limit.min.toLocaleString()} – {rem.currency_symbol}{rem.limit.max.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-600">•</span>
                        <span className="text-[10px] text-gray-500">
                            Swap Fee: {formatFee(rem.swap_fee, rem.currency)}
                        </span>
                        {activeDeliveryMethods.length > 0 && (
                            <>
                                <span className="text-[10px] text-gray-600">•</span>
                                <span className="text-[10px] text-gray-500">
                                    {activeDeliveryMethods.length} delivery method{activeDeliveryMethods.length > 1 ? 's' : ''}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <ChevronDown className={cn(
                    'h-4 w-4 text-gray-500 transition-transform duration-200 shrink-0',
                    expanded && 'rotate-180 text-[#317CFF]'
                )} />
            </button>

            {/* Expanded details */}
            {expanded && (
                <div className="border-t border-[#1F1F1F] px-5 py-4 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    {/* Quick info grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <DataCell label="Currency" value={`${rem.currency_name} (${rem.currency})`} />
                        <DataCell label="Phone Code" value={rem.phonecode} />
                        <DataCell label="IBAN Verify" value={rem.bank_iban_verify ? 'Required' : 'Not Required'} />
                        <DataCell label="Delivery Window" value={rem.delivery_window_required ? 'Required' : 'Not Required'} />
                    </div>

                    {/* Swap Fee */}
                    <div className="rounded-xl bg-[#060606] border border-[#1A1A1A] p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <ArrowUpDown className="h-3.5 w-3.5 text-[#4CCDF6]" />
                            <span className="text-xs font-semibold text-white">Swap Fee</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <DataCell label="Type" value={rem.swap_fee.type.replace(/_/g, ' ').toUpperCase()} />
                            <DataCell label="Flat Fee" value={rem.swap_fee.fiat > 0 ? `${rem.swap_fee.fiat} ${rem.currency}` : 'None'} />
                            <DataCell label="Percentage" value={rem.swap_fee.percent > 0 ? `${rem.swap_fee.percent}%` : 'None'} />
                        </div>
                    </div>

                    {/* Delivery Methods */}
                    <div>
                        <h5 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                            <Truck className="h-3.5 w-3.5 text-gray-400" />
                            Delivery Methods
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(rem.delivery_methods || {}).map(([key, method]) => {
                                const Icon = key === 'bank' ? Landmark
                                    : key === 'mobile_money' ? Smartphone
                                    : key === 'crypto' ? Bitcoin
                                    : Banknote;
                                return (
                                    <div
                                        key={key}
                                        className={cn(
                                            'rounded-xl border px-3 py-2.5 transition-colors',
                                            method.active
                                                ? 'bg-green-500/5 border-green-500/20'
                                                : 'bg-[#060606] border-[#1A1A1A] opacity-50'
                                        )}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className={cn('h-3.5 w-3.5', method.active ? 'text-green-400' : 'text-gray-600')} />
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                                {key.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className={cn(
                                                'h-1.5 w-1.5 rounded-full',
                                                method.active ? 'bg-green-500' : 'bg-gray-600'
                                            )} />
                                            <span className="text-xs text-white">
                                                {method.active ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                        {method.active && (
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                Fee: {formatFee(method.fee, rem.currency)}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Delivery Windows */}
                    {rem.delivery_windows && rem.delivery_windows.length > 0 && (
                        <div>
                            <h5 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-gray-400" />
                                Delivery Windows
                            </h5>
                            <div className="space-y-2">
                                {rem.delivery_windows.map(win => (
                                    <DeliveryWindowRow key={win.id} win={win} destinationCurrency={rem.currency} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bank Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rem.bank_routing_types.length > 0 && (
                            <div className="rounded-xl bg-[#060606] border border-[#1A1A1A] px-3 py-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Routing Types</p>
                                <div className="flex flex-wrap gap-1">
                                    {rem.bank_routing_types.map(t => (
                                        <span key={t} className="px-2 py-0.5 rounded-md bg-[#1F1F1F] text-[10px] font-mono text-gray-400">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {rem.bank_account_types.length > 0 && (
                            <div className="rounded-xl bg-[#060606] border border-[#1A1A1A] px-3 py-2.5">
                                <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Account Types</p>
                                <div className="flex flex-wrap gap-1">
                                    {rem.bank_account_types.map(t => (
                                        <span key={t.id} className="px-2 py-0.5 rounded-md bg-[#1F1F1F] text-[10px] font-mono text-gray-400">
                                            {t.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Entity Support */}
                    <div className="rounded-xl bg-[#060606] border border-[#1A1A1A] px-3 py-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-1">Entity Support</p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5">
                                {rem.bank_entity_type.individual ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                                ) : (
                                    <AlertCircle className="h-3.5 w-3.5 text-gray-600" />
                                )}
                                <span className="text-xs text-gray-300">Individual</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {rem.bank_entity_type.business ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                                ) : (
                                    <AlertCircle className="h-3.5 w-3.5 text-gray-600" />
                                )}
                                <span className="text-xs text-gray-300">Business</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function DeliveryWindowRow({ win, destinationCurrency }: { win: DeliveryWindow; destinationCurrency: string }) {
    return (
        <div className={cn(
            'rounded-xl border px-4 py-3 flex flex-col md:flex-row md:items-center gap-3',
            win.recommended
                ? 'bg-[#317CFF]/5 border-[#317CFF]/20'
                : 'bg-[#060606] border-[#1A1A1A]'
        )}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <Zap className={cn('h-4 w-4 shrink-0', win.recommended ? 'text-[#317CFF]' : 'text-gray-500')} />
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{win.name}</span>
                        {win.recommended && (
                            <span className="px-1.5 py-0.5 rounded-full bg-[#317CFF]/15 text-[9px] font-bold text-[#317CFF] uppercase">
                                Recommended
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-500">{win.duration}</span>
                </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
                <div>
                    <span className="text-gray-600">Rate: </span>
                    <span className="font-mono text-white">{win.rate.toFixed(8)}</span>
                </div>
                <div>
                    <span className="text-gray-600">Rail: </span>
                    <span className="text-gray-300">{win.payout_rail.replace(/_/g, ' ')}</span>
                </div>
                <div>
                    <span className="text-gray-600">Fee: </span>
                    <span className="text-white">{formatFee(win.fee, destinationCurrency)}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Tab 4: Delivery Methods (from local transfer + remittance overview) ──
function DeliveryMethodsTab({ data }: { data: CurrencyDetail }) {
    const remittances = data.settings?.international_remittance || [];

    // Aggregate delivery method availability across all remittance corridors
    const methodStats = useMemo(() => {
        const stats: Record<string, { total: number; active: number; fees: string[] }> = {
            bank: { total: 0, active: 0, fees: [] },
            mobile_money: { total: 0, active: 0, fees: [] },
            crypto: { total: 0, active: 0, fees: [] },
            cash_pickup: { total: 0, active: 0, fees: [] },
        };

        for (const rem of remittances) {
            for (const [key, method] of Object.entries(rem.delivery_methods || {})) {
                if (stats[key]) {
                    stats[key].total++;
                    if (method.active) {
                        stats[key].active++;
                        const feeStr = formatFee(method.fee, rem.currency);
                        if (!stats[key].fees.includes(feeStr)) {
                            stats[key].fees.push(feeStr);
                        }
                    }
                }
            }
        }
        return stats;
    }, [remittances]);

    const methods = [
        { key: 'bank', label: 'Bank Transfer', icon: Landmark, color: '#317CFF', desc: 'Direct bank account deposits' },
        { key: 'mobile_money', label: 'Mobile Money', icon: Smartphone, color: '#22C55E', desc: 'M-Pesa, MTN, Airtel Money etc.' },
        { key: 'crypto', label: 'Crypto', icon: Bitcoin, color: '#F59E0B', desc: 'Cryptocurrency payouts' },
        { key: 'cash_pickup', label: 'Cash Pickup', icon: Banknote, color: '#EF4444', desc: 'In-person cash collection' },
    ];

    if (remittances.length === 0) {
        return <EmptyTab message="No delivery method data available – select a country with active remittance corridors" />;
    }

    return (
        <div className="space-y-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {methods.map(m => {
                    const stat = methodStats[m.key];
                    const pct = stat.total > 0 ? Math.round((stat.active / stat.total) * 100) : 0;
                    return (
                        <div
                            key={m.key}
                            className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 hover:border-[#2A2A2A] transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${m.color}15` }}
                                >
                                    <m.icon className="h-5 w-5" style={{ color: m.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-white">{m.label}</h4>
                                    <p className="text-[10px] text-gray-600">{m.desc}</p>
                                </div>
                            </div>

                            {/* Active / Total bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                    <span>Active corridors</span>
                                    <span>{stat.active} / {stat.total} ({pct}%)</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-[#1F1F1F] overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${pct}%`,
                                            backgroundColor: m.color,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Fees */}
                            <div className="rounded-lg bg-[#060606] border border-[#1A1A1A] px-3 py-2">
                                <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-0.5">Fees</p>
                                <p className="text-xs text-white">
                                    {stat.fees.length > 0 ? stat.fees.join(', ') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Table */}
            <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] overflow-hidden">
                <div className="px-5 py-3 border-b border-[#1F1F1F]">
                    <span className="text-xs font-semibold text-white">Delivery Method Matrix by Corridor</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-[#1F1F1F] text-gray-500">
                                <th className="text-left px-5 py-3 font-medium">Country</th>
                                <th className="text-center px-3 py-3 font-medium">Bank</th>
                                <th className="text-center px-3 py-3 font-medium">Mobile</th>
                                <th className="text-center px-3 py-3 font-medium">Crypto</th>
                                <th className="text-center px-3 py-3 font-medium">Cash</th>
                                <th className="text-right px-5 py-3 font-medium">Delivery Window</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1A1A1A]">
                            {remittances.map(rem => (
                                <tr key={rem.id} className="hover:bg-[#0E0E0E] transition-colors">
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base leading-none">{iso2ToFlag(rem.iso2)}</span>
                                            <span className="text-white font-medium">{rem.country}</span>
                                            <span className="text-gray-600 font-mono">{rem.currency}</span>
                                        </div>
                                    </td>
                                    <td className="text-center px-3 py-2.5">
                                        <MethodDot active={rem.delivery_methods?.bank?.active} />
                                    </td>
                                    <td className="text-center px-3 py-2.5">
                                        <MethodDot active={rem.delivery_methods?.mobile_money?.active} />
                                    </td>
                                    <td className="text-center px-3 py-2.5">
                                        <MethodDot active={rem.delivery_methods?.crypto?.active} />
                                    </td>
                                    <td className="text-center px-3 py-2.5">
                                        <MethodDot active={rem.delivery_methods?.cash_pickup?.active} />
                                    </td>
                                    <td className="text-right px-5 py-2.5 text-gray-400">
                                        {rem.delivery_windows?.[0]
                                            ? `${rem.delivery_windows[0].name} • ${rem.delivery_windows[0].duration}`
                                            : '—'
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Reusable Components ─────────────────────────────────────────────
function StatusBadge({ active }: { active?: boolean }) {
    return (
        <div className={cn(
            'px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
            active
                ? 'bg-green-500/10 text-green-400'
                : 'bg-gray-500/10 text-gray-500'
        )}>
            {active ? 'Active' : 'Disabled'}
        </div>
    );
}

function DataCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-[#060606] border border-[#1A1A1A] px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-0.5">{label}</p>
            <p className="text-xs font-medium text-white truncate">{value}</p>
        </div>
    );
}

function MethodDot({ active }: { active?: boolean }) {
    return (
        <div className="flex justify-center">
            <div className={cn(
                'h-2.5 w-2.5 rounded-full',
                active ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.4)]' : 'bg-[#2A2A2A]'
            )} />
        </div>
    );
}

function EmptyTab({ message }: { message: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-[#1F1F1F] bg-[#060606] p-12 flex flex-col items-center gap-3">
            <AlertCircle className="h-6 w-6 text-gray-600" />
            <p className="text-xs text-gray-500 text-center max-w-sm">{message}</p>
        </div>
    );
}
