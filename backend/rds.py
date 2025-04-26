import json
import logging
import os
from typing import Any, List, Optional, TypeVar

from dotenv import load_dotenv
from redis import Redis

from models.post import Post

T = TypeVar('T')


class RedisHandler:
    def __init__(self, url: Optional[str] = None):
        """
        Initialize Redis connection using URL from environment or passed parameter
        """
        load_dotenv()
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

    def save_post(self, post: Post) -> bool:
        """Save a Post object to Redis"""
        key = f"trump:{post.date}"
        return self.set(key, post.model_dump_json(), expiry=30 * 24 * 60 * 60)  # 30 days

    def get_recent_trump_posts(self) -> List[Post]:
        """Get the most recent Trump posts from Redis"""
        pattern = "trump:*"
        keys = self.redis.keys(pattern)

        posts = []
        for key in keys:
            post_data = json.loads(self.get(key))
            post = Post.model_validate(post_data)
            if post:
                posts.append(post)

        # Sort posts by timestamp (descending)
        print(posts)
        return sorted(posts, key=lambda x: x.date, reverse=True)
