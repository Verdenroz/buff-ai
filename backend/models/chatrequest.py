from typing import List, Dict

from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = []