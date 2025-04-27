# BuffAI 📈
> Your Personal Finance and Stock Market Assistant — built with Next.js, FastAPI, Redis, and Gemini AI (Google GenAI).

🌐 Live Demo: https://buff-ai.vercel.app/
---

## 🛠️ Project Overview

BuffAI is an AI-driven financial web application that helps users:
- Analyze stock fundamentals
- Assess sentiment based on real-time news
- Propose actionable trading strategies
- Interact via natural conversation, in real time (streaming)

The platform leverages:
- **Next.js 15** frontend (React, Server Actions, Edge Streaming)
- **FastAPI** backend (Python async APIs)
- **Google Gemini API** for LLM responses
- **Tavily Search** for financial web search
- **Redis** for fast in-memory storage (Trump posts, TTS)
- **Amazon S3** for hosting generated MP3s (Trump voice posts)
- **ElevenLabs API** for text-to-speech
- **Tailwind CSS** for beautiful UI design

---

## ✨ Features

- Chat Interface to ask financial questions naturally
- Real-Time Sentiment Analysis on stocks
- Dynamic Trading Strategies powered by real-time data
- TruthSocial Scraper to fetch and analyze Trump's posts
- Financial Filtering of Trump's posts using LLMs
- Audio TTS Generation of filtered posts
- Redis Caching for fast access to posts
- S3 Presigned URLs for secure streaming of MP3 files
- Scalable microservices design (agents: Fundamentals, Sentiment, Trading)

---

## 📚 Tech Stack

| Layer            | Technologies                                      |
| ---------------- | ------------------------------------------------- |
| Frontend (Web)   | Next.js 15, Tailwind CSS, ShadCN UI, ReactMarkdown |
| Backend (API)    | FastAPI, Uvicorn, asyncio, Redis, S3, yFinance     |
| LLM / AI         | Google Gemini (via google-genai), Tavily, ElevenLabs TTS |
| Infrastructure   | Amazon S3, Redis Cloud, Vercel, Render             |
| Dev Tools        | TypeScript, Python 3.11+, Pydantic, Selenium, dotenv |

---

## 🚀 Getting Started

### 1. Clone the repo

https://github.com/Verdenroz/buff-ai

###  Install Frontend (Next.js)

cd src/app
npm install
npm run dev

###  Install Backend (FastAPI)

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

## 🧩 Main Components

### 🔹 Supervisor Agent
- Smart router that analyzes chat intent
- Routes request to:
  - FundamentalsAgent
  - SentimentAgent
  - TradingStrategyAgent

### 🔹 Fundamentals Agent
- Fetches stock quotes (price, PE ratio, etc)
- Fetches technical indicators
- Answers finance-specific user questions

### 🔹 Sentiment Agent
- Pulls live stock news
- Classifies positive, neutral, or negative sentiment
- Returns structured JSON

### 🔹 Trading Strategy Agent
- Analyzes stocks for trading opportunities
- Incorporates quotes, technicals, news, and Trump's posts
- Proposes buy/hold/sell strategies

### 🔹 Trump Post Processing
- Scrapes posts from TruthSocial using Selenium
- Filters for finance-relevant content (LLM-based)
- Converts text to speech (TTS) using ElevenLabs
- Stores MP3s in S3, metadata in Redis

---

## 🛡️ API Endpoints

| Method | URL                         | Purpose                          |
| :----: | ---------------------------- | -------------------------------- |
| GET    | `/price/{ticker}?period=1d`   | Fetch stock price data           |
| GET    | `/posts/{author}`             | Fetch recent posts (e.g., Trump)  |
| POST   | `/chat`                      | Chatbot non-streaming response   |
| POST   | `/chat/stream`               | Chatbot streaming response       |
| GET    | `/sentiment/{ticker}`         | Stock news sentiment analysis    |
| GET    | `/tts?key=s3key`              | Fetch Trump post audio           |

---

## ⚙️ Environment Variables

You must create a `.env` file at the project root with:

```bash
# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key

# Tavily Search API Key
TAVILY_API_KEY=your-tavily-api-key

# ElevenLabs TTS API Key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Redis
REDIS_URL=redis://your-redis-url

# S3 Credentials
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

🧪 Local Development

- **Frontend:** Navigate to `src/app`
- **Backend:** Navigate to `backend`
- **Redis:** Run a local Redis instance or use Redis Cloud
- **AWS S3:** Make sure you have an S3 bucket created
- **Environment Variables:** Set up `.env` properly

---

📦 Deployment

You can deploy:
- Frontend on **Vercel**
- Backend on **Render**, **Railway**, or **Fly.io**
- Redis on **Upstash** or **Redis Cloud**
- S3 storage on **AWS**

Configure environment variables accordingly.

---

🧠 Future Improvements

- ✅ Dockerize backend services
- ✅ Add stock watchlists
- ✅ Enhance Trump post TTS with multiple voices
- ✅ Allow user-uploaded posts for sentiment analysis
- ✅ Add user authentication (Auth.js)


