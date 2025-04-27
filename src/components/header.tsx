"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Header() {
  return (
    <header className="border-b py-3 bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-white flex items-center">
              <span className="mr-1">🐃</span> BuffAI<span className="text-yellow-300">Finance</span>
            </div>

            <div className="relative hidden md:block w-96">
              <Input
                type="text"
                placeholder="Search for stocks, crypto, or companies"
                className="pl-3 pr-10 py-1 h-10 rounded-full bg-white/20 text-white placeholder:text-white/70 border-0"
              />
              <Button
                size="icon"
                className="absolute right-0 top-0 h-10 w-10 rounded-full bg-yellow-400 hover:bg-yellow-500"
              >
                <Search className="h-4 w-4 text-purple-700" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
              Watchlist
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
              BuffAI Chat
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
