"use client";
import { Suspense, useCallback, useEffect, useState } from "react";
import PriceChart from "@/components/price-chart";
import QuoteFundamentals from "@/components/quote-fundamentals";
import StockIndicatorsDisplay from "@/components/indicators-display";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import QuoteHeadline from "@/components/quote-headline";
import QuoteSentiment from "@/components/quote-sentiment";
import BuffChat from "@/components/buff-chat";

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

export default function QuotePage() {
  const { ticker } = useParams<{ ticker: string }>();
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchQuoteData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://finance-query.onrender.com/v1/quotes?symbols=${ticker}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        setQuoteData(data[0]);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError("No data available for this ticker");
      }
    } catch (err) {
      setError(
        `Error fetching quote data: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchQuoteData();

    // Set up polling every 15 seconds
    const intervalId = setInterval(fetchQuoteData, 15000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchQuoteData, ticker]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Quote Headline */}
      <div className="mb-4">
        {loading && !quoteData ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <QuoteHeadline quoteData={quoteData} />
        )}
      </div>

      {/* Price Chart */}
      <div className="mb-8">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <PriceChart ticker={ticker} />
        </Suspense>
      </div>

      {/* Quote Fundamentals */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quote Fundamentals</h2>
        <QuoteFundamentals
          quoteData={quoteData}
          lastUpdated={lastUpdated}
          error={error}
          loading={loading}
        />
      </div>

      {/* Technical Indicators */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Technical Indicators</h2>
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <StockIndicatorsDisplay ticker={ticker} />
        </Suspense>
      </div>

      {/* Sentiment Analysis */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Market Sentiment</h2>
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <QuoteSentiment ticker={ticker} />
        </Suspense>
      </div>

      <div className="mb-8">
        <BuffChat ticker={ticker} />
      </div>
    </div>
  );
}
