"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, MessageCircle, Volume2 } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// Enum to match the API's period options
enum Period {
  ONE_DAY = "1d",
  FIVE_DAY = "5d",
  ONE_MONTH = "1mo",
}

// Interface for stock data point
interface StockDataPoint {
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Volume: number;
  [key: string]: unknown;
}

// Interface for the stock data response
interface StockData {
  [timestamp: string]: StockDataPoint;
}

// Interface for a post/tweet
interface Post {
  author: string;
  content: string;
  date: number; // in seconds
  tts: string;
}

// Interface for a TTS audio response
interface TtsResponse {
  audio_file: string;
}

// Combined data point for chart rendering
interface ChartDataPoint {
  timestamp: number;
  price: number;
  volume: number;
  post?: Post;
  [key: string]: unknown;
}

export default function PriceChart({ ticker }: { ticker: string }) {
  const [period, setPeriod] = useState<Period>(Period.ONE_DAY);
  const [stockData, setStockData] = useState<ChartDataPoint[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Function to fetch stock data
  const fetchStockData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/price?ticker=${encodeURIComponent(ticker)}&period=${period}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stock data: ${response.status}`);
      }

      const data: StockData = await response.json();

      // Transform the data for the chart - assuming timestamps are in seconds
      const chartData: ChartDataPoint[] = Object.entries(data).map(
        ([timestamp, values]) => ({
          timestamp: Number.parseInt(timestamp),
          price: values.Close,
          volume: values.Volume,
          open: values.Open,
          high: values.High,
          low: values.Low,
        })
      );

      // Sort by timestamp
      chartData.sort((a, b) => a.timestamp - b.timestamp);

      setStockData(chartData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(
        `Error fetching stock data: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [ticker, period]);

  // Function to fetch posts/tweets
  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?author=trump`);

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const data: Post[] = await response.json();
      setPosts(data);
    } catch (err) {
      console.error(
        `Error fetching posts: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  };

  // Function to fetch TTS audio URL
  const fetchTtsAudio = async (ttsKey: string) => {
    try {
      setAudioLoading(true);
      const response = await fetch(
        `/api/tts?key=${encodeURIComponent(ttsKey)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch TTS audio: ${response.status}`);
      }

      const data: TtsResponse = await response.json();
      setAudioUrl(data.audio_file);
    } catch (err) {
      console.error(
        `Error fetching TTS audio: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      setAudioUrl(null);
    } finally {
      setAudioLoading(false);
    }
  };

  // Function to toggle audio playback
  const toggleAudio = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!selectedPost) return;

    if (!audioUrl) {
      // If we don't have the audio URL yet, fetch it
      await fetchTtsAudio(selectedPost.tts);
    } else {
      // If we have the audio, play/pause it
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
      }
    }
  };

  // Combine stock data and posts
  const combineData = () => {
    if (!stockData.length) return [];

    // Create a deep copy of stock data
    const combined = JSON.parse(JSON.stringify(stockData)) as ChartDataPoint[];

    // Add posts to the combined data
    posts.forEach((post) => {
      // Find the closest stock data point to this post's timestamp
      const closestPointIndex = findClosestDataPointIndex(combined, post.date);

      if (closestPointIndex !== -1) {
        // If we found a matching point, add the post to it
        combined[closestPointIndex] = {
          ...combined[closestPointIndex],
          post,
        };
      }
    });

    return combined;
  };

  // Helper function to find the closest data point to a given timestamp
  const findClosestDataPointIndex = (
    data: ChartDataPoint[],
    targetTimestamp: number
  ) => {
    if (!data.length) return -1;

    // Find the index of the data point with the closest timestamp
    let closestIndex = 0;
    let minDiff = Math.abs(data[0].timestamp - targetTimestamp);

    for (let i = 1; i < data.length; i++) {
      const diff = Math.abs(data[i].timestamp - targetTimestamp);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    // Only return the index if it's within a reasonable time difference (e.g., 24 hours)
    const MAX_TIME_DIFF = 24 * 60 * 60; // 24 hours in seconds
    return minDiff <= MAX_TIME_DIFF ? closestIndex : -1;
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    // Convert seconds to milliseconds for Date constructor
    const date = new Date(timestamp * 1000);

    switch (period) {
      case Period.ONE_DAY:
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      case Period.FIVE_DAY:
        return `${date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
        })} ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      case Period.ONE_MONTH:
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      default:
        return date.toLocaleString();
    }
  };

  // Renamed from CustomDot to PostIndicatorMarker for more specificity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const PostIndicatorMarker = (props: any) => {
    const { cx, cy, payload } = props;

    if (!payload || !payload.post) {
      // For regular price points, return null or a small dot
      return null;
    }

    return (
      <g
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPost(payload.post);
          setPopoverPosition({ top: cy, left: cx });
          setPopoverOpen(true);
          // Reset audio state when selecting a new post
          setAudioUrl(null);
          setIsPlaying(false);
        }}
      >
        <circle cx={cx} cy={cy} r={20} fill="#ff4500" />
        <MessageCircle x={cx - 8} y={cy - 8} size={16} color="white" />
      </g>
    );
  };

  // Effect to fetch data when ticker or period changes
  useEffect(() => {
    fetchStockData();
    fetchPosts();

    // Set up polling every 15 seconds
    const intervalId = setInterval(() => {
      fetchStockData();
      fetchPosts();
    }, 15000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [ticker, period, fetchStockData]);

  // Effect to close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking outside both the popover and not on a chart marker
      if (
        popoverRef.current && 
        !popoverRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('g.cursor-pointer')
      ) {
        setPopoverOpen(false);
        // Stop audio when closing popover
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    if (popoverOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [popoverOpen, isPlaying]);

  // Effect to manage audio playback state
  useEffect(() => {
    if (!audioRef.current) return;

    // Store a reference to the current audio element
    const audioElement = audioRef.current;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audioElement.addEventListener("play", handlePlay);
    audioElement.addEventListener("pause", handlePause);
    audioElement.addEventListener("ended", handleEnded);

    // Use the stored reference in the cleanup function
    return () => {
      audioElement.removeEventListener("play", handlePlay);
      audioElement.removeEventListener("pause", handlePause);
      audioElement.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  // Effect to automatically play audio when URL is loaded
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current
        .play()
        .catch((err) => console.error("Audio playback failed:", err));
    }
  }, [audioUrl]);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (loading && !stockData.length) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  const combinedData = combineData();

  // Calculate min and max values for the Y-axis domain with some padding
  const prices = combinedData.map((item) => item.price);
  const minPrice = Math.min(...prices) * 0.995; // 0.5% padding below
  const maxPrice = Math.max(...prices) * 1.005; // 0.5% padding above

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <Tabs
          value={period}
          onValueChange={(value) => setPeriod(value as Period)}
        >
          <TabsList>
            <TabsTrigger value={Period.ONE_DAY}>1D</TabsTrigger>
            <TabsTrigger value={Period.FIVE_DAY}>5D</TabsTrigger>
            <TabsTrigger value={Period.ONE_MONTH}>1M</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <RefreshCw className="w-4 h-4" />
        <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
      </div>

      <div className="h-[400px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={combinedData}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              tick={{ fontSize: 12 }}
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              width={80}
            />
            <Tooltip
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
              labelFormatter={(value) => formatTimestamp(Number(value))}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#22c55e"
              strokeWidth={2}
              dot={<PostIndicatorMarker />}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Hidden audio element */}
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} style={{ display: "none" }} />
        )}

        {/* Tweet Popover */}
        {popoverOpen && selectedPost && (
          <div
            ref={popoverRef}
            className="absolute bg-card border rounded-lg shadow-lg p-4 z-50 w-80"
            style={{
              top: popoverPosition.top + 20,
              left: popoverPosition.left - 40,
              transform: "translateX(-50%)",
              maxHeight: "300px",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="font-bold">@{selectedPost.author}</div>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopoverOpen(false);
                  // Stop audio when closing
                  if (audioRef.current && isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  }
                }}
              >
                ✕
              </button>
            </div>
            <div className="text-sm mb-2">{selectedPost.content}</div>
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {new Date(selectedPost.date * 1000).toLocaleString()}
              </div>
              <button
                className={`flex items-center gap-1 px-2 py-1 rounded ${
                  isPlaying
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
                onClick={toggleAudio}
                disabled={audioLoading}
              >
                <Volume2 size={16} />
                <span className="text-xs">
                  {audioLoading ? "Loading..." : isPlaying ? "Stop" : "Play"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff4500]"></div>
          <span>Trump&apos;s posts related to this stock</span>
        </div>
      </div>
    </div>
  );
}