from pydantic import BaseModel


class Post(BaseModel):
    author: str
    content: str
    date: int
    tts: str = ""