"use client"

import { JSX, useCallback, useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, ExternalLink, ThumbsUp, ThumbsDown, Minus } from "lucide-react"
import Link from "next/link"

interface KeyPoint {
  point: string
  url: string
}

interface SentimentData {
  sentiment_score: number
  key_points: KeyPoint[]
}

interface SentimentInfo {
  category: string
  color: string
  icon: JSX.Element | null
  bgColor: string
}

export default function QuoteSentiment({ ticker }: { ticker: string }) {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchSentimentData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/sentiment?ticker=${encodeURIComponent(ticker)}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch sentiment data: ${response.status}`)
      }

      const data = await response.json()
      setSentimentData(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(`Error fetching sentiment data: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }, [ticker])

  useEffect(() => {
    fetchSentimentData()

    // Set up polling every 15 seconds
    const intervalId = setInterval(fetchSentimentData, 15000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [fetchSentimentData, ticker])

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (loading && !sentimentData) {
    return <Skeleton className="h-[400px] w-full" />
  }

  // Determine sentiment category and color
  const getSentimentInfo = (score: number): SentimentInfo => {
    if (score < 0.4) {
      return {
        category: "Bearish",
        color: "text-red-500",
        icon: <ThumbsDown className="w-5 h-5" />,
        bgColor: "bg-red-500",
      }
    } else if (score > 0.6) {
      return {
        category: "Bullish",
        color: "text-green-500",
        icon: <ThumbsUp className="w-5 h-5" />,
        bgColor: "bg-green-500",
      }
    } else {
      return {
        category: "Neutral",
        color: "text-yellow-500",
        icon: <Minus className="w-5 h-5" />,
        bgColor: "bg-yellow-500",
      }
    }
  }

  // Make sure sentimentInfo always has a value when sentimentData exists
  const sentimentInfo: SentimentInfo = sentimentData 
    ? getSentimentInfo(sentimentData.sentiment_score)
    : {
        category: "Unknown",
        color: "text-gray-500",
        icon: null,
        bgColor: "bg-gray-500",
      };

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <RefreshCw className="w-4 h-4" />
        <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
      </div>

      {sentimentData && (
        <>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Market Sentiment</h3>
              <div className={`flex items-center gap-2 ${sentimentInfo.color}`}>
                {sentimentInfo.icon}
                <span className="font-bold">{sentimentInfo.category}</span>
              </div>
            </div>

            {/* Sentiment Meter */}
            <div className="relative h-6 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className={`absolute top-0 left-0 h-full ${sentimentInfo.bgColor} transition-all duration-500 ease-in-out`}
                style={{ width: `${sentimentData.sentiment_score * 100}%` }}
              ></div>
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-3">
                <span className="text-xs font-medium text-white z-10">Bearish</span>
                <span className="text-xs font-medium text-white z-10">Neutral</span>
                <span className="text-xs font-medium text-white z-10">Bullish</span>
              </div>
              {/* Marker for 0.5 (neutral) */}
              <div className="absolute top-0 left-1/2 w-px h-full bg-white/50 transform -translate-x-1/2"></div>
            </div>
            <div className="text-center text-sm font-medium mt-1">
              Sentiment Score: {sentimentData.sentiment_score.toFixed(2)}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Key Market Insights</h3>
            <div className="space-y-4">
              {sentimentData.key_points.map((point, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <p className="text-sm mb-2">{point.point}</p>
                    <Link
                      href={point.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 hover:underline"
                    >
                      Read more <ExternalLink className="w-3 h-3" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}