import { Suspense } from "react"
import MarketIndices from "@/components/market-indices"
import MarketNews from "@/components/market-news"
import MarketMovers from "@/components/market-movers"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 flex-1">
        <main className="space-y-6">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-md" />}>
            <MarketIndices />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-96 w-full rounded-md" />}>
            <MarketNews />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-96 w-full rounded-md" />}>
            <MarketMovers />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
