"use client"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, AlertCircle } from "lucide-react"

// Add proper type definitions for sentiment data

type SentimentScore = {
  buy: number
  neutral: number
  sell: number
}

type TechnicalIndicator = {
  name: string
  value: string
  signal: "buy" | "neutral" | "sell"
}

type NewsArticle = {
  title: string
  source: string
  date: string
  sentiment: "positive" | "negative" | "neutral"
  summary: string
}

type SentimentData = {
  overall: "strong_buy" | "buy" | "neutral" | "sell" | "strong_sell"
  score: number
  summary: {
    oscillators: SentimentScore
    movingAverages: SentimentScore
    total: SentimentScore
  }
  technicals: TechnicalIndicator[]
  articles: NewsArticle[]
}

// Mock data - replace with actual API call
const sentimentData: SentimentData = {
  overall: "strong_buy", // strong_buy, buy, neutral, sell, strong_sell
  score: 8, // 0-10
  summary: {
    oscillators: { buy: 3, neutral: 6, sell: 2 },
    movingAverages: { buy: 12, neutral: 1, sell: 0 },
    total: { buy: 15, neutral: 7, sell: 2 },
  },
  technicals: [
    { name: "RSI (14)", value: "64.25", signal: "neutral" },
    { name: "MACD (12, 26)", value: "12.85", signal: "buy" },
    { name: "Stochastic (14, 3, 3)", value: "82.45", signal: "sell" },
    { name: "CCI (20)", value: "156.89", signal: "buy" },
    { name: "ATR (14)", value: "3.25", signal: "neutral" },
    { name: "Highs/Lows (14)", value: "0.45", signal: "neutral" },
    { name: "Ultimate Oscillator", value: "68.12", signal: "buy" },
    { name: "ROC", value: "12.45", signal: "buy" },
    { name: "Bull/Bear Power", value: "15.36", signal: "buy" },
  ],
  articles: [
    {
      title: "Apple's AI Strategy Could Boost Stock Price",
      source: "Financial Times",
      date: "2023-04-15",
      sentiment: "positive",
      summary: "Apple's upcoming AI features could drive significant growth in services revenue and boost stock price.",
    },
    {
      title: "Supply Chain Issues May Impact iPhone Production",
      source: "Bloomberg",
      date: "2023-04-12",
      sentiment: "negative",
      summary: "Ongoing supply chain constraints in Asia could impact iPhone production targets for Q3.",
    },
  ],
}

export default function SentimentAnalysis() {
  const getSentimentColor = (sentiment: SentimentData["overall"]): string => {
    switch (sentiment) {
      case "strong_buy":
        return "bg-green-600"
      case "buy":
        return "bg-green-500"
      case "neutral":
        return "bg-gray-500"
      case "sell":
        return "bg-red-500"
      case "strong_sell":
        return "bg-red-600"
      default:
        return "bg-gray-500"
    }
  }

  const getSentimentText = (sentiment: SentimentData["overall"]): string => {
    switch (sentiment) {
      case "strong_buy":
        return "STRONG BUY"
      case "buy":
        return "BUY"
      case "neutral":
        return "NEUTRAL"
      case "sell":
        return "SELL"
      case "strong_sell":
        return "STRONG SELL"
      default:
        return "NEUTRAL"
    }
  }

  const getSignalColor = (signal: TechnicalIndicator["signal"]): string => {
    switch (signal) {
      case "buy":
        return "text-green-500"
      case "neutral":
        return "text-gray-500"
      case "sell":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getSignalIcon = (signal: TechnicalIndicator["signal"]) => {
    switch (signal) {
      case "buy":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "neutral":
        return <Minus className="h-4 w-4 text-gray-500" />
      case "sell":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="border rounded-md bg-white shadow-sm">
      <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-t-md">
        <h2 className="text-xl font-semibold flex items-center">
          <AlertCircle className="mr-2 h-5 w-5" />
          BuffAI Technical Analysis
        </h2>
      </div>

      <div className="p-4">
        {/* Overall Sentiment */}
        <div className="flex flex-col items-center justify-center mb-6 p-6 bg-gray-50 rounded-md border">
          <div
            className={`text-white font-bold py-2 px-6 rounded-full mb-4 ${getSentimentColor(sentimentData.overall)}`}
          >
            {getSentimentText(sentimentData.overall)}
          </div>

          <div className="w-full max-w-md h-8 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div className="flex h-full">
              <div
                className="bg-green-500 h-full flex items-center justify-center text-xs text-white font-bold"
                style={{
                  width: `${(sentimentData.summary.total.buy / (sentimentData.summary.total.buy + sentimentData.summary.total.neutral + sentimentData.summary.total.sell)) * 100}%`,
                }}
              >
                {sentimentData.summary.total.buy}
              </div>
              <div
                className="bg-gray-400 h-full flex items-center justify-center text-xs text-white font-bold"
                style={{
                  width: `${(sentimentData.summary.total.neutral / (sentimentData.summary.total.buy + sentimentData.summary.total.neutral + sentimentData.summary.total.sell)) * 100}%`,
                }}
              >
                {sentimentData.summary.total.neutral}
              </div>
              <div
                className="bg-red-500 h-full flex items-center justify-center text-xs text-white font-bold"
                style={{
                  width: `${(sentimentData.summary.total.sell / (sentimentData.summary.total.buy + sentimentData.summary.total.neutral + sentimentData.summary.total.sell)) * 100}%`,
                }}
              >
                {sentimentData.summary.total.sell}
              </div>
            </div>
          </div>

          <div className="flex justify-between w-full max-w-md text-sm">
            <div className="text-green-500 font-medium">Buy: {sentimentData.summary.total.buy}</div>
            <div className="text-gray-500 font-medium">Neutral: {sentimentData.summary.total.neutral}</div>
            <div className="text-red-500 font-medium">Sell: {sentimentData.summary.total.sell}</div>
          </div>
        </div>

        {/* Technical Indicators */}
        <h3 className="text-lg font-medium mb-4 text-purple-600">Technical Indicators</h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Value
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Signal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sentimentData.technicals.map((indicator, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{indicator.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{indicator.value}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className={`flex items-center ${getSignalColor(indicator.signal)}`}>
                      {getSignalIcon(indicator.signal)}
                      <span className="ml-2 font-medium">{indicator.signal.toUpperCase()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent News Articles */}
        <h3 className="text-lg font-medium mb-4 text-purple-600">Recent News Articles</h3>
        <div className="space-y-4">
          {sentimentData.articles.map((article, index) => (
            <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{article.title}</h4>
                <Badge
                  variant={
                    article.sentiment === "positive"
                      ? "default"
                      : article.sentiment === "negative"
                        ? "destructive"
                        : "outline"
                  }
                  className={
                    article.sentiment === "positive"
                      ? "bg-green-500 hover:bg-green-600"
                      : article.sentiment === "negative"
                        ? "bg-red-500 hover:bg-red-600"
                        : ""
                  }
                >
                  {article.sentiment}
                </Badge>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                {article.source} • {article.date}
              </div>
              <p className="text-sm text-gray-700">{article.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
