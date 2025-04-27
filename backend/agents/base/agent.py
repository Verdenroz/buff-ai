from typing import Callable, List, Optional

from google.genai import types

from utils.llm import LLM


class Agent:
    """
    Base class for agents using Google Gemini with automatic function calling (Python only).
    Pass Python functions directly as tools; the SDK will handle invocation, execution, and response composition.
    """

    def __init__(
            self,
            llm: LLM = LLM(),
            tools: Optional[List[Callable]] = None,
            automatic_function_calling: bool = True,
    ):
        """
        Initialize the Agent.

        Args:
            llm: An instance of the LLM wrapper for Gemini.
            tools: A list of Python functions (with type hints and docstrings) to expose to the model.
            automatic_function_calling: Whether the SDK should auto-execute those functions.
        """
        self.llm = llm
        self.client = llm.client
        self.model_name = llm.model_name
        self.tools = tools or []

        # Configure automatic function calling
        func_call_config = types.AutomaticFunctionCallingConfig(
            disable=not automatic_function_calling
        )
        self.config = types.GenerateContentConfig(
            tools=self.tools,
            automatic_function_calling=func_call_config,
        )

    async def invoke(self, prompt: str, system: Optional[str] = None) -> str:
        """
        Execute the agent: send a user prompt and return the final text response.
        The SDK will detect and invoke any function calls as needed.

        Args:
            prompt: The user prompts to the agent.
            system: Optional system instruction.

        Returns:
            The final text response from the model, with any tool results incorporated.
        """
        contents = []
        if system:
            contents.append(types.Content(role="system", parts=[types.Part(text=system)]))
        contents.append(types.Content(role="user", parts=[types.Part(text=prompt)]))

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=contents,
            config=self.config,
        )
        return response.text or ""
