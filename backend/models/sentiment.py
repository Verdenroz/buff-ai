from pydantic import BaseModel
from typing import List


class KeyPoint(BaseModel):
    point: str
    url: str


class SentimentResponse(BaseModel):
    sentiment_score: float
    key_points: List[KeyPoint]