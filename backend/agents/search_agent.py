import asyncio
from typing import List, Dict, Optional
from agents.base.agent import Agent
from tavily_search import TavilySearch
from utils.llm import LLM
import requests

class SearchAgent(Agent):
    """
    Agent specialized in identifying stocks that would be good to buy
    """

    def __init__(
            self,
            llm: LLM = LLM(),
            tavily: TavilySearch = TavilySearch(),
            automatic_function_calling: bool = True,
    ):
        """
        Initialize the GoodStocksAgent with no tools.
        """
        super().__init__(
            llm=llm,
            tools=None,
            automatic_function_calling=automatic_function_calling,
        )

        # Find information regarding good stocks to buy
        def get_search(query: str) -> Dict:
            """ Perform a search of information that is not available in the quotes or technicals. """
            return tavily.search(
                query,
                search_depth="advanced",
                topic="finance",
                include_answer=False,
                max_results=3
            )

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

        def get_quotes(symbol: str) -> Dict:
            """Fetch detailed quote data for given stock symbol."""
            response = requests.get(
                "https://finance-query.onrender.com/v1/quotes",
                params={"symbols": symbol}
            )
            response.raise_for_status()
            data = response.json()
            if isinstance(data, list):
                return {"quotes": data}
            return data

        super().__init__(
            llm=llm,
            tools=[get_search, get_quotes, get_technicals, get_news],
            automatic_function_calling=automatic_function_calling,
        )

    async def recommend(self, system: Optional[str] = None) -> str:
        """
        Recommend good stocks to buy based on analysis.
        Args:
            system: Optional system-level instruction.

        Returns:
            Recommendations with reasoning.
        """
        # Fetch trending or popular stocks using the get_search method
        search_results = self.tools[0]("What are some good stocks to buy?")
        symbols = []
        for result in search_results.get("results", []):
            # Extract stock symbols from the content field
            if "content" in result:
                symbols.extend(
                    [word.strip() for word in result["content"].split() if word.isupper() and len(word) <= 5]
                )

        if not symbols:
            return "No trending stocks were found. Please try again later."

        prompt = (
            f"Analyze the following stock symbols: {', '.join(symbols)}. "
            "For each stock, use the tools get_quotes, get_technicals, and get_news to gather data. "
            "Based on the data, recommend stocks that are good to buy. "
            "Provide clear reasoning for each recommendation, including key metrics and sentiment analysis. "
            "Focus on actionable insights and avoid disclaimers or generic responses."
        )

        system_instruction = system or (
            "You are a financial advisor specializing in stock recommendations. "
            "Provide clear, data-driven recommendations based on stock fundamentals, technical indicators, and sentiment. "
            "Focus on actionable insights and avoid unnecessary details."
        )

        return await super().invoke(prompt=prompt, system=system_instruction)

if __name__ == "__main__":
    agent = SearchAgent()
    #recommendations = asyncio.run(agent.recommend(symbols=["AAPL", "MSFT", "GOOGL"]))
    recommendations = asyncio.run(agent.recommend())

    print(recommendations)
