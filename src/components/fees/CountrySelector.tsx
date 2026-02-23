'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CurrencyDetail } from '@/lib/fees-api';

/**
 * Convert iso2 code to emoji flag
 * e.g. "US" → 🇺🇸, "CA" → 🇨🇦
 */
export function iso2ToFlag(iso2: string): string {
    if (!iso2) return '🏳️';
    const code = iso2.toUpperCase();
    return String.fromCodePoint(
        ...code.split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
    );
}

interface CountrySelectorProps {
    label: string;
    selected: CurrencyDetail | null;
    options: CurrencyDetail[];
    onSelect: (country: CurrencyDetail) => void;
    loading?: boolean;
    accentColor?: string;
}

export function CountrySelector({
    label,
    selected,
    options,
    onSelect,
    loading = false,
    accentColor = '#317CFF',
}: CountrySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const filtered = useMemo(() => {
        if (!search) return options;
        const q = search.toLowerCase();
        return options.filter(c =>
            c.name?.toLowerCase().includes(q) ||
            c.iso2?.toLowerCase().includes(q) ||
            c.currency_code?.toLowerCase().includes(q) ||
            c.currency_name?.toLowerCase().includes(q)
        );
    }, [search, options]);

    return (
        <div ref={dropdownRef} className="relative w-full">
            {/* Label */}
            <span
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: accentColor }}
            >
                {label}
            </span>

            {/* Trigger */}
            <button
                id={`selector-${label.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className={cn(
                    'w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left',
                    'border border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#111111]',
                    'transition-all duration-200 cursor-pointer',
                    isOpen && 'ring-1 ring-opacity-50',
                    loading && 'opacity-50 cursor-wait'
                )}
                style={isOpen ? { borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}40` } : {}}
            >
                {selected ? (
                    <>
                        <span className="text-2xl leading-none">{iso2ToFlag(selected.iso2)}</span>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{selected.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                                {selected.currency_code && (
                                    <span className="font-mono">{selected.currency_code}</span>
                                )}
                                {selected.currency_symbol && (
                                    <span className="ml-1 text-gray-600">• {selected.currency_symbol}</span>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="h-8 w-8 rounded-full bg-[#1F1F1F] flex items-center justify-center">
                            <span className="text-base text-gray-500">🌍</span>
                        </div>
                        <span className="text-sm text-gray-500">Select a country</span>
                    </>
                )}
                <ChevronDown
                    className={cn(
                        'h-4 w-4 text-gray-500 transition-transform duration-200 shrink-0',
                        isOpen && 'rotate-180'
                    )}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className={cn(
                        'absolute z-50 left-0 right-0 mt-2',
                        'rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A]/95 backdrop-blur-xl',
                        'shadow-2xl shadow-black/50',
                        'animate-in fade-in slide-in-from-top-2 duration-200',
                        'max-h-[380px] flex flex-col overflow-hidden'
                    )}
                >
                    {/* Search */}
                    <div className="p-3 border-b border-[#1F1F1F]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search country or currency…"
                                className="w-full h-9 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] pl-9 pr-8 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#317CFF] transition-colors"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto flex-1 py-1 no-scrollbar">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-8 text-center text-xs text-gray-500">
                                No countries found for &ldquo;{search}&rdquo;
                            </div>
                        ) : (
                            filtered.map((country) => {
                                const isSelected = selected?.iso2 === country.iso2;
                                return (
                                    <button
                                        key={country.iso2}
                                        onClick={() => {
                                            onSelect(country);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                                            isSelected
                                                ? 'bg-[#317CFF]/10'
                                                : 'hover:bg-[#1F1F1F]'
                                        )}
                                    >
                                        <span className="text-xl leading-none">{iso2ToFlag(country.iso2)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className={cn(
                                                'text-sm font-medium truncate',
                                                isSelected ? 'text-[#317CFF]' : 'text-white'
                                            )}>
                                                {country.name}
                                            </div>
                                            {country.currency_code && (
                                                <div className="text-xs text-gray-500 mt-0.5 font-mono">
                                                    {country.currency_code}
                                                    {country.currency_symbol && ` • ${country.currency_symbol}`}
                                                </div>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <div
                                                className="h-2 w-2 rounded-full shrink-0"
                                                style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
                                            />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
