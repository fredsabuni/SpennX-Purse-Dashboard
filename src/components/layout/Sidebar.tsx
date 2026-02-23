'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Settings, 
  PieChart, 
  CreditCard,
  Users,
  Bell,
  Coins,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Fee Checker', href: '/fees', icon: Coins },
  // { name: 'Analytics', href: '/analytics', icon: PieChart },
  // { name: 'Cards', href: '/cards', icon: CreditCard },
  // { name: 'Recipients', href: '/recipients', icon: Users },
  // { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-[#010101] border-r border-[#1F1F1F] transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="flex h-20 items-center justify-between px-6">
        <div className="relative h-10 w-32">
          <Image 
            src="/logo.png" 
            alt="SpennX Logo" 
            fill
            className="object-contain object-left"
            priority
          />
        </div>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-[#1F1F1F] text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-[#317CFF]/10 text-[#317CFF]" 
                  : "text-gray-400 hover:bg-[#1F1F1F] hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-[#317CFF]" : "text-gray-500")} />
              {item.name}
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-[#317CFF] shadow-[0_0_8px_#317CFF]" />
              )}
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-[#1F1F1F]">
        <div className="rounded-xl bg-gradient-to-br from-[#1F1F1F] to-black p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#317CFF] flex items-center justify-center text-white font-bold">
              JD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">SpennX</span>
              <span className="text-xs text-gray-500">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
