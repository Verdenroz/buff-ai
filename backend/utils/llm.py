import json
import os
from typing import TypeVar, Type

from groq import AsyncGroq
from groq.types.chat import ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam
from groq.types.chat.completion_create_params import ResponseFormat
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)


class LLM:
    def __init__(self, model_name: str = "meta-llama/llama-4-scout-17b-16e-instruct"):
        self.model_name = model_name
        self.client = AsyncGroq(
            api_key=os.environ.get("GROQ_API_KEY"),
        )

    async def generate(self, system: str, prompt: str, **kwargs) -> str:
        """ Generate a response from the LLM using the provided system and prompt."""
        response = await self.client.chat.completions.create(
            messages=[
                ChatCompletionSystemMessageParam(content=system, role="system"),
                ChatCompletionUserMessageParam(content=prompt, role="user"),
            ],
            model=self.model_name,
            **kwargs
        )
        return response.choices[0].message.content

    async def generate_structured(
            self,
            system: str,
            prompt: str,
            output: Type[T],
    ) -> T:
        """Generate structured output using a Pydantic model."""
        response = await self.client.chat.completions.create(
            messages=[
                ChatCompletionSystemMessageParam(
                    content=system + f"\nThe JSON object must use the schema: {json.dumps(output.model_json_schema(), indent=2)}",
                    role="system"),
                ChatCompletionUserMessageParam(content=prompt, role="user"),
            ],
            model=self.model_name,
            response_format=ResponseFormat(type="json_object"),
        )
        content = response.choices[0].message.content
        return output.model_validate_json(content)
