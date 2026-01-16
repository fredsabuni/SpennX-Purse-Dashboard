'use client';

import { Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-20 items-center justify-between px-4 md:px-8 border-b border-[#1F1F1F] bg-[#010101]/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[#1F1F1F] text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Search transactions..."
            className="h-10 w-48 lg:w-64 rounded-full bg-[#0A0A0A] border border-[#1F1F1F] pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#317CFF] focus:ring-1 focus:ring-[#317CFF] transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative rounded-full p-2 text-gray-400 hover:bg-[#1F1F1F] hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#4CCDF6] shadow-[0_0_8px_#4CCDF6]" />
        </button>
      </div>
    </header>
  );
}
