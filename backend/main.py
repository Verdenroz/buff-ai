import os

import boto3
import requests
from fastapi import FastAPI, Query
import yfinance as yf

from models.historical import Period
from models.post import Post

from elevenlabs import ElevenLabs

from rds import RedisHandler
from s3 import S3

app = FastAPI()

elevenlabs = os.getenv("ELEVENLABS_API_KEY")

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

    #get the current interval
    interval = intervals.get(period, [])
    period_string = periods.get(period, [])

    stock = yf.Ticker(ticker)
    data = stock.history(period=period_string, interval=interval)
    return data.to_dict(orient="records")

#Fetch news articles for a given ticker
@app.get("/news/{ticker}")
async def get_news(ticker: str):
    """
    Fetch news articles for a given ticker.
    """
    stock = yf.Ticker(ticker)
    news = stock.news
    return news

#Get company funamentals
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

#logo.dev search and get a logo
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


#Get a posts tts and create an audiofile on elevenlabs
#Then should but put in s3 bucket
@app.get("/tts")
async def get_tts(key:str = Query(...)):
    # """
    # Get post from redis and get from s3
    # """
    # #client = ElevenLabs(api_key=elevenlabs)
    # # generated_audio = client.text_to_speech.convert(
    # #     voice_id="JBFqnCBsd6RMkjVDRZzb",
    # #     output_format="mp3_44100_128",
    # #     text="Test 123",
    # #     model_id="eleven_multilingual_v2",
    # # )
    #
    #
    # #Get from redis here
    # rds = RedisHandler()
    #
    # #Get the post from redis
    # post = rds.get(f"trump_post:{key}")
    # if not post:
    #     return {"error": "Post not found"}
    #
    # #s3 key
    # key = f"tts/trump/{post['date']}.mp3"

    #Get the audio file from s3
    s3 = S3()
    audio_file = s3.get_presigned_url(key)
    if not audio_file:
        return {"error": "Audio file not found"}
    #return presigned url
    return {"audio_file": audio_file}