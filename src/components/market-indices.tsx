import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MarketIndex = {
  name: string;
  value: number;
  change: string;
  percentChange: string;
  fiveDaysReturn: string;
  oneMonthReturn: string;
  threeMonthReturn: string;
  sixMonthReturn: string;
  ytdReturn: string;
  yearReturn: string;
  threeYearReturn: string;
  fiveYearReturn: string;
  tenYearReturn: string;
  maxReturn: string;
};

async function getMarketIndices() {
  try {
    const response = await fetch(
      "https://finance-query.onrender.com/v1/indices?region=US",
      {
        next: { revalidate: 900  },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch market indices");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching market indices:", error);
    return [];
  }
}

export default async function MarketIndices() {
  const indices = await getMarketIndices();

  return (
    <Card>
      <CardHeader>
        <CardTitle>US Market Indices</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {indices.map((index: MarketIndex, i: number) => {
            const isPositive = !index.change.startsWith("-");
            return (
              <div
                key={index.name}
                className={`p-4 ${
                  i % 2 === 0 ? "bg-gray-50" : "bg-white"
                } border-b last:border-b-0 md:border-r md:last:border-r-0`}
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium text-blue-800">{index.name}</div>
                  <div className="text-right">
                    <div className="font-bold">
                      {index.value.toLocaleString()}
                    </div>
                    <div
                      className={`flex items-center gap-1 ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>
                        {index.change} ({index.percentChange})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>1M:</span>
                    <span
                      className={
                        index.oneMonthReturn.startsWith("-")
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {index.oneMonthReturn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>YTD:</span>
                    <span
                      className={
                        index.ytdReturn.startsWith("-")
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {index.ytdReturn}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
