import json
import os
from contextlib import asynccontextmanager

import yfinance as yf
from fastapi import FastAPI, Query, HTTPException
from fastapi.params import Path
from starlette.responses import StreamingResponse

from agents.sentiment_agent import SentimentAgent
from agents.supervisor_agent import SupervisorAgent
from dependencies import RDS, S3
from models.chatrequest import ChatRequest
from models.historical import Period
from models.sentiment import SentimentResponse
from rds import RedisHandler

elevenlabs = os.getenv("ELEVENLABS_API_KEY")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize dependencies
    rds = RedisHandler()
    s3 = S3()

    app.state.rds = rds
    app.state.s3 = s3

    yield


app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root():
    return {"message": "Hello World"}


"""
1 day - time interval of 1 minute - 5 minutes 
5 day - time interval of 15 minutes
1 month - time interval of 1 day
"""


@app.get("/price/{ticker}")
async def get_stock_data(ticker: str, period: Period):
    """
    Fetch stock data for a given ticker, period, and interval.
    Maps data by datetime timestamps in milliseconds (integer format).
    """
    intervals = {
        period.ONE_DAY: "5m",
        period.FIVE_DAY: "15m",
        period.ONE_MONTH: "1d"
    }
    periods = {
        period.ONE_DAY: "1d",
        period.FIVE_DAY: "5d",
        period.ONE_MONTH: "1mo"
    }

    valid_periods = [period.ONE_DAY, period.FIVE_DAY, period.ONE_MONTH]
    if period not in valid_periods:
        return {"error": "Invalid period"}

    # get the current interval
    interval = intervals.get(period, [])
    period_string = periods.get(period, [])

    stock = yf.Ticker(ticker)
    data = stock.history(period=period_string, interval=interval)

    # Convert the DataFrame index to Unix timestamps (milliseconds)
    data_dict = {}
    for idx, row in data.iterrows():
        # Convert timestamp to seconds integer
        timestamp = int(idx.timestamp())
        data_dict[timestamp] = row.to_dict()

    return data_dict


@app.get("/posts/{author}")
async def get_posts(
        rds: RDS,
        author: str = Path(),
):
    """
    Fetch posts for a given author.
    """
    posts = rds.get_recent_posts(author)
    if not posts:
        raise HTTPException(status_code=404)
    return posts


@app.get("/tts")
async def get_tts(
        s3: S3,
        key: str = Query(...),
):
    # Get the audio file from s3
    audio_file = s3.get_presigned_url(key)
    if not audio_file:
        return {"error": "Audio file not found"}
    # return presigned url
    return {"audio_file": audio_file}


@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Nonstreaming endpoint: yields the Markdown response as a single response
    """
    supervisor = SupervisorAgent()
    response = await supervisor.handle(request)
    return response


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Streaming endpoint: yields the Markdown response as it’s generated chunk by chunk
    """
    supervisor = SupervisorAgent()
    return StreamingResponse(
        supervisor.handle_stream(request),
        media_type="text/event-stream"
    )


@app.get("/sentiment/{ticker}", response_model=SentimentResponse)
async def get_sentiment(ticker: str):
    """
    Fetch sentiment for a given ticker.
    """
    sentiment_agent = SentimentAgent()
    result = await sentiment_agent.invoke(ticker=ticker)

    # Need to extract and parse the JSON
    if isinstance(result, str):
        # Remove markdown code block if present
        result = result.strip()
        if result.startswith("```json"):
            result = result[7:].strip()
        if result.endswith("```"):
            result = result[:-3].strip()

        # Parse the JSON string into a dictionary
        result = json.loads(result)

    return SentimentResponse.model_validate(result)
