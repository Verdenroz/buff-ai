"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

interface QuoteData {
  // Common fields for all securities
  symbol: string;
  name: string;
  price: string;
  preMarketPrice?: string;
  afterHoursPrice?: string;
  change: string;
  percentChange: string;
  open: string;
  high: string;
  low: string;
  yearHigh: string;
  yearLow: string;
  volume: number;
  avgVolume: number;
  
  // Stock-specific fields
  marketCap?: string;
  beta?: number;
  pe?: string;
  eps?: string;
  dividend?: string;
  yield?: string;
  exDividend?: string;
  earningsDate?: string;
  sector?: string;
  industry?: string;
  employees?: string;
  
  // ETF-specific fields
  netAssets?: string;
  nav?: string;
  category?: string;
  
  // Common for both
  about?: string;
  
  // Performance metrics
  fiveDaysReturn?: string;
  oneMonthReturn?: string;
  threeMonthReturn?: string;
  sixMonthReturn?: string;
  ytdReturn?: string;
  yearReturn?: string;
  threeYearReturn?: string;
  fiveYearReturn?: string;
  tenYearReturn?: string;
  maxReturn?: string;
  
  logo?: string;
  
  // Allow for additional fields we might not know about
  [key: string]: unknown;
}

interface StockQuoteDisplayProps {
  quoteData: QuoteData | null;
  lastUpdated: Date | null;
  error: string | null;
  loading: boolean;
}

export default function QuoteFundamentals({ quoteData, lastUpdated, error, loading }: StockQuoteDisplayProps) {
  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (loading && !quoteData) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  // Determine if this is an ETF based on fields present
  const isEtf = quoteData?.netAssets || quoteData?.nav || quoteData?.category;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <RefreshCw className="w-4 h-4" />
        <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Open</div>
                <div className="font-medium">${quoteData?.open}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">High</div>
                <div className="font-medium">${quoteData?.high}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Low</div>
                <div className="font-medium">${quoteData?.low}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Volume</div>
                <div className="font-medium">
                  {quoteData?.volume?.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Avg Volume</div>
                <div className="font-medium">
                  {quoteData?.avgVolume?.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            {quoteData?.marketCap && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Market Cap</div>
                  <div className="font-medium">{quoteData?.marketCap}</div>
                </CardContent>
              </Card>
            )}
            {quoteData?.netAssets && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Net Assets</div>
                  <div className="font-medium">{quoteData?.netAssets}</div>
                </CardContent>
              </Card>
            )}
            {quoteData?.nav && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">NAV</div>
                  <div className="font-medium">${quoteData?.nav}</div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Show company info for stocks, category info for ETFs */}
            <div>
              {isEtf ? (
                <>
                  <h4 className="font-semibold mb-2">ETF Info</h4>
                  <div className="space-y-2">
                    {quoteData?.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category</span>
                        <span>{quoteData?.category}</span>
                      </div>
                    )}
                    {quoteData?.netAssets && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Net Assets</span>
                        <span>{quoteData?.netAssets}</span>
                      </div>
                    )}
                    {quoteData?.nav && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">NAV</span>
                        <span>${quoteData?.nav}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h4 className="font-semibold mb-2">Company Info</h4>
                  <div className="space-y-2">
                    {quoteData?.sector && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sector</span>
                        <span>{quoteData?.sector}</span>
                      </div>
                    )}
                    {quoteData?.industry && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry</span>
                        <span>{quoteData?.industry}</span>
                      </div>
                    )}
                    {quoteData?.employees && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employees</span>
                        <span>{quoteData?.employees}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Fundamentals</h4>
              <div className="space-y-2">
                {quoteData?.pe && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">P/E Ratio</span>
                    <span>{quoteData?.pe}</span>
                  </div>
                )}
                {quoteData?.eps && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">EPS</span>
                    <span>${quoteData?.eps}</span>
                  </div>
                )}
                {quoteData?.beta && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beta</span>
                    <span>{quoteData?.beta}</span>
                  </div>
                )}
                {quoteData?.dividend && quoteData?.yield && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dividend</span>
                    <span>
                      ${quoteData?.dividend} ({quoteData?.yield})
                    </span>
                  </div>
                )}
                {quoteData?.exDividend && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Ex-Dividend Date
                    </span>
                    <span>{quoteData?.exDividend}</span>
                  </div>
                )}
                {quoteData?.earningsDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Earnings Date</span>
                    <span>{quoteData?.earningsDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {quoteData?.about && (
            <div className="mt-6">
              <h4 className="font-semibold mb-2">About</h4>
              <p className="text-muted-foreground">{quoteData.about}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quoteData?.fiveDaysReturn && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">5 Days Return</div>
                  <div
                    className={`font-medium ${
                      quoteData.fiveDaysReturn.includes("-") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {quoteData.fiveDaysReturn}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {quoteData?.oneMonthReturn && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">1 Month Return</div>
                  <div
                    className={`font-medium ${
                      quoteData.oneMonthReturn.includes("-") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {quoteData.oneMonthReturn}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {quoteData?.threeMonthReturn && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">3 Month Return</div>
                  <div
                    className={`font-medium ${
                      quoteData.threeMonthReturn.includes("-") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {quoteData.threeMonthReturn}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {quoteData?.sixMonthReturn && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">6 Month Return</div>
                  <div
                    className={`font-medium ${
                      quoteData.sixMonthReturn.includes("-") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {quoteData.sixMonthReturn}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {quoteData?.ytdReturn && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">YTD Return</div>
                  <div
                    className={`font-medium ${
                      quoteData.ytdReturn.includes("-") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {quoteData.ytdReturn}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {quoteData?.yearReturn && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">1 Year Return</div>
                  <div
                    className={`font-medium ${
                      quoteData.yearReturn.includes("-") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {quoteData.yearReturn}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {quoteData?.threeYearReturn && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">3 Year Return</div>
                  <div
                    className={`font-medium ${
                      quoteData.threeYearReturn.includes("-") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {quoteData.threeYearReturn}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {quoteData?.fiveYearReturn && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">5 Year Return</div>
                  <div
                    className={`font-medium ${
                      quoteData.fiveYearReturn.includes("-") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {quoteData.fiveYearReturn}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {quoteData?.tenYearReturn && (
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">10 Year Return</div>
                  <div
                    className={`font-medium ${
                      quoteData.tenYearReturn.includes("-") ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {quoteData.tenYearReturn}
                  </div>
                </CardContent>
              </Card>
            )}
            
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}