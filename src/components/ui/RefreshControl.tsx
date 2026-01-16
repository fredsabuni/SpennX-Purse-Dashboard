'use client';

import { useState } from 'react';
import { RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface RefreshControlProps {
  className?: string;
  isLoading?: boolean;
  lastUpdated?: Date;
}

export function RefreshControl({ className = '', isLoading = false, lastUpdated }: RefreshControlProps) {
  const queryClient = useQueryClient();
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  const handleRefresh = async () => {
    setIsManualRefresh(true);
    // Invalidate all queries to force refresh
    await queryClient.invalidateQueries();
    
    // Reset manual refresh state after a delay
    setTimeout(() => setIsManualRefresh(false), 1000);
  };

  const formatLastUpdated = (date?: Date) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Connection Status */}
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
        {isLoading || isManualRefresh ? (
          <WifiOff className="h-3.5 w-3.5 text-orange-400" />
        ) : (
          <Wifi className="h-3.5 w-3.5 text-green-400" />
        )}
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">
          {isLoading || isManualRefresh ? 'Updating' : 'Live'}
        </span>
      </div>

      {/* Last Updated */}
      <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
        <Clock className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-[10px] text-gray-400">
          {formatLastUpdated(lastUpdated)}
        </span>
      </div>

      {/* Manual Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={isLoading || isManualRefresh}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#317CFF]/10 border border-[#317CFF]/20 hover:bg-[#317CFF]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        title="Refresh all data"
      >
        <RefreshCw 
          className={`h-3.5 w-3.5 text-[#317CFF] transition-transform duration-300 ${
            (isLoading || isManualRefresh) ? 'animate-spin' : ''
          }`} 
        />
        <span className="text-xs font-medium text-[#317CFF] hidden sm:block">
          Refresh
        </span>
      </button>
    </div>
  );
}