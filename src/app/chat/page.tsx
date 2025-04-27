"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SendIcon, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const initialGreeting: Message = {
    role: "assistant",
    content: "Hello! I'm BuffAI, your personal finance assistant. Ask me anything about stocks, market trends, or trading strategies.",
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setCurrentResponse("");

    try {
      const chatHistory = messages.slice(1).concat(userMessage);
      const payload = {
        message: userMessage.content,
        history: chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      };

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedResponse += chunk;
          setCurrentResponse(accumulatedResponse);
        }
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: accumulatedResponse },
      ]);
      setCurrentResponse("");
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-6 h-[calc(100vh-80px)]">
      <Card className="w-full h-full flex flex-col shadow-xl">

        <CardContent className="flex-grow overflow-hidden p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4 p-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-3 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8 mt-0.5">
                      {message.role === "user" ? (
                        <>
                          <AvatarImage
                            src="/placeholder.svg?height=32&width=32"
                            alt="You"
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage
                            src="/placeholder.svg?height=32&width=32"
                            alt="BuffAI"
                          />
                          <AvatarFallback className="bg-blue-600 text-white">B</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming */}
              {currentResponse && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt="BuffAI"
                      />
                      <AvatarFallback className="bg-blue-600 text-white">B</AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 bg-muted">
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{currentResponse}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading dots */}
              {isLoading && !currentResponse && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarImage
                        src="/placeholder.svg?height=32&width=32"
                        alt="BuffAI"
                      />
                      <AvatarFallback className="bg-blue-600 text-white">B</AvatarFallback>
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

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              placeholder="What would you like to know about stocks or finance?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <SendIcon className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}