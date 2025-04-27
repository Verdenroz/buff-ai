import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import Image from "next/image"

type NewsItem = {
  title: string
  link: string
  source: string
  img: string
  time: string
}

async function getFinanceNews() {
  try {
    const response = await fetch("https://finance-query.onrender.com/v1/news", { next: { revalidate: 600 } })
    if (!response.ok) {
      throw new Error("Failed to fetch news")
    }
    return response.json()
  } catch (error) {
    console.error("Error fetching news:", error)
    return []
  }
}

export default async function MarketNews() {
  const news = await getFinanceNews()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Financial News</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {news.slice(0, 6).map((item: NewsItem, i: number) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`block p-4 hover:bg-gray-100 transition-colors ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} border-b last:border-b-0 md:border-r md:last:border-r-0`}
            >
              <div className="flex flex-col h-full">
                <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden">
                  <Image
                    src={item.img || "/placeholder.svg?height=160&width=320"}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="font-medium text-blue-800 line-clamp-2 mb-2">{item.title}</h3>
                <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                  <span>{item.source}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.time}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
