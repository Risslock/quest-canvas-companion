"""In-memory data repository with JSON persistence.

Mirrors the React MockStore: an observable in-memory store seeded with
Earthdawn content and persisted to a local JSON file so state survives
restarts during development. Swap this for a Supabase/Postgres-backed
DataRepository later without touching the UI.
"""
from __future__ import annotations

import json
import os
import uuid
from typing import Optional

from .interfaces import (
    Campaign,
    Character,
    DataRepository,
    Message,
    Session,
    Thread,
)
from .seed import build_seed


STATE_FILE = os.environ.get("RPC_STATE_FILE", os.path.join(os.path.dirname(__file__), "..", "state.json"))


def _nid(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:8]}"


class MockRepository(DataRepository):
    def __init__(self) -> None:
        self._campaigns: dict[str, Campaign] = {}
        self._characters: dict[str, Character] = {}
        self._threads: dict[str, Thread] = {}
        self._messages: dict[str, Message] = {}
        self._sessions: dict[str, Session] = {}
        if os.path.exists(STATE_FILE):
            self._load()
        else:
            self._seed()
            self._save()

    # -- persistence -------------------------------------------------------- #
    def _seed(self) -> None:
        data = build_seed()
        for c in data["campaigns"]:
            self._campaigns[c.id] = c
        for ch in data["characters"]:
            self._characters[ch.id] = ch
        for t in data["threads"]:
            self._threads[t.id] = t
        for m in data["messages"]:
            self._messages[m.id] = m
        for s in data["sessions"]:
            self._sessions[s.id] = s

    def _save(self) -> None:
        payload = {
            "campaigns": [vars(x) for x in self._campaigns.values()],
            "characters": [vars(x) for x in self._characters.values()],
            "threads": [vars(x) for x in self._threads.values()],
            "messages": [vars(x) for x in self._messages.values()],
            "sessions": [vars(x) for x in self._sessions.values()],
        }
        with open(STATE_FILE, "w", encoding="utf-8") as fh:
            json.dump(payload, fh, indent=2)

    def _load(self) -> None:
        with open(STATE_FILE, encoding="utf-8") as fh:
            payload = json.load(fh)
        self._campaigns = {x["id"]: Campaign(**x) for x in payload["campaigns"]}
        self._characters = {x["id"]: Character(**x) for x in payload["characters"]}
        self._threads = {x["id"]: Thread(**x) for x in payload["threads"]}
        self._messages = {x["id"]: Message(**x) for x in payload["messages"]}
        self._sessions = {x["id"]: Session(**x) for x in payload["sessions"]}

    # -- reads -------------------------------------------------------------- #
    def campaigns(self) -> list[Campaign]:
        return list(self._campaigns.values())

    def characters(self, campaign_id: str) -> list[Character]:
        return [c for c in self._characters.values() if c.campaign_id == campaign_id]

    def get_character(self, character_id: str) -> Optional[Character]:
        return self._characters.get(character_id)

    def threads(self, character_id: str) -> list[Thread]:
        return [t for t in self._threads.values() if t.character_id == character_id]

    def messages(self, thread_id: str) -> list[Message]:
        return [m for m in self._messages.values() if m.thread_id == thread_id]

    def sessions(self, campaign_id: str) -> list[Session]:
        return [s for s in self._sessions.values() if s.campaign_id == campaign_id]

    def get_session(self, session_id: str) -> Optional[Session]:
        return self._sessions.get(session_id)

    # -- writes ------------------------------------------------------------- #
    def create_thread(self, character_id: str, topic: str) -> Thread:
        t = Thread(id=_nid("thr"), character_id=character_id, topic=topic)
        self._threads[t.id] = t
        self._save()
        return t

    def add_message(self, thread_id: str, role: str, content: str) -> Message:
        m = Message(id=_nid("msg"), thread_id=thread_id, role=role, content=content)
        self._messages[m.id] = m
        self._save()
        return m

    def update_session(self, session: Session) -> None:
        self._sessions[session.id] = session
        self._save()
