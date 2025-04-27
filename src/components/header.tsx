"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

type SearchResult = {
  name: string;
  symbol: string;
  exchange: string;
  type: string;
};

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // when menu opens, focus the input
  useEffect(() => {
    if (open) {
      // clear previous query/results if you like:
      // setSearchQuery("");
      // setSearchResults([]);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery.trim());
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function performSearch(query: string) {
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://finance-query.onrender.com/v1/search?query=${encodeURIComponent(
          query
        )}&hits=5`
      );
      if (res.ok) {
        setSearchResults(await res.json());
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelect(symbol: string) {
    setOpen(false);
    router.push(`/quote/${symbol}`);
  }

  return (
    <>
      <header className="border-b py-3 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold text-white flex items-center"
            >
              <span className="mr-1">🐃</span> BuffAI
              <span className="text-amber-400">Finance</span>
            </Link>

            <div className="flex items-center gap-3">
              {/* Search DropdownMenu */}
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20 hover:text-white"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-80 p-2">
                  {/* search input */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type symbol or name…"
                    className="w-full px-3 py-2 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* loading, empty, or results */}
                  {isLoading ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Searching…
                    </div>
                  ) : searchQuery && searchResults.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No results found
                    </div>
                  ) : (
                    searchResults.map((r) => (
                      <DropdownMenuItem
                        key={r.symbol}
                        onSelect={() => handleSelect(r.symbol)}
                        className="flex justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        <span className="font-medium">{r.symbol}</span>
                        <span className="text-xs text-gray-500">
                          {r.exchange}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/chat">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 hover:text-white"
                >
                  BuffAI Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
