"""Single place to wire active providers.

To go live, replace any mock with a real implementation here -- the UI
never changes. Example:

    from .openai_chat import OpenAIChat
    chat: ChatProvider = OpenAIChat(model="gpt-4o-mini")
"""
from __future__ import annotations

from dataclasses import dataclass

from .interfaces import (
    AuthProvider,
    ChatProvider,
    DataRepository,
    ImageProvider,
    SummaryProvider,
)
from .mock_providers import MockAuth, MockChat, MockImage, MockSummary
from .store import MockRepository


@dataclass
class Services:
    auth: AuthProvider
    chat: ChatProvider
    summary: SummaryProvider
    image: ImageProvider
    repo: DataRepository


def build_services() -> Services:
    return Services(
        auth=MockAuth(),
        chat=MockChat(),
        summary=MockSummary(),
        image=MockImage(),
        repo=MockRepository(),
    )
