// "use client"

// import { useState } from "react"
// import {
//   Chart,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
//   Line,
//   LineChart,
//   XAxis,
//   YAxis,
// } from "@/components/ui/chart"
// import { Button } from "@/components/ui/button"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Play, Settings, TrendingUp, Sparkles, Zap } from "lucide-react"

// // Add proper type definitions for chart data and periods

// type ChartPeriod = "1d" | "5d" | "1m" | "6m" | "ytd" | "1y" | "5y" | "all"

// type TweetData = {
//   id: number
//   time: string
//   price: number
//   content: string
// }

// type PriceData = {
//   time: string
//   price: number
// }

// type ChartData = {
//   prices: PriceData[]
//   tweets: TweetData[]
// }

// type MockDataType = {
//   [key in "1d" | "5d" | "1m"]: ChartData
// }

// // Mock data - replace with actual API call
// const mockData: MockDataType = {
//   "1d": {
//     prices: Array.from({ length: 24 }, (_, i) => ({
//       time: `${i}:00`,
//       price: 150 + Math.random() * 10 - 5,
//     })),
//     tweets: [
//       { id: 1, time: "3:00", price: 152, content: "The stock market is doing GREAT under my watch! MAGA!" },
//       { id: 2, time: "10:00", price: 148, content: "The Fed needs to LOWER RATES NOW! Economy would be even better!" },
//       {
//         id: 3,
//         time: "18:00",
//         price: 155,
//         content: "Just signed a TREMENDOUS trade deal. Jobs coming back to America!",
//       },
//     ],
//   },
//   "5d": {
//     prices: Array.from({ length: 5 }, (_, i) => ({
//       time: `Day ${i + 1}`,
//       price: 150 + Math.random() * 20 - 10,
//     })),
//     tweets: [
//       { id: 4, time: "Day 2", price: 145, content: "China talks going well. Big announcement coming soon!" },
//       { id: 5, time: "Day 4", price: 160, content: "Stock Market at all time high! I told you so!" },
//     ],
//   },
//   "1m": {
//     prices: Array.from({ length: 30 }, (_, i) => ({
//       time: `Day ${i + 1}`,
//       price: 150 + Math.random() * 40 - 20,
//     })),
//     tweets: [
//       {
//         id: 6,
//         time: "Day 5",
//         price: 140,
//         content: "The Fake News Media won't tell you how well the economy is doing!",
//       },
//       { id: 7, time: "Day 12", price: 165, content: "Just met with business leaders. They've never been happier!" },
//       { id: 8, time: "Day 25", price: 155, content: "My economic policies are working BETTER THAN EVER!" },
//     ],
//   },
// }

// export default function StockChart() {
//   const [period, setPeriod] = useState<ChartPeriod>("1d")
//   const [selectedTweet, setSelectedTweet] = useState<TweetData | null>(null)
//   const [isPlaying, setIsPlaying] = useState<boolean>(false)
//   const [isChartAnimating, setIsChartAnimating] = useState<boolean>(false)

//   const data = mockData[period as keyof typeof mockData] || mockData["1d"]

//   const handlePeriodChange = (newPeriod: ChartPeriod): void => {
//     setPeriod(newPeriod)
//   }

//   const playAudio = (): void => {
//     // This would connect to your actual audio service
//     setIsPlaying(true)
//     setTimeout(() => setIsPlaying(false), 3000) // Simulate audio playing
//   }

//   const animateChart = (): void => {
//     setIsChartAnimating(true)
//     setTimeout(() => setIsChartAnimating(false), 1500)
//   }

//   return (
//     <div className="mb-8">
//       <div className="mb-4">
//         <div className="flex flex-col">
//           <div className="flex items-baseline gap-2">
//             <h2 className="text-2xl font-bold flex items-center">
//               <span className="text-purple-600">AAPL</span>
//               <Sparkles className="ml-2 h-5 w-5 text-yellow-400" />
//             </h2>
//             <span className="text-gray-500">- Delayed Quote</span>
//           </div>
//           <div className="flex items-baseline gap-2">
//             <span className="text-3xl font-bold">5,525.21</span>
//             <span className="text-green-600 font-medium flex items-center">
//               <TrendingUp className="mr-1 h-4 w-4" />
//               +40.44 (+0.74%)
//             </span>
//             <span className="text-sm text-gray-500">At close: April 26 at 4:52:53 PM EDT</span>
//           </div>
//         </div>
//       </div>

