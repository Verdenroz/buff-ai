import json
import os
from typing import List, Dict, Any

from dotenv import load_dotenv
from pydantic import BaseModel
from tenacity import retry, wait_fixed, stop_after_attempt, retry_if_exception_type

from utils.llm import LLM


class RelevanceResponse(BaseModel):
    is_relevant: bool


class ApiRateLimitError(Exception):
    """Exception raised when API rate limit is hit"""
    pass


class TrumpPostFilter:
    def __init__(self, input_path: str = "output/filtered_posts.json", output_path: str = "output/filtered_further_posts.json"):
        """
        Filter Trump posts for financial/economic content

        Args:
            input_path: Path to the JSON file with all Trump posts
            output_path: Path to save the filtered posts
        """
        self.input_path = input_path
        self.output_path = output_path
        self.llm = LLM()

    def load_posts(self) -> List[Dict[str, Any]]:
        """Load posts from the JSON file"""
        if not os.path.exists(self.input_path):
            print(f"Input file not found: {self.input_path}")
            return []

        try:
            with open(self.input_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            print(f"Error decoding JSON from {self.input_path}")
            return []

    def save_filtered_posts(self, posts: List[Dict[str, Any]]) -> None:
        """Save filtered posts to output JSON file"""
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        with open(self.output_path, 'w', encoding='utf-8') as f:
            json.dump(posts, f, indent=2)
        print(f"Saved {len(posts)} filtered posts to {self.output_path}")

    @retry(
        retry=retry_if_exception_type(Exception),
        wait=wait_fixed(30),
        stop=stop_after_attempt(2)
    )
    def is_finance_related(self, post_content: str) -> bool:
        """
        Check if post is related to finance, economics, or stocks
        """
        system_prompt = """
        You are an expert financial analyst specializing in stock markets and international trade. 
        Your task is to determine if the provided text specifically relates to:
        1. Stock markets (indexes, individual stocks, market trends, investor sentiment)
        2. Tariffs and trade policies (import/export taxes, trade agreements, sanctions)
        3. Economic policies that directly affect stock markets or tariffs
        4. Market reactions to economic policies (e.g. buying/selling stocks based on tariffs)
        5. Comments about taking action on financial institutions or stock exchanges

        Only mark content as relevant if it directly discusses these specific topics.

        Respond with ONLY a clean, properly formatted JSON object: {"is_relevant": true/false}
        No additional text, comments, or whitespace before or after the JSON.
        """

        user_prompt = f"""
        Here is a social media post. Determine if it's specifically related to stock markets or tariffs:

        "{post_content}"

        Return ONLY {{"is_relevant": true}} if related to stock markets or tariffs, or {{"is_relevant": false}} if not.
        Examples of relevant content:
        - Discussion of stock prices, market performance, or specific companies' stock
        - Discussion of tariffs, import/export taxes, or trade agreements
        - References to market reactions to economic policies
        - Comments about stock market indices like Dow Jones, S&P 500, or NASDAQ

        Return false for general economic topics that don't specifically mention stock markets or tariffs.
        """
        response = self.llm.generate_structured(
            system=system_prompt,
            prompt=user_prompt,
            output=RelevanceResponse
        )
        return response.is_relevant


    def filter_posts(self) -> List[Dict[str, Any]]:
        """Filter posts for financial/economic content"""
        posts = self.load_posts()
        if not posts:
            return []

        filtered_posts = []
        total_posts = len(posts)

        # Create a backup file path for saving progress
        backup_path = self.output_path.replace('.json', '_backup.json')

        for i, post in enumerate(posts):
            content = post.get("content", "")
            if not content:
                continue

            print(f"Analyzing post {i + 1}/{total_posts}: {content[:50]}...")

            try:
                is_relevant = self.is_finance_related(content)

                if is_relevant:
                    print(f"✓ RELEVANT: {content[:100]}...")
                    filtered_posts.append(post)
                else:
                    print("✗ Not relevant")

                # Save progress every 10 posts
                if filtered_posts and (i + 1) % 10 == 0:
                    with open(backup_path, 'w', encoding='utf-8') as f:
                        json.dump(filtered_posts, f, indent=2)
                    print(f"Saved progress: {len(filtered_posts)} posts")

            except Exception as e:
                print(f"Error processing post: {e}")
                # Save progress so far in case of crash
                if filtered_posts:
                    with open(backup_path, 'w', encoding='utf-8') as f:
                        json.dump(filtered_posts, f, indent=2)
                    print(f"Saved progress after error: {len(filtered_posts)} posts")

        return filtered_posts


def main():
    filter = TrumpPostFilter()
    filtered_posts = filter.filter_posts()
    filter.save_filtered_posts(filtered_posts)
    print(f"Found {len(filtered_posts)} posts related to finance/economics")


if __name__ == "__main__":
    load_dotenv()
    main()
