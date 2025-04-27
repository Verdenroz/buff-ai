import os
from typing import Literal, Optional, Union, Sequence

from dotenv import load_dotenv
from tavily import TavilyClient


class TavilySearch:
    """
    A simple Python interface for performing searches with Tavily.

    Usage:
        interface = TavilyInterface(api_key="YOUR_API_KEY")
        response = interface.search("Your query here")
    """

    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("TAVILY_API_KEY")
        self.client = TavilyClient(api_key=self.api_key)

    def search(
            self,
            query: str,
            search_depth: Literal["basic", "advanced"] = "basic",
            topic: Literal["general", "news", "finance"] = "general",
            time_range: Optional[Literal["day", "week", "month", "year", "d", "w", "m", "y"]] = None,
            days: int = 7,
            max_results: int = 5,
            include_answer: Union[bool, Literal["basic", "advanced"]] = False,
            timeout: int = 60,
            **kwargs,
    ) -> dict:
        """
        Perform a search against the Tavily API with full parameter support.

        Args:
            query: The search query string.
            search_depth: "basic" (1 credit) or "advanced" (2 credits).
            topic: "general", "news", or "finance".
            time_range: Time filter: day, week, month, year (or d, w, m, y).
            days: Number of days back for "news" topic.
            max_results: Number of top results to return (0-20).
            include_answer: False, True/basic, or "advanced" to include LLM-generated answer.
            include_domains: Domains to include in results.
            exclude_domains: Domains to exclude from results.
            timeout: Request timeout in seconds (max 120).
            **kwargs: Additional custom API parameters.

        Returns:
            The JSON response from Tavily as a Python dict.
        """
        # Build request payload
        payload = {
            "query": query,
            "search_depth": search_depth,
            "topic": topic,
            "time_range": time_range,
            "days": days if topic == "news" else None,
            "max_results": max_results,
            "include_answer": include_answer,
        }
        # Merge extra kwargs and filter None values
        payload.update(kwargs)
        payload = {k: v for k, v in payload.items() if v is not None}

        # Enforce timeout cap
        timeout = min(timeout, 120)

        results = self.client.search(**payload, timeout=timeout)
        print(results)
        return results
