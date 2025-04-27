export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="mr-2">🐃</span> BuffAI Finance
            </h3>
            <p className="text-gray-400 text-sm">
              The most entertaining way to track stocks and get AI-powered insights with Trump tweets along the way!
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Markets</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Stocks
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Crypto
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Commodities
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Forex
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Tools</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Technical Analysis
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Trump Tweet Analyzer
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  AI Sentiment
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Trading Strategies
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>© 2023 BuffAI Finance. All rights reserved. Not financial advice. Entertainment purposes only.</p>
          <p className="mt-2">Trump tweets are AI-generated for entertainment. Not affiliated with Donald Trump.</p>
        </div>
      </div>
    </footer>
  )
}
