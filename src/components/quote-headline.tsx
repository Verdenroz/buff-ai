"use client";

import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import Image from "next/image";

interface QuoteHeadlineProps {
  quoteData: {
    symbol: string;
    name: string;
    price: string;
    change: string;
    percentChange: string;
    logo?: string;
  } | null;
}

export default function QuoteHeadline({ quoteData }: QuoteHeadlineProps) {
  if (!quoteData) return null;

  const isPositiveChange = quoteData.change && !quoteData.change.startsWith("-");

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        {quoteData.logo && (
          <Image
            src={quoteData.logo || "/placeholder.svg"}
            alt={`${quoteData.name} logo`}
            className="w-10 h-10 rounded"
            width={40}
            height={40}
          />
        )}
        <div>
          <h3 className="text-3xl font-bold">{quoteData.name}</h3>
          <p className="text-muted-foreground">{quoteData.symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold">${quoteData.price}</div>
        <div
          className={`flex items-center gap-1 ${
            isPositiveChange ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositiveChange ? (
            <ArrowUpIcon className="w-4 h-4" />
          ) : (
            <ArrowDownIcon className="w-4 h-4" />
          )}
          <span>{quoteData.change}</span>
          <span>({quoteData.percentChange})</span>
        </div>
      </div>
    </div>
  );
}