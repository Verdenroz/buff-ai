"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // More controlled scrolling behavior
  useEffect(() => {
    if (!autoScroll) return;
    
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  }, [messages, currentResponse, autoScroll]);

  // Detect manual scrolling to disable auto-scroll
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      // If user has scrolled up more than 100px, disable auto-scroll
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setAutoScroll(!isScrolledUp);
    };

    scrollArea.addEventListener("scroll", handleScroll);
    return () => scrollArea.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setCurrentResponse("");
    setAutoScroll(true); // Re-enable auto-scroll when sending a new message

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
        <CardHeader className="p-3 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt="BuffAI"
              />
              <AvatarFallback className="bg-blue-600 text-white text-xs">B</AvatarFallback>
            </Avatar>
            BuffAI Chat
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-grow overflow-hidden p-0 relative">
          <div 
            className="h-[calc(100vh-200px)] overflow-y-auto p-3 space-y-2 pb-4" 
            ref={scrollAreaRef}
          >
            {/* Compact message bubbles */}
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[85%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-6 w-6 mt-0.5 flex-shrink-0">
                    {message.role === "user" ? (
                      <>
                        <AvatarImage
                          src="/placeholder.svg?height=32&width=32"
                          alt="You"
                        />
                        <AvatarFallback>
                          <User className="h-3 w-3" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage
                          src="/placeholder.svg?height=32&width=32"
                          alt="BuffAI"
                        />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">B</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg py-2 px-3 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="prose dark:prose-invert prose-sm prose-p:my-1 prose-headings:my-2 max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming */}
            {currentResponse && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <Avatar className="h-6 w-6 mt-0.5 flex-shrink-0">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="BuffAI"
                    />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">B</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg py-2 px-3 text-sm bg-muted">
                    <div className="prose dark:prose-invert prose-sm prose-p:my-1 prose-headings:my-2 max-w-none">
                      <ReactMarkdown>{currentResponse}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading dots */}
            {isLoading && !currentResponse && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <Avatar className="h-6 w-6 mt-0.5 flex-shrink-0">
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="BuffAI"
                    />
                    <AvatarFallback className="bg-blue-600 text-white text-xs">B</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg py-2 px-3 bg-muted">
                    <div className="flex space-x-2">
                      <div 
                        className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" 
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div 
                        className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" 
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div 
                        className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" 
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
            
            {/* Show scroll to bottom button when auto-scroll is disabled */}
            {!autoScroll && (
              <button
                className="absolute bottom-4 right-4 bg-primary text-white rounded-full p-2 shadow-lg"
                onClick={() => {
                  setAutoScroll(true);
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t p-3">
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