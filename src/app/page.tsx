//import StockChart from "@/components/stock-chart"
import CompanyInfo from "@/components/company-info"
import SentimentAnalysis from "@/components/sentiment-analysis"
import Header from "@/components/header"
import MarketOverview from "@/components/market-overview"
import TopMovers from "@/components/top-movers"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-6 flex-1">
        <main>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <CompanyInfo />
                <SentimentAnalysis />
              </div>
            </div>

            <div className="w-full lg:w-80 shrink-0 space-y-6">
              <MarketOverview />
              <TopMovers />
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
