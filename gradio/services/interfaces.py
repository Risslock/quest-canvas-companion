"""Provider-agnostic interfaces for the Roleplaying Companion.

Every external capability (auth, chat LLM, summaries, image generation,
persistence) is defined here as an abstract base class. The UI only ever
talks to these interfaces, so swapping a mock for a real provider
(OpenAI, Anthropic, local llama.cpp, Supabase, S3, ...) is a one-file
change in `registry.py` -- no UI code touched.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Iterator, Optional


# --------------------------------------------------------------------------- #
# Domain models                                                               #
# --------------------------------------------------------------------------- #
@dataclass
class User:
    id: str
    email: str
    display_name: str
    role: str  # "gm" | "player"


@dataclass
class Campaign:
    id: str
    name: str
    blurb: str
    system: str = "Earthdawn 4e"


@dataclass
class Character:
    id: str
    campaign_id: str
    name: str
    kind: str  # "pc" | "npc"
    description: str = ""
    personality: str = ""
    background: str = ""
    tone: str = ""
    portrait_path: Optional[str] = None
    stats: dict = field(default_factory=dict)  # freeform Earthdawn data


@dataclass
class Thread:
    id: str
    character_id: str
    topic: str


@dataclass
class Message:
    id: str
    thread_id: str
    role: str  # "user" | "assistant"
    content: str


@dataclass
class Session:
    id: str
    campaign_id: str
    title: str
    status: str  # "planned" | "active" | "done"
    plan: str = ""
    notes: str = ""
    summary: str = ""


# --------------------------------------------------------------------------- #
# Provider interfaces                                                          #
# --------------------------------------------------------------------------- #
class AuthProvider(ABC):
    @abstractmethod
    def sign_in(self, email: str, password: str) -> User: ...

    @abstractmethod
    def sign_up(self, email: str, password: str, display_name: str, role: str) -> User: ...


class ChatProvider(ABC):
    """Streaming, in-character LLM chat for a digital twin."""

    @abstractmethod
    def stream_reply(
        self, character: Character, history: list[Message], user_text: str
    ) -> Iterator[str]:
        """Yield incremental chunks of the assistant reply."""


class SummaryProvider(ABC):
    @abstractmethod
    def summarize(self, session: Session) -> str: ...


class ImageProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, style: str) -> str:
        """Return a filesystem path to the generated image."""


class DataRepository(ABC):
    """Persistence for campaigns, characters, threads, sessions."""

    @abstractmethod
    def campaigns(self) -> list[Campaign]: ...
    @abstractmethod
    def characters(self, campaign_id: str) -> list[Character]: ...
    @abstractmethod
    def get_character(self, character_id: str) -> Optional[Character]: ...
    @abstractmethod
    def threads(self, character_id: str) -> list[Thread]: ...
    @abstractmethod
    def create_thread(self, character_id: str, topic: str) -> Thread: ...
    @abstractmethod
    def messages(self, thread_id: str) -> list[Message]: ...
    @abstractmethod
    def add_message(self, thread_id: str, role: str, content: str) -> Message: ...
    @abstractmethod
    def sessions(self, campaign_id: str) -> list[Session]: ...
    @abstractmethod
    def get_session(self, session_id: str) -> Optional[Session]: ...
    @abstractmethod
    def update_session(self, session: Session) -> None: ...
