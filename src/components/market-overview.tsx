"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react"

// Add proper type definitions for market data

type MarketItem = {
  name: string
  value: string
  change: string
  percentChange: string
  trend: "up" | "down"
}

type MarketData = {
  US: MarketItem[]
  Europe: MarketItem[]
  Asia: MarketItem[]
}

type RegionType = "US" | "Europe" | "Asia" | "Rates"

const marketData: MarketData = {
  US: [
    { name: "S&P 500", value: "5,525.21", change: "+40.44", percentChange: "+0.74%", trend: "up" },
    { name: "Dow 30", value: "40,113.50", change: "+20.10", percentChange: "+0.05%", trend: "up" },
    { name: "Nasdaq", value: "17,382.94", change: "+216.90", percentChange: "+1.30%", trend: "up" },
    { name: "Russell 2000", value: "1,957.62", change: "+0.03", percentChange: "+0.00%", trend: "up" },
    { name: "VIX", value: "24.84", change: "-1.62", percentChange: "-6.16%", trend: "down" },
    { name: "Gold", value: "3,320.20", change: "-18.40", percentChange: "-0.55%", trend: "down" },
  ],
  Europe: [
    { name: "FTSE 100", value: "8,147.03", change: "+23.35", percentChange: "+0.29%", trend: "up" },
    { name: "DAX", value: "18,161.01", change: "+124.37", percentChange: "+0.69%", trend: "up" },
    { name: "CAC 40", value: "7,498.87", change: "+9.56", percentChange: "+0.13%", trend: "up" },
  ],
  Asia: [
    { name: "Nikkei 225", value: "37,934.76", change: "-260.36", percentChange: "-0.68%", trend: "down" },
    { name: "Hang Seng", value: "17,651.15", change: "+169.77", percentChange: "+0.97%", trend: "up" },
    { name: "Shanghai", value: "3,088.87", change: "-14.31", percentChange: "-0.46%", trend: "down" },
  ],
}

export default function MarketOverview() {
  const [region, setRegion] = useState<RegionType>("US")

  return (
    <div className="border rounded-md bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-300 animate-pulse"></span>
          <span className="text-sm font-medium">U.S. markets closed</span>
        </div>
        <div className="flex">
          <button className="p-1 text-white/70 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="p-1 text-white/70 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Tabs defaultValue="US" value={region} onValueChange={setRegion}>
        <div className="px-4 pt-2">
          <TabsList className="grid grid-cols-4 h-9">
            <TabsTrigger value="US" className="text-xs">
              US
            </TabsTrigger>
            <TabsTrigger value="Europe" className="text-xs">
              Europe
            </TabsTrigger>
            <TabsTrigger value="Asia" className="text-xs">
              Asia
            </TabsTrigger>
            <TabsTrigger value="Rates" className="text-xs">
              Rates
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="US" className="p-0 m-0">
          <div className="p-4">
            {marketData.US.map((item, index) => (
              <div key={index} className="py-2 border-b last:border-0 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-purple-600">{item.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div>{item.value}</div>
                      <div className={`text-xs ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {item.change} ({item.percentChange})
                      </div>
                    </div>
                    {item.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="Europe" className="p-0 m-0">
          <div className="p-4">
            {marketData.Europe.map((item, index) => (
              <div key={index} className="py-2 border-b last:border-0">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{item.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div>{item.value}</div>
                      <div className={`text-xs ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {item.change} ({item.percentChange})
                      </div>
                    </div>
                    {item.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="Asia" className="p-0 m-0">
          <div className="p-4">
            {marketData.Asia.map((item, index) => (
              <div key={index} className="py-2 border-b last:border-0">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{item.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div>{item.value}</div>
                      <div className={`text-xs ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        {item.change} ({item.percentChange})
                      </div>
                    </div>
                    {item.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="Rates" className="p-0 m-0">
          <div className="p-4 text-center text-sm text-gray-500">Rate data not available</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
