import asyncio
from typing import Dict, Optional

import requests

from agents.base.agent import Agent
from tavily_search import TavilySearch
from utils.llm import LLM


class FundamentalsAgent(Agent):
    """
    Agent specialized in analyzing stock fundamentals and technical indicators.
    Focuses on answering questions related to a specific ticker's fundamentals.
    """

    def __init__(
            self,
            llm: LLM = LLM(),
            tavily: TavilySearch = TavilySearch(),
            automatic_function_calling: bool = True,
    ):
        """
        Initialize the FundamentalsAgent with quote and technical data tools.
        """

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

        def get_search(query: str) -> Dict:
            """ Perform a search of information that is not available in the quotes or technicals. """
            return tavily.search(
                query,
                search_depth="advanced",
                topic="finance",
                include_answer=False,
                max_results=3
            )

        super().__init__(
            llm=llm,
            tools=[get_quotes, get_technicals, get_search],
            automatic_function_calling=automatic_function_calling,
        )

    async def analyze(
            self,
            ticker: str,
            question: str,
            system: Optional[str] = None,
    ) -> str:
        """
        Answer a specific question about a ticker's fundamentals.

        Args:
            ticker: Stock symbol to analyze (e.g., 'AAPL').
            question: The specific question about the ticker's fundamentals.
            system: Optional system-level instruction.

        Returns:
            Detailed answer to the question based on fundamental and technical data.
        """
        prompt = (
            f"I need information about the stock {ticker}. Here's my question:\n\n{question}\n\n"
            f"To answer this question, first use the get_quotes function for {ticker} to retrieve current "
            f"price, market cap, PE ratio, and other fundamental metrics. Then use the get_technicals function "
            f"for {ticker} to analyze technical indicators.\n\n"
            f"Based on this data, provide a clear, concise answer to my question about {ticker}. "
            f"Include relevant numeric data and explain what the data means for investors. "
            f"If the question can't be answered with the available data, use the get_search function."
            f"Always try to provide a data-driven answer based on the metrics retrieved."
            f"Do NOT try to continue the conversation or ask follow-up questions."
        )

        # Use system prompt to focus on objective financial analysis
        system_instruction = system or (
            "You are a financial data analyst specializing in stock fundamentals and technical analysis. "
            "Provide factual, data-driven answers based on the available financial metrics. "
            "Focus on objective analysis rather than investment recommendations. "
            "Use precise numbers and cite specific metrics when answering questions."
        )

        return await super().invoke(prompt=prompt, system=system_instruction)


if __name__ == "__main__":
    agent = FundamentalsAgent()

    # Example questions
    questions = [
        "What is the current P/E ratio and how does it compare to the industry average?",
        "What are the key technical indicators suggesting about price momentum?",
        "How has the company's market cap changed in the last quarter?"
    ]

    # Run the first question as a demo
    result = asyncio.run(agent.analyze(ticker="AAPL", question=questions[0]))
    print(result)
