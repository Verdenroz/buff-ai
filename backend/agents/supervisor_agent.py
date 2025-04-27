import asyncio
from typing import Dict, Literal, List, Optional, Any, AsyncGenerator

from pydantic import BaseModel

from agents.fundamentals_agent import FundamentalsAgent
from agents.sentiment_agent import SentimentAgent
from agents.trading_strategy_agent import TradingStrategyAgent
from models.chatrequest import ChatRequest
from utils.llm import LLM


class ChatResponse(BaseModel):
    response: str


class RoutingDecision(BaseModel):
    agents: List[Literal['fundamentals', 'sentiment', 'trading']]
    ticker: Optional[str]
    question: Optional[str]


class SupervisorAgent:
    """
    Routes each ChatRequest by querying the LLM for routing instructions,
    then invokes multiple agents concurrently and returns all their responses.
    """

    def __init__(self, llm: LLM = LLM()):
        self.llm = llm
        # Sub-agents share the same LLM
        self.fundamentals = FundamentalsAgent(llm=self.llm)
        self.sentiment = SentimentAgent(llm=self.llm)
        self.trading = TradingStrategyAgent(llm=self.llm)

    async def handle(self, request: ChatRequest) -> ChatResponse:
        # decide which agents to run and extract ticker/question
        system_prompt = (
            "You are a supervisor that routes user requests to specialized agents:\n"
            "- fundamentals for core metrics and comparisons\n"
            "- sentiment for news sentiment analysis\n"
            "- trading for strategy recommendations\n"
            "Given the following user message and chat history, identify which agents should handle it, "
            "and extract a ticker symbol if present, along with the core question. "
            "Respond in JSON with keys: agents (list), ticker (string or null), question (string or null)."
        )
        # Combine history and latest message
        full_conversation = "".join(
            f"{turn['role']}: {turn['message']}\n" for turn in request.history
        ) + f"user: {request.message}"

        # Use structured generation for routing
        decision: RoutingDecision = self.llm.generate_structured(
            system=system_prompt,
            prompt=full_conversation,
            output=RoutingDecision
        )
        print("Routing decision:", decision)
        # Prepare and run selected agents concurrently
        tasks: List[Any] = []
        results_map: Dict[str, str] = {}
        ticker = decision.ticker or ""
        question = decision.question or request.message

        for agent_key in decision.agents:
            if agent_key == 'fundamentals':
                tasks.append(
                    self.fundamentals.analyze(ticker=ticker, question=question)
                )
            elif agent_key == 'sentiment':
                tasks.append(
                    self.sentiment.invoke(ticker)
                )
            elif agent_key == 'trading':
                tasks.append(
                    self.trading.invoke(ticker)
                )

        raw_outputs = await asyncio.gather(*tasks, return_exceptions=True)
        for key, output in zip(decision.agents, raw_outputs):
            if isinstance(output, Exception):
                results_map[key] = f"**{key}** error: {output}"
            else:
                # Keep raw text for summarization
                results_map[key] = output.strip()

        # Synthesize final response via LLM
        summary_system = (
            "You are a supervisor that consolidates agent outputs into a concise, user-friendly Markdown report."
        )
        # Build prompt listing each agent's output
        prompt_parts = [f"### {key.capitalize()} Agent Output:\n{text}" for key, text in results_map.items()]
        summary_prompt = (
                f"User asked: {request.message}\n\n" + "\n\n".join(prompt_parts) +
                "\n\nGenerate a final answer in Markdown that addresses the user's request, synthesizes relevant data, and is concise."
        )
        final_md = self.llm.generate(system=summary_system, prompt=summary_prompt)

        return ChatResponse(response=final_md)

    async def handle_stream(self, request: ChatRequest) -> AsyncGenerator[str, Any]:
        # Ask LLM to decide which agents to run and extract ticker/question
        system_prompt = (
            "You are a supervisor that routes user requests to specialized agents:\n"
            "- fundamentals for core metrics and comparisons\n"
            "- sentiment for news sentiment analysis\n"
            "- trading for strategy recommendations\n"
            "Given the following user message and chat history, identify which agents should handle it, "
            "and extract a ticker symbol if present, along with the core question. "
            "Respond in JSON with keys: agents (list), ticker (string or null), question (string or null)."
        )
        # Combine history and latest message
        full_conversation = "".join(
            f"{turn['role']}: {turn['message']}\n" for turn in request.history
        ) + f"user: {request.message}"

        # Use structured generation for routing
        decision: RoutingDecision = self.llm.generate_structured(
            system=system_prompt,
            prompt=full_conversation,
            output=RoutingDecision
        )
        print("Routing decision:", decision)
        # Prepare and run selected agents concurrently
        tasks: List[Any] = []
        results_map: Dict[str, str] = {}
        ticker = decision.ticker or ""
        question = decision.question or request.message

        for agent_key in decision.agents:
            if agent_key == 'fundamentals':
                tasks.append(
                    self.fundamentals.analyze(ticker=ticker, question=question)
                )
            elif agent_key == 'sentiment':
                tasks.append(
                    self.sentiment.invoke(ticker)
                )
            elif agent_key == 'trading':
                tasks.append(
                    self.trading.invoke(ticker)
                )

        raw_outputs = await asyncio.gather(*tasks, return_exceptions=True)
        for key, output in zip(decision.agents, raw_outputs):
            if isinstance(output, Exception):
                results_map[key] = f"**{key}** error: {output}"
            else:
                # Keep raw text for summarization
                results_map[key] = output.strip()

        # Synthesize final response via LLM
        summary_system = (
            "You are a supervisor that consolidates agent outputs into a concise, user-friendly Markdown report."
        )
        prompt_parts = [f"### {key.capitalize()} Agent Output:\n{text}" for key, text in results_map.items()]
        summary_prompt = (
                f"User asked: {request.message}\n\n" + "\n\n".join(prompt_parts) +
                "\n\nGenerate a final answer in Markdown that addresses the user's request, synthesizes relevant data, and is concise."
        )

        async for chunk in self.llm.stream(system=summary_system, prompt=summary_prompt):
            yield chunk
