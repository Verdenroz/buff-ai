import asyncio
from typing import Dict, Optional

import requests

from agents.base.agent import Agent
from dependencies import RDS
from rds import RedisHandler
from utils.llm import LLM


class TradingStrategyAgent(Agent):
    """
    Agent specialized in fetching stock quotes and analyzing trading strategies.
    """

    def __init__(
            self,
            rds: RDS = RedisHandler(),
            llm: LLM = LLM(),
            automatic_function_calling: bool = True,
    ):
        def get_quotes(symbol: str) -> Dict:
            """Fetch detailed quote data for given stock symbols."""
            response = requests.get(
                "https://finance-query.onrender.com/v1/quotes",
                params={"symbols": symbol}
            )
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list):
                return {"quotes": data}
            return data

        def get_news(symbol: str) -> Dict:
            """Fetch the latest news for a given stock symbol."""
            response = requests.get(
                "https://finance-query.onrender.com/v1/news",
                params={"symbol": symbol}
            )
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list):
                return {"news": data}
            return data

        def get_similar(symbol: str) -> Dict:
            """Fetch similar stocks for a given symbol."""
            response = requests.get(
                "https://finance-query.onrender.com/v1/similar",
                params={"symbol": symbol}
            )
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list):
                return {"similar": data}
            return data

        def get_technicals(symbol: str) -> Dict:
            """Fetch technical indicators for a given symbol."""
            response = requests.get(
                "https://finance-query.onrender.com/v1/indicators",
                params={"symbol": symbol, "interval": "1d"}
            )
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list):
                return {"indicators": data}
            return data

        def get_recent_posts(author: str = "trump") -> Dict:
            """Get the most recent Trump posts from Redis"""
            posts = rds.get_recent_posts(author)
            if not posts:
                return {"posts": []}

            return {"posts": [post.model_dump_json() for post in posts]}

        super().__init__(
            llm=llm,
            tools=[get_quotes, get_news, get_similar, get_technicals, get_recent_posts],
            automatic_function_calling=automatic_function_calling,
        )

    async def invoke(
            self,
            ticker: str,
            system: Optional[str] = None,
    ) -> str:
        """
        Executes analysis for the given ticker.

        Args:
            ticker: Stock symbol to analyze (e.g., 'AAPL').
            system: Optional system-level instruction.

        Returns:
            Strategy analysis incorporating real-time quote data.
        """
        """
        Propose trading strategies for the given symbol based on all available data and recent posts.

        Strategies should include whether to hold, buy on dip, sell, or other actionable recommendations.
        """
        prompt = (
            f"Analyze the stock symbol {ticker} and propose a trading strategy. "
            "You have access to the following tools: get_quotes, get_summary, get_historical, get_market_movers, get_similar, get_news, get_technicals, and get_recent_posts(author='trump'). "
            "Use these tools as needed to gather current market data, news sentiment, technical indicators, peer comparisons, and recent Trump posts. "
            "Based on the collected information, recommend whether to hold, buy on dips, or sell, and explain your logic. "
            "Provide a clear step-by-step reasoning in text."
        )
        return await super().invoke(prompt=prompt, system=system)


if __name__ == "__main__":
    rds = RedisHandler()
    agent = TradingStrategyAgent(rds=rds)
    result = asyncio.run(agent.invoke(ticker="AAPL"))
    print(result)
