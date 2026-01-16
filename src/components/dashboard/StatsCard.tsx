import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  loading?: boolean;
}

export function StatsCard({ title, value, icon: Icon, description, trend, className, loading }: StatsCardProps) {
  if (loading) {
    return (
      <div className={cn(
        "rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 space-y-4",
        className
      )}>
         <div className="flex justify-between">
             <div className="h-4 w-24 bg-[#1F1F1F] animate-pulse rounded" />
             <div className="h-8 w-8 bg-[#1F1F1F] animate-pulse rounded-full" />
         </div>
         <div className="h-8 w-32 bg-[#1F1F1F] animate-pulse rounded" />
         <div className="h-4 w-40 bg-[#1F1F1F] animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-4 md:p-6 transition-all hover:border-[#317CFF]/50 hover:shadow-[0_0_20px_rgba(49,124,255,0.1)]",
      className
    )}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs md:text-sm font-medium text-gray-400">{title}</h3>
        <div className="rounded-full bg-[#1F1F1F] p-1.5 md:p-2 text-[#317CFF]">
          <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </div>
      </div>
      <div className="mt-3 md:mt-4">
        <div className="text-xl md:text-2xl font-bold text-white truncate">{value}</div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {trend && (
            <span className={cn(
              "flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded",
              trend.isPositive 
                ? "bg-green-500/10 text-green-500" 
                : "bg-red-500/10 text-red-500"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </span>
          )}
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
