"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Send } from "lucide-react"

// Add proper type definitions for the message handler and AI responses

type Message = {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Add a type for the AI responses
type AIResponses = {
  strategy: string
  apple: string
  market: string
  default: string
}

export default function BuffAIChat() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm BuffAI, your personal trading assistant. I can help you create trading strategies, analyze market trends, and provide insights on stocks. What would you like to know today?",
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async (): Promise<void> => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponses: AIResponses = {
        strategy:
          "Based on current market conditions, I recommend a balanced approach with 60% in blue-chip stocks, 30% in growth stocks with strong fundamentals, and 10% in bonds as a hedge. Focus on companies with strong cash positions and low debt in the current high interest rate environment.",
        apple:
          "Apple (AAPL) is showing strong technical indicators with support at $170. Recent AI announcements could be a catalyst for growth. Consider a buy-and-hold strategy with a stop loss at $165.",
        market:
          "The market is currently showing mixed signals. Inflation concerns are being balanced by strong corporate earnings. I'd recommend caution with new positions and focusing on companies with pricing power.",
        default:
          "I can help you analyze specific stocks, create personalized trading strategies, or provide market insights. What specific aspect of trading are you interested in?",
      }

      let responseContent = aiResponses.default

      // Simple keyword matching for demo purposes
      const lowercaseInput = userMessage.content.toLowerCase()
      if (lowercaseInput.includes("strategy") || lowercaseInput.includes("plan")) {
        responseContent = aiResponses.strategy
      } else if (lowercaseInput.includes("apple") || lowercaseInput.includes("aapl")) {
        responseContent = aiResponses.apple
      } else if (lowercaseInput.includes("market") || lowercaseInput.includes("trend")) {
        responseContent = aiResponses.market
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col">
      <CardHeader>
        <CardTitle>BuffAI Trading Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex items-start gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8">
                  <div
                    className={`h-full w-full flex items-center justify-center ${message.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {message.role === "assistant" ? "B" : "U"}
                  </div>
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"}`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                    B
                  </div>
                </Avatar>
                <div className="rounded-lg p-3 bg-muted">
                  <div className="flex space-x-2">
                    <div
                      className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Ask BuffAI about trading strategies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
