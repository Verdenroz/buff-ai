"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react"

interface IndicatorValue {
  [key: string]: number | string
}

interface Indicators {
  [key: string]: IndicatorValue
}

export default function StockIndicatorsDisplay({ ticker }: { ticker: string }) {
  const [indicators, setIndicators] = useState<Indicators | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchIndicators = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://finance-query.onrender.com/v1/indicators?symbol=${ticker}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch indicators: ${response.status}`)
      }

      const data = await response.json()
      if (data) {
        setIndicators(data)
        setLastUpdated(new Date())
        setError(null)
      } else {
        setError("No indicator data available for this ticker")
      }
    } catch (err) {
      setError(`Error fetching indicators: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIndicators()

    // Set up polling every 15 seconds
    const intervalId = setInterval(fetchIndicators, 15000)

    // Clean up interval on component unmount
    return () => clearInterval(intervalId)
  }, [ticker])

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  if (loading && !indicators) {
    return <Skeleton className="h-[400px] w-full" />
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <RefreshCw className="w-4 h-4" />
        <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
      </div>

      <Tabs defaultValue="moving-averages">
        <TabsList className="mb-4">
          <TabsTrigger value="moving-averages">Moving Averages</TabsTrigger>
          <TabsTrigger value="oscillators">Oscillators</TabsTrigger>
          <TabsTrigger value="other">Other Indicators</TabsTrigger>
        </TabsList>

        <TabsContent value="moving-averages">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Simple Moving Averages */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Simple Moving Averages</h4>
                <div className="space-y-2">
                  {indicators &&
                    Object.keys(indicators)
                      .filter((key) => key.startsWith("SMA"))
                      .map((key) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{indicators[key].SMA}</span>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>

            {/* Exponential Moving Averages */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Exponential Moving Averages</h4>
                <div className="space-y-2">
                  {indicators &&
                    Object.keys(indicators)
                      .filter((key) => key.startsWith("EMA"))
                      .map((key) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{indicators[key].EMA}</span>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>

            {/* Weighted Moving Averages */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Weighted Moving Averages</h4>
                <div className="space-y-2">
                  {indicators &&
                    Object.keys(indicators)
                      .filter((key) => key.startsWith("WMA"))
                      .map((key) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{indicators[key].WMA}</span>
                        </div>
                      ))}
                  {indicators &&
                    Object.keys(indicators)
                      .filter((key) => key.startsWith("VWMA"))
                      .map((key) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}</span>
                          <span className="font-medium">{indicators[key].VWMA}</span>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="oscillators">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* RSI */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">RSI</h4>
                {indicators && indicators["RSI(14)"] && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RSI(14)</span>
                      <span className="font-medium">{indicators["RSI(14)"].RSI}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          Number(indicators["RSI(14)"].RSI) > 70
                            ? "bg-red-500"
                            : Number(indicators["RSI(14)"].RSI) < 30
                              ? "bg-green-500"
                              : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(100, Number(indicators["RSI(14)"].RSI))}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Oversold</span>
                      <span>Neutral</span>
                      <span>Overbought</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stochastic */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Stochastic</h4>
                {indicators && indicators["STOCH %K(14,3,3)"] && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">%K</span>
                      <span className="font-medium">{indicators["STOCH %K(14,3,3)"]["%K"]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">%D</span>
                      <span className="font-medium">{indicators["STOCH %K(14,3,3)"]["%D"]}</span>
                    </div>
                  </div>
                )}
                {indicators && indicators["SRSI(3,3,14,14)"] && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-1">Stochastic RSI</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">%K</span>
                        <span className="font-medium">{indicators["SRSI(3,3,14,14)"]["%K"]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">%D</span>
                        <span className="font-medium">{indicators["SRSI(3,3,14,14)"]["%D"]}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MACD */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">MACD</h4>
                {indicators && indicators["MACD(12,26)"] && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MACD</span>
                      <span
                        className={`font-medium ${Number(indicators["MACD(12,26)"].MACD) >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {indicators["MACD(12,26)"].MACD}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Signal</span>
                      <span
                        className={`font-medium ${Number(indicators["MACD(12,26)"].Signal) >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {indicators["MACD(12,26)"].Signal}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Histogram</span>
                      <span
                        className={`font-medium ${
                          Number(indicators["MACD(12,26)"].MACD) - Number(indicators["MACD(12,26)"].Signal) >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {(Number(indicators["MACD(12,26)"].MACD) - Number(indicators["MACD(12,26)"].Signal)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="other">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Bollinger Bands */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Bollinger Bands</h4>
                {indicators && indicators["BBANDS(20,2)"] && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Upper Band</span>
                      <span className="font-medium">{indicators["BBANDS(20,2)"]["Upper Band"]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Middle Band</span>
                      <span className="font-medium">{indicators["BBANDS(20,2)"]["Middle Band"]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lower Band</span>
                      <span className="font-medium">{indicators["BBANDS(20,2)"]["Lower Band"]}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Super Trend */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Super Trend</h4>
                {indicators && indicators["Super Trend"] && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Value</span>
                      <span className="font-medium">{indicators["Super Trend"]["Super Trend"]}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Trend</span>
                      <div
                        className={`flex items-center gap-1 ${
                          indicators["Super Trend"]["Trend"] === "UP" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {indicators["Super Trend"]["Trend"] === "UP" ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-medium">{indicators["Super Trend"]["Trend"]}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Other Indicators */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-2">Other Indicators</h4>
                <div className="space-y-2">
                  {indicators && indicators["CCI(20)"] && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CCI(20)</span>
                      <span className="font-medium">{indicators["CCI(20)"].CCI}</span>
                    </div>
                  )}
                  {indicators && indicators["ADX(14)"] && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ADX(14)</span>
                      <span className="font-medium">{indicators["ADX(14)"].ADX}</span>
                    </div>
                  )}
                  {indicators && indicators["Aroon(25)"] && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aroon Up</span>
                        <span className="font-medium">{indicators["Aroon(25)"]["Aroon Up"]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aroon Down</span>
                        <span className="font-medium">{indicators["Aroon(25)"]["Aroon Down"]}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ichimoku Cloud */}
          {indicators && indicators["Ichimoku Cloud"] && (
            <div className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Ichimoku Cloud</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversion Line</span>
                        <span className="font-medium">{indicators["Ichimoku Cloud"]["Conversion Line"]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base Line</span>
                        <span className="font-medium">{indicators["Ichimoku Cloud"]["Base Line"]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lagging Span</span>
                        <span className="font-medium">{indicators["Ichimoku Cloud"]["Lagging Span"]}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Leading Span A</span>
                        <span className="font-medium">{indicators["Ichimoku Cloud"]["Leading Span A"]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Leading Span B</span>
                        <span className="font-medium">{indicators["Ichimoku Cloud"]["Leading Span B"]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cloud Status</span>
                        <span
                          className={`font-medium ${
                            Number(indicators["Ichimoku Cloud"]["Leading Span A"]) >
                            Number(indicators["Ichimoku Cloud"]["Leading Span B"])
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {Number(indicators["Ichimoku Cloud"]["Leading Span A"]) >
                          Number(indicators["Ichimoku Cloud"]["Leading Span B"])
                            ? "Bullish"
                            : "Bearish"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
