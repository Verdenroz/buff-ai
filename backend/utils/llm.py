import os
from typing import TypeVar, Type

from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)


class LLM:
    def __init__(self, model_name: str = "gemini-2.0-flash"):
        """
        Initialize the LLM with Google's Gemini API

        Args:
            model_name: The Gemini model to use
        """
        load_dotenv()
        self.model_name = model_name
        self.client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        self.generation_config = {
            "temperature": 0.3,
            "top_p": 0.95,
            "top_k": 40,
        }

    def generate(self, system: str, prompt: str, **kwargs) -> str:
        """Generate a response from the LLM using the provided system and prompt."""
        generation_config = {**self.generation_config, **kwargs}

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system,
                **generation_config
            )
        )

        return response.text

    def generate_structured(
            self,
            system: str,
            prompt: str,
            output: Type[T],
    ) -> T:
        """Generate structured output using a Pydantic model schema."""
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=output,
                system_instruction=system,
                **self.generation_config
            )
        )

        try:
            # Use the parsed response if available
            if hasattr(response, "parsed") and response.parsed:
                return response.parsed
            # Otherwise manually parse the JSON
            return output.model_validate_json(response.text)
        except Exception as e:
            raise ValueError(f"Failed to parse structured response: {e}\nResponse: {response.text}")
