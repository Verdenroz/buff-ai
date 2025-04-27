import asyncio
from typing import Optional, List, Dict

import requests

from agents.base.agent import Agent
from utils.llm import LLM


class SentimentAgent(Agent):
    """
    Agent that embeds fetched news headlines into the prompt and determines market sentiment.
    """

    def __init__(
            self,
            llm: LLM = LLM(),
    ):
        """
        Initialize the SentimentAgent without exposing get_news as a tool.
        """
        # No tools needed; news will be fetched manually
        super().__init__(
            llm=llm,
            tools=None,
            automatic_function_calling=False,
        )

    async def invoke(
            self,
            ticker: str,
            system: Optional[str] = None,
    ) -> str:
        """
        Fetches the latest news headlines for a stock symbol and embeds them into the prompt.

        Args:
            ticker: Stock symbol to analyze (e.g., 'AAPL').
            system: Optional system-level instruction.

        Returns:
            Text summary indicating if market sentiment is positive, negative, or neutral.
        """
        response = requests.get(
            "https://finance-query.onrender.com/v1/news",
            params={"symbol": ticker}
        )
        response.raise_for_status()
        data = response.json()
        articles: List[Dict] = data if isinstance(data, list) else data.get("news", [])

        # Extract up to 10 titles with URLs
        top_articles = articles[:10]
        titles_text = "\n".join(
            f"- {article.get('title')} ({article.get('link')})"
            for article in top_articles
            if article.get('title') and article.get('link')
        )

        prompt = (
            f"Current ticker: {ticker}. Here are the latest news headlines with URLs:\n"
            f"{titles_text}\n\n"
            "Based only on these headlines and URLs, please:\n"
            "1. Provide a sentiment score between 0 (very negative) and 1 (very positive).\n"
            "2. List 3 key points, each referencing the relevant article URL.\n"
            "Return a JSON object with the following structure:\n"
            "{\n"
            "  \"sentiment_score\": 0.0,\n"
            "  \"key_points\": [\n"
            "    {\"point\": \"Key insight here\", \"url\": \"article_url_here\"}\n"
            "  ]\n"
            "}\n"
            "Return only the JSON."
        )

        return await super().invoke(prompt=prompt, system=system)


if __name__ == "__main__":
    agent = SentimentAgent()
    summary = asyncio.run(agent.invoke(ticker="AAPL"))
    print(summary)
