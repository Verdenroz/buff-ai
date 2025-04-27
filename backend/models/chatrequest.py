from typing import List, Dict, Optional

from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    ticker: Optional[str] = None
    history: List[Dict[str, str]] = []