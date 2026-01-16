import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
      
      {/* Row 1: High Level Pulse Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 space-y-4">
             <div className="flex justify-between">
                 <Skeleton className="h-4 w-24" />
                 <Skeleton className="h-8 w-8 rounded-full" />
             </div>
             <Skeleton className="h-8 w-32" />
             <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>

      {/* Row 2: Charts & Income Pulse */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
             <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 h-[400px]">
                <div className="flex justify-between mb-6">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-[300px] w-full" />
             </div>
        </div>
        <div>
             <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6 h-full space-y-6">
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                     <Skeleton className="h-20 w-full rounded-xl" />
                     <Skeleton className="h-20 w-full rounded-xl" />
                     <Skeleton className="h-20 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                </div>
             </div>
        </div>
      </div>

      {/* Row 3: Detail Period Breakdown */}
      <div className="rounded-2xl border border-[#1F1F1F] bg-[#0A0A0A] p-6">
           <Skeleton className="h-6 w-48 mb-6" />
           <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                  </div>
              ))}
           </div>
      </div>
    </div>
  )
}
