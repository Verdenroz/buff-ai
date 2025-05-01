"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type MoversData = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  percentChange: string;
};

type MarketMoversData = {
  gainers: MoversData[];
  losers: MoversData[];
  actives: MoversData[];
};

export default function MarketMovers() {
  const [data, setData] = useState<MarketMoversData>({
    gainers: [],
    losers: [],
    actives: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketMovers = async () => {
      try {
        setIsLoading(true);
        
        const [gainersRes, losersRes, activesRes] = await Promise.all([
          fetch("https://finance-query.onrender.com/v1/gainers?count=25"),
          fetch("https://finance-query.onrender.com/v1/losers?count=25"),
          fetch("https://finance-query.onrender.com/v1/actives?count=25"),
        ]);

        if (!gainersRes.ok || !losersRes.ok || !activesRes.ok) {
          throw new Error("Failed to fetch market movers");
        }

        const [gainers, losers, actives] = await Promise.all([
          gainersRes.json(),
          losersRes.json(),
          activesRes.json(),
        ]);

        setData({ gainers, losers, actives });
        setError(null);
      } catch (error) {
        console.error("Error fetching market movers:", error);
        setError("Failed to load market data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketMovers();

  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  const intervalId = setInterval(fetchMarketMovers, FIFTEEN_MINUTES);

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader className="text-destructive">
          {error}
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-0 border-b">
        <Tabs defaultValue="gainers" className="w-full">
          <TabsList className="w-full rounded-none bg-white dark:bg-gray-950 border-b">
            <TabsTrigger
              value="gainers"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-finance-green data-[state=active]:shadow-none transition-all duration-200 flex items-center rounded-none"
            >
              <TrendingUp className="h-4 w-4 mr-2 text-finance-green" />
              Top Gainers
            </TabsTrigger>
            <TabsTrigger
              value="losers"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-finance-red data-[state=active]:shadow-none transition-all duration-200 flex items-center rounded-none"
            >
              <TrendingDown className="h-4 w-4 mr-2 text-finance-red" />
              Top Losers
            </TabsTrigger>
            <TabsTrigger
              value="actives"
              className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-finance-gold data-[state=active]:shadow-none transition-all duration-200 flex items-center rounded-none"
            >
              <BarChart3 className="h-4 w-4 mr-2 text-finance-gold" />
              Most Active
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gainers" className="m-0 p-0">
            {isLoading ? (
              <MoversLoading />
            ) : (
              <Movers movers={data.gainers} type="gainers" />
            )}
          </TabsContent>

          <TabsContent value="losers" className="m-0 p-0">
            {isLoading ? (
              <MoversLoading />
            ) : (
              <Movers movers={data.losers} type="losers" />
            )}
          </TabsContent>

          <TabsContent value="actives" className="m-0 p-0">
            {isLoading ? (
              <MoversLoading />
            ) : (
              <Movers movers={data.actives} type="actives" />
            )}
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}

function Movers({
  movers,
}: {
  movers: MoversData[];
  type: "gainers" | "losers" | "actives";
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
      {movers.slice(0, 9).map((mover, i) => {
        const isPositive = !mover.change.startsWith("-");
        return (
          <Link
            href={`/quote/${mover.symbol}`}
            key={mover.symbol}
            className={`block p-4 ${
              i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-950"
            } border-b last:border-b-0 md:border-r md:last:border-r-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-blue-800 dark:text-blue-400">{mover.symbol}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                  {mover.name}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-bold">{mover.price}</div>
                  <div
                    className={`text-xs flex items-center ${
                      isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {mover.change} ({mover.percentChange})
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// Loading skeleton for the movers
function MoversLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
      {Array(9).fill(0).map((_, i) => (
        <div
          key={i}
          className={`p-4 ${
            i % 2 === 0 ? "bg-gray-50 dark:bg-gray-900" : "bg-white dark:bg-gray-950"
          } border-b last:border-b-0 md:border-r md:last:border-r-0`}
        >
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-5 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div>
              <Skeleton className="h-5 w-12 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
