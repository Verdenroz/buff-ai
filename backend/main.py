import os
from contextlib import asynccontextmanager

import requests
import yfinance as yf
from fastapi import FastAPI, Query, HTTPException
from fastapi.params import Path

from dependencies import RDS, S3
from models.historical import Period
from rds import RedisHandler

app = FastAPI()

elevenlabs = os.getenv("ELEVENLABS_API_KEY")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize dependencies
    rds = RedisHandler()
    s3 = S3()

    app.state.rds = rds
    app.state.s3 = s3

    yield


@app.get("/")
async def root():
    return {"message": "Hello World"}


"""
1 day - time interval of 1 minute - 5 minutes 
5 day - time interval of 15 minutes
1 month - time interval of 1 day
"""


@app.get("/stock/{ticker}")
async def get_stock_data(ticker: str, period: Period):
    """
    Fetch stock data for a given ticker, period, and interval.
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
    return data.to_dict(orient="records")


# Fetch news articles for a given ticker
@app.get("/news/{ticker}")
async def get_news(ticker: str):
    """
    Fetch news articles for a given ticker.
    """
    stock = yf.Ticker(ticker)
    news = stock.news
    return news


# Get company funamentals
@app.get("/fundamentals/{ticker}")
async def get_fundamentals(ticker: str):
    """
    Fetch company fundamentals for a given ticker.
    """
    stock = yf.Ticker(ticker)
    fundamentals = {
        "info": stock.info,
        "sustainability": stock.sustainability,
        "calendar": stock.calendar,
        "actions": stock.actions,
        "dividends": stock.dividends,
        "splits": stock.splits,
    }
    return fundamentals


@app.get("/logo/{ticker}")
async def get_logo(ticker: str):
    """
    Fetch logo for a given company.
    """
    public_token = "pk_PB5o5CpXRiSO0JcU6FzItw"
    url = f"https://img.logo.dev/ticker/{ticker}?token={public_token}"
    response = requests.get(url)

    if response.status_code == 200:
        return {"logo_url": url}
    else:
        return {"error": "Failed to fetch logo"}


@app.get("/posts/{author}")
async def get_posts(
        rds: RDS,
        author: str = Path("trump"),
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
