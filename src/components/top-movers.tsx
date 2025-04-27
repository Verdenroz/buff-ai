"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

// Add proper type definitions for stock data

type StockData = {
  symbol: string
  name: string
  price: string
  change: string
  percentChange: string
}

const topGainers: StockData[] = [
  {
    symbol: "SXT",
    name: "Sensient Technologies Corporation",
    price: "90.39",
    change: "+10.85",
    percentChange: "+13.64%",
  },
  { symbol: "EHC", name: "Encompass Health Corporation", price: "113.37", change: "+11.96", percentChange: "+11.79%" },
  { symbol: "LBRD", name: "Liberty Broadband Corporation", price: "86.23", change: "+8.87", percentChange: "+11.47%" },
  { symbol: "CHTR", name: "Charter Communications, Inc.", price: "373.65", change: "+38.32", percentChange: "+11.43%" },
  { symbol: "LBRDA", name: "Liberty Broadband Corporation", price: "85.00", change: "+8.56", percentChange: "+11.19%" },
]

const topLosers: StockData[] = [
  { symbol: "SMMT", name: "Summit Therapeutics Inc.", price: "23.47", change: "-9.24", percentChange: "-28.06%" },
  { symbol: "SAIA", name: "Saia, Inc.", price: "245.63", change: "-108.59", percentChange: "-30.66%" },
  { symbol: "APPF", name: "AppFolio, Inc.", price: "192.02", change: "-42.63", percentChange: "-18.17%" },
]

export default function TopMovers() {
  return (
    <div className="border rounded-md bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-green-500 to-green-600 text-white">
        <h2 className="text-lg font-medium flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Top Gainers
        </h2>
      </div>

      <div className="p-4">
        {topGainers.map((stock, index) => (
          <div key={index} className="py-2 border-b last:border-0 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-purple-600">{stock.symbol}</div>
                <div className="text-xs text-gray-500 truncate max-w-[180px]">{stock.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div>{stock.price}</div>
                  <div className="text-xs text-green-600">
                    {stock.change} ({stock.percentChange})
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-b bg-gradient-to-r from-red-500 to-red-600 text-white">
        <h2 className="text-lg font-medium flex items-center">
          <TrendingDown className="mr-2 h-5 w-5" />
          Top Losers
        </h2>
      </div>

      <div className="p-4">
        {topLosers.map((stock, index) => (
          <div key={index} className="py-2 border-b last:border-0 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-purple-600">{stock.symbol}</div>
                <div className="text-xs text-gray-500 truncate max-w-[180px]">{stock.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div>{stock.price}</div>
                  <div className="text-xs text-red-600">
                    {stock.change} ({stock.percentChange})
                  </div>
                </div>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
