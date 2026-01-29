'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
    onRangeChange: (range: { start?: string; end?: string }) => void;
    className?: string;
}

export function DateRangePicker({ className, onRangeChange }: DateRangePickerProps) {
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [tempDateRange, setTempDateRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [isOpen, setIsOpen] = React.useState(false);

  const [startDate, endDate] = dateRange;

  const handleApply = () => {
    setDateRange(tempDateRange);
    setIsOpen(false);
    
    const start = tempDateRange[0] ? tempDateRange[0].toISOString() : undefined;
    const end = tempDateRange[1] ? tempDateRange[1].toISOString() : undefined;
    onRangeChange({ start, end });
  };

  const handleCancel = () => {
    setIsOpen(false);
    setTempDateRange(dateRange); // Reset to last confirmed
  };

  // Sync temp state when opening
  React.useEffect(() => {
      if (isOpen) {
          setTempDateRange(dateRange);
      }
  }, [isOpen, dateRange]);

  const handleReset = () => {
    setTempDateRange([null, null]);
    setDateRange([null, null]);
    setIsOpen(false);
    onRangeChange({ start: undefined, end: undefined });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            id="date"
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1F1F1F] bg-[#1F1F1F] text-xs font-medium text-gray-300 transition-all duration-200",
              "hover:text-white hover:border-[#317CFF]/50 hover:bg-[#1F1F1F]/80 hover:shadow-[0_0_15px_rgba(49,124,255,0.15)]",
              "data-[state=open]:border-[#317CFF]/50 data-[state=open]:shadow-[0_0_15px_rgba(49,124,255,0.15)] data-[state=open]:text-white",
              !dateRange[0] && "text-gray-500 hover:text-gray-400"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {startDate ? (
              endDate ? (
                <>
                  {format(startDate, "LLL dd, y")} -{" "}
                  {format(endDate, "LLL dd, y")}
                </>
              ) : (
                format(startDate, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#0A0A0A] border-[#1F1F1F]" align="end">
            <div className="p-2">
                <Calendar
                    selectsRange
                    startDate={tempDateRange[0]}
                    endDate={tempDateRange[1]}
                    onRangeChange={setTempDateRange}
                    monthsShown={2}
                />
            </div>
          <div className="flex items-center justify-between p-3 border-t border-[#1F1F1F]/50 bg-[#0A0A0A]">
            <button 
                onClick={handleReset}
                className="text-xs text-red-500 hover:text-red-400 transition-colors px-2 py-1 font-medium"
            >
                Reset
            </button>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleCancel}
                    className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleApply}
                    className="text-xs bg-[#317CFF] hover:bg-[#2563EB] text-white px-3 py-1.5 rounded-md transition-colors font-medium"
                >
                    Apply Range
                </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
