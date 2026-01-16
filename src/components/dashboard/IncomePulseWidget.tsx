'use client';

import { NetIncomeStats } from '@/lib/types';
import { TrendingUp, Wallet, Target } from 'lucide-react';

interface IncomePulseWidgetProps {
  data: NetIncomeStats;
  loading?: boolean;
}

export function IncomePulseWidget({ data, loading }: IncomePulseWidgetProps) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 h-full space-y-6">
               <div className="flex gap-2">
                   <div className="h-6 w-6 bg-[#1F1F1F] animate-pulse rounded" />
                   <div className="h-6 w-32 bg-[#1F1F1F] animate-pulse rounded" />
               </div>
               <div className="grid grid-cols-3 gap-2">
                    <div className="h-20 w-full bg-[#1F1F1F] animate-pulse rounded-xl" />
                    <div className="h-20 w-full bg-[#1F1F1F] animate-pulse rounded-xl" />
                    <div className="h-20 w-full bg-[#1F1F1F] animate-pulse rounded-xl" />
               </div>
               <div className="space-y-2">
                   <div className="flex justify-between">
                       <div className="h-4 w-24 bg-[#1F1F1F] animate-pulse rounded" />
                       <div className="h-4 w-8 bg-[#1F1F1F] animate-pulse rounded" />
                   </div>
                   <div className="h-2 w-full bg-[#1F1F1F] animate-pulse rounded-full" />
               </div>
            </div>
        );
    }

    const safeData = {
        accumulated_revenue_ytd: Number(data?.accumulated_revenue_ytd || 0),
        accumulated_revenue_budget: Number(data?.accumulated_revenue_budget || 0),
        income_per_minute: Number(data?.income_per_minute || 0),
        income_per_hour: Number(data?.income_per_hour || 0),
        income_per_day: Number(data?.income_per_day || 0),
    };

    const budgetProgress = (safeData.accumulated_revenue_ytd / safeData.accumulated_revenue_budget) * 100;

  return (
    <div className="space-y-4">
       <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
            <div className="flex items-center gap-2 mb-6">
                <Wallet className="h-5 w-5 text-[#317CFF]" />
                <h3 className="text-lg font-semibold text-white">Net Income Pulse</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-[#1F1F1F]/50 border border-[#1F1F1F]">
                    <div className="text-xs text-gray-500 mb-1">Per Minute</div>
                    <div className="text-lg font-mono font-bold text-[#4CCDF6]">${safeData.income_per_minute.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                 <div className="p-3 rounded-xl bg-[#1F1F1F]/50 border border-[#1F1F1F]">
                    <div className="text-xs text-gray-500 mb-1">Per Hour</div>
                    <div className="text-lg font-mono font-bold text-white">${safeData.income_per_hour.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                 <div className="p-3 rounded-xl bg-[#1F1F1F]/50 border border-[#1F1F1F]">
                    <div className="text-xs text-gray-500 mb-1">Per Day</div>
                    <div className="text-lg font-mono font-bold text-white">${safeData.income_per_day.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">YTD Revenue vs Budget</span>
                    <span className="text-white font-medium">{budgetProgress.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full bg-[#1F1F1F] rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-[#317CFF] to-[#4CCDF6]"
                        style={{ width: `${Math.min(budgetProgress, 100)}%` }} 
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>${safeData.accumulated_revenue_ytd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span>Target: ${safeData.accumulated_revenue_budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
       </div>

       {/* Partner Flows (Simplified for now) */}
       {data.daily_inflows_outflows && (
           <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
               <h4 className="text-sm font-medium text-gray-400 mb-4">Partner Daily Flows</h4>
               <div className="space-y-3">
                   {data.daily_inflows_outflows.map((flow, idx) => (
                       <div key={idx} className="flex justify-between items-center text-sm">
                           <span className="text-white">{flow.partner_name}</span>
                            <div className="flex gap-3 text-xs">
                                <span className="text-green-500">In: ${flow.inflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <span className="text-red-500">Out: ${flow.outflow.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                       </div>
                   ))}
               </div>
           </div>
       )}
    </div>
  );
}
