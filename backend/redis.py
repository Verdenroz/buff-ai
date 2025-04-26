import json
import logging
import os
from typing import Any, List, Optional, TypeVar, Dict

from models.post import Post
from redis import Redis

T = TypeVar('T')


class RedisHandler:
    def __init__(self, url: Optional[str] = None):
        """
        Initialize Redis connection using URL from environment or passed parameter
        """
        redis_url = url or os.environ.get('REDIS_URL')
        if not redis_url:
            raise ValueError("Redis URL not provided and REDIS_URL environment variable not set")

        self.redis = Redis.from_url(redis_url)
        self.logger = logging.getLogger(__name__)

    def set(self, key: str, value: Any, expiry: Optional[int] = None) -> bool:
        """
        Set a value in Redis with optional expiration time in seconds
        Returns True if successful
        """
        try:
            serialized = json.dumps(value)
            result = self.redis.set(key, serialized, ex=expiry)
            return bool(result)
        except Exception as e:
            self.logger.error(f"Error setting Redis key {key}: {e}")
            return False

    def get(self, key: str, default: Optional[T] = None) -> Optional[Any]:
        """
        Get a value from Redis, return default if not found
        """
        try:
            value = self.redis.get(key)
            if value is None:
                return default
            return json.loads(value)
        except Exception as e:
            self.logger.error(f"Error getting Redis key {key}: {e}")
            return default

    def delete(self, key: str) -> int:
        """Delete a key from Redis, returns number of keys removed"""
        return self.redis.delete(key)

    def exists(self, key: str) -> bool:
        """Check if a key exists in Redis"""
        return bool(self.redis.exists(key))

    def save_new_trump_posts(self, posts: List[Post]) -> List[Dict[str, Any]]:
        """
        Save new Trump posts to Redis and return only the new ones
        Each post should have a unique 'id' field
        Posts will be stored with key format 'trump_post:{id}'
        """
        if not posts:
            return []

        new_posts = []

        # Process posts in reverse order (oldest first) to properly handle cutoff
        for post in reversed(posts):
            post_key = post.date
            if not post_key:
                self.logger.warning(f"Post missing ID field: {post}")
                continue

            key = f"trump:{post_key}"

            # If post already exists, stop processing (found previous post)
            if self.exists(key):
                break

            # Save the post and add to new posts list
            self.set(key, post, expiry=30 * 24 * 60 * 60)  # Set expiry to 30 days
            new_posts.append(post)

        # Return new posts in original order (newest first)
        return list(reversed(new_posts))

    def get_recent_trump_posts(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get the most recent Trump posts from Redis"""
        pattern = "trump:*"
        keys = self.redis.keys(pattern)

        posts = []
        for key in keys[:limit]:
            post_data = self.get(key)
            if post_data:
                posts.append(post_data)

        # Sort posts by timestamp (descending)
        return sorted(posts, key=lambda x: x.get('date', ''), reverse=True)
