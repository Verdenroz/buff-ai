"use client"
import Image from "next/image"

// Add proper type definitions for company data

type CompanyFundamentals = {
  marketCap: string
  peRatio: string
  dividend: string
  eps: string
  volume: string
  avgVolume: string
  high52Week: string
  low52Week: string
}

type CompanyData = {
  name: string
  ticker: string
  logo: string
  summary: string
  fundamentals: CompanyFundamentals
}

// Mock data - replace with actual API call
const companyData: CompanyData = {
  name: "Apple Inc.",
  ticker: "AAPL",
  logo: "/placeholder.svg?height=80&width=80",
  summary:
    "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod.",
  fundamentals: {
    marketCap: "$2.8T",
    peRatio: "32.5",
    dividend: "0.58%",
    eps: "$6.14",
    volume: "58.2M",
    avgVolume: "62.1M",
    high52Week: "$198.23",
    low52Week: "$124.17",
  },
}

export default function CompanyInfo() {
  return (
    <div className="mb-8 border rounded-md bg-white shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-500 text-white">
        <h2 className="text-xl font-semibold">Company Information</h2>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-4 mb-6">
          <div className="relative h-16 w-16 rounded-md overflow-hidden border bg-white p-1">
            <Image
              src={companyData.logo || "/placeholder.svg"}
              alt={`${companyData.name} logo`}
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-600">{companyData.name}</h2>
            <p className="text-gray-500">{companyData.ticker}</p>
          </div>
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-md border">
          <h3 className="text-lg font-medium mb-2 text-purple-600">Business Summary</h3>
          <p className="text-gray-700">{companyData.summary}</p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2 text-purple-600">Key Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(companyData.fundamentals).map(([key, value]) => (
              <div key={key} className="p-3 bg-gray-50 rounded-md border hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-500">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </p>
                <p className="font-medium text-purple-600">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
