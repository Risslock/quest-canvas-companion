"""Mock provider implementations.

These deliberately need NO API keys so the app runs out of the box.
Each one implements the matching interface; replace any single class in
`registry.py` with a real provider when ready.
"""
from __future__ import annotations

import os
import random
import textwrap
import time
import uuid
from typing import Iterator

from .interfaces import (
    AuthProvider,
    ChatProvider,
    Character,
    ImageProvider,
    Message,
    Session,
    SummaryProvider,
    User,
)


class MockAuth(AuthProvider):
    def sign_in(self, email: str, password: str) -> User:
        role = "gm" if "gm" in email.lower() else "player"
        return User(id=f"usr_{uuid.uuid4().hex[:8]}", email=email,
                    display_name=email.split("@")[0].title(), role=role)

    def sign_up(self, email: str, password: str, display_name: str, role: str) -> User:
        return User(id=f"usr_{uuid.uuid4().hex[:8]}", email=email,
                    display_name=display_name or email.split("@")[0].title(),
                    role=role or "player")


class MockChat(ChatProvider):
    """Streams an in-character reply word by word to mimic an LLM stream.

    Swap for a real provider by implementing `stream_reply` against
    OpenAI/Anthropic/local models. The character's persona fields are the
    system prompt material.
    """

    _FLAVOR = [
        "The astral currents whisper of this.",
        "Mark my words, name-giver.",
        "I have weathered worse than this.",
        "Barsaive remembers what we forget.",
        "Speak plainly, and I shall answer plainly.",
    ]

    def _persona_line(self, ch: Character) -> str:
        bits = []
        if ch.tone:
            bits.append(ch.tone.rstrip("."))
        if ch.personality:
            bits.append(ch.personality.split(".")[0])
        return "; ".join(bits) if bits else "an Earthdawn adept"

    def stream_reply(self, character: Character, history: list[Message], user_text: str) -> Iterator[str]:
        reply = (
            f"*({character.name}, {self._persona_line(character)})* "
            f"You ask: \u201c{user_text.strip()}\u201d. "
            f"{random.choice(self._FLAVOR)} "
            f"I weigh your words as I would weigh true-earth. "
            f"Here is what I would do, were the choice mine to make."
        )
        acc = ""
        for word in reply.split(" "):
            acc += word + " "
            time.sleep(0.025)
            yield acc.strip()


class MockSummary(SummaryProvider):
    def summarize(self, session: Session) -> str:
        body = (session.notes or session.plan or "").strip()
        if not body:
            return "_No notes yet to summarize._"
        first = textwrap.shorten(body, width=220, placeholder=" \u2026")
        return (
            f"**Session recap \u2014 {session.title}**\n\n"
            f"- {first}\n"
            f"- Key beats were resolved and consequences set in motion.\n"
            f"- Threads left open for next session: unresolved tensions and a lingering threat.\n\n"
            f"_Auto-generated summary (mock). Plug a real SummaryProvider for richer recaps._"
        )


class MockImage(ImageProvider):
    """Renders a deterministic parchment-styled placeholder via PIL.

    Replace with a real ImageProvider (SDXL, DALL-E, Flux, ...) returning a
    saved file path.
    """

    def generate(self, prompt: str, style: str) -> str:
        from PIL import Image, ImageDraw, ImageFont

        seed = abs(hash(prompt + style)) % (2**32)
        rnd = random.Random(seed)
        w, h = 768, 512
        base = (244, 236, 216)  # vellum
        img = Image.new("RGB", (w, h), base)
        draw = ImageDraw.Draw(img, "RGBA")

        # arcane sigil rings
        gold = (201, 162, 39)
        crimson = (139, 26, 26)
        cx, cy = w // 2, h // 2
        for i in range(6):
            r = 40 + i * 32
            col = gold if i % 2 == 0 else crimson
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col + (90,), width=2)
        for _ in range(36):
            a = rnd.uniform(0, 6.283)
            r = rnd.uniform(40, 220)
            x, y = cx + r * __import__("math").cos(a), cy + r * __import__("math").sin(a)
            draw.line([cx, cy, x, y], fill=gold + (40,), width=1)

        # caption
        ink = (43, 33, 24)
        try:
            font = ImageFont.truetype("DejaVuSerif.ttf", 22)
            small = ImageFont.truetype("DejaVuSerif.ttf", 15)
        except Exception:
            font = ImageFont.load_default()
            small = font
        draw.rectangle([0, h - 88, w, h], fill=(43, 33, 24, 220))
        wrapped = textwrap.fill(prompt.strip() or "Untitled vision", width=58)
        draw.multiline_text((20, h - 80), wrapped, font=small, fill=(244, 236, 216))
        draw.text((20, 16), f"\u2724 Forge of Visions \u2014 {style}", font=font, fill=ink)

        out_dir = os.environ.get("RPC_IMG_DIR", os.path.join(os.path.dirname(__file__), "..", "generated"))
        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, f"vision_{uuid.uuid4().hex[:8]}.png")
        img.save(path)
        return path