//       <div className="bg-white border rounded-md shadow-sm overflow-hidden">
//         <div className="flex flex-wrap items-center justify-between p-2 border-b bg-gradient-to-r from-gray-50 to-gray-100">
//           <div className="flex flex-wrap gap-1">
//             <Button
//               variant={period === "1d" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => handlePeriodChange("1d")}
//               className="h-8 px-3 rounded-md"
//             >
//               1D
//             </Button>
//             <Button
//               variant={period === "5d" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => handlePeriodChange("5d")}
//               className="h-8 px-3 rounded-md"
//             >
//               5D
//             </Button>
//             <Button
//               variant={period === "1m" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => handlePeriodChange("1m")}
//               className="h-8 px-3 rounded-md"
//             >
//               1M
//             </Button>
//             <Button
//               variant={period === "6m" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => handlePeriodChange("6m")}
//               className="h-8 px-3 rounded-md"
//             >
//               6M
//             </Button>
//             <Button
//               variant={period === "ytd" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => handlePeriodChange("ytd")}
//               className="h-8 px-3 rounded-md"
//             >
//               YTD
//             </Button>
//             <Button
//               variant={period === "1y" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => handlePeriodChange("1y")}
//               className="h-8 px-3 rounded-md"
//             >
//               1Y
//             </Button>
//             <Button
//               variant={period === "5y" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => handlePeriodChange("5y")}
//               className="h-8 px-3 rounded-md"
//             >
//               5Y
//             </Button>
//             <Button
//               variant={period === "all" ? "default" : "ghost"}
//               size="sm"
//               onClick={() => handlePeriodChange("all")}
//               className="h-8 px-3 rounded-md"
//             >
//               All
//             </Button>
//           </div>

//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               className="flex items-center gap-1 border-purple-200 text-purple-600 hover:bg-purple-50"
//               onClick={animateChart}
//             >
//               <Zap className="h-4 w-4" />
//               <span className="text-sm">Animate</span>
//             </Button>

//             <div className="flex items-center">
//               <input type="checkbox" id="key-events" className="mr-2" />
//               <label htmlFor="key-events" className="text-sm">
//                 Key Events
//               </label>
//             </div>

//             <Button variant="ghost" size="sm" className="flex items-center gap-1">
//               <span className="text-sm">Mountain</span>
//               <span className="text-xs">▼</span>
//             </Button>

//             <Button variant="ghost" size="sm" className="flex items-center gap-1">
//               <span className="text-sm">Advanced Chart</span>
//             </Button>

//             <Button variant="ghost" size="icon" className="h-8 w-8">
//               <Settings className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>

//         <div className="p-4 relative">
//           <div className={`h-[400px] transition-all duration-1000 ${isChartAnimating ? "scale-105 opacity-80" : ""}`}>
//             <ChartContainer className="h-full">
//               <Chart>
//                 <LineChart
//                   data={data.prices}
//                   index="time"
//                   categories={["price"]}
//                   colors={["#22c55e"]}
//                   yScale={{ type: "linear" }}
//                   showLegend={false}
//                   showGridLines={false}
//                   showTooltip={true}
//                   curveType="linear"
//                 >
//                   <XAxis />
//                   <YAxis />
//                   <Line dataKey="price" strokeWidth={2} />
//                   <ChartTooltip>
//                     <ChartTooltipContent />
//                   </ChartTooltip>
//                 </LineChart>
//               </Chart>
//             </ChartContainer>
//           </div>

//           {isChartAnimating && (
//             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//               <div className="text-3xl font-bold text-purple-600 animate-pulse">Analyzing Market Data...</div>
//             </div>
//           )}
//         </div>

//         <div className="border-t p-4">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//             <div>
//               <p className="text-sm text-gray-500">Previous Close</p>
//               <p className="font-medium">5,484.77</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Open</p>
//               <p className="font-medium">5,489.73</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Volume</p>
//               <p className="font-medium">2,943,164,000</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">52 Week Range</p>
//               <p className="font-medium">4,835.04 - 5,147.43</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Trump Tweet Markers */}
//       <div className="mt-4">
//         <h3 className="text-lg font-medium mb-2">Trump Tweets</h3>
//         <div className="flex flex-wrap gap-2">
//           {data.tweets.map((tweet) => (
//             <Dialog key={tweet.id}>
//               <DialogTrigger asChild>
//                 <Button variant="outline" size="sm" onClick={() => setSelectedTweet(tweet)}>
//                   {tweet.time}
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Trump Tweet at {tweet.time}</DialogTitle>
//                 </DialogHeader>
//                 <div className="p-4 border rounded-md bg-gray-50">
//                   <p className="text-lg">{tweet.content}</p>
//                 </div>
//                 <div className="flex justify-center mt-4">
//                   <Button onClick={playAudio} disabled={isPlaying} className="flex items-center gap-2">
//                     <Play size={16} />
//                     {isPlaying ? "Playing..." : "Play Trump Voice"}
//                   </Button>
//                 </div>
//               </DialogContent>
//             </Dialog>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }
