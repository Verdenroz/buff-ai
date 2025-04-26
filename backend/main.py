from fastapi import FastAPI
import yfinance as yf

from models.historical import Period

app = FastAPI()

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
    valid_periods = ["1d", "5d", "1mo"]
    intervals = {
        period.ONE_DAY: ["5m"],
        period.FIVE_DAY: ["15m"],
        period.ONE_MONTH: ["1d"]
    }

    if period not in valid_periods:
        return {"error": "Invalid period"}

    #get the current interval
    interval = intervals.get(period, [])

    stock = yf.Ticker(ticker)
    data = stock.history(period=period, interval=interval)
    return data.to_dict(orient="records")

