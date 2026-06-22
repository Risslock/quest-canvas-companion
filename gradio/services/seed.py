"""Earthdawn 4e seed content (light now, expand later).

`stats` is intentionally a freeform dict so structured Disciplines /
Talents / Karma / attributes can be layered in later without reworking
the schema or the UI.
"""
from __future__ import annotations

from .interfaces import Campaign, Character, Message, Session, Thread


def build_seed() -> dict:
    camp = Campaign(
        id="camp_barsaive",
        name="Shadows over Barsaive",
        blurb="A band of adepts delves the kaer-scarred ruins of the Theran war, "
        "chasing rumors of a Horror that never slept.",
        system="Earthdawn 4e",
    )

    korgath = Character(
        id="char_korgath",
        campaign_id=camp.id,
        name="Korgath the Obsidiman",
        kind="pc",
        description="A mountainous obsidiman Warrior, slow to anger, unbreakable in oath.",
        personality="Stoic, patient, fiercely loyal. Speaks rarely but with weight.",
        background="Carved from the Liferock generations past; seeks to understand the "
        "fleeting urgency of his shorter-lived companions.",
        tone="Measured, earthen, sparing with words.",
        stats={
            "discipline": "Warrior",
            "circle": 4,
            "attributes": {"STR": 18, "TOU": 16, "DEX": 11, "PER": 9, "WIL": 12, "CHA": 8},
            "talents": ["Melee Weapons", "Avoid Blow", "Wood Skin", "Unyielding Stance"],
            "karma": 9,
        },
    )

    zephyrine = Character(
        id="char_zephyrine",
        campaign_id=camp.id,
        name="Zephyrine the Windling",
        kind="pc",
        description="A darting windling Elementalist with a spark for storms and mischief.",
        personality="Quick, curious, irreverent. Hides deep fear of being forgotten.",
        background="Fled a dying kaer on a stolen breeze; collects names like trophies.",
        tone="Bright, rapid, teasing.",
        stats={
            "discipline": "Elementalist",
            "circle": 3,
            "attributes": {"STR": 4, "TOU": 8, "DEX": 16, "PER": 15, "WIL": 14, "CHA": 13},
            "talents": ["Spellcasting", "Patterncraft", "Wind Catcher"],
            "karma": 14,
        },
    )

    vhalon = Character(
        id="char_vhalon",
        campaign_id=camp.id,
        name="Vhalon, Theran Spire-Magus",
        kind="npc",
        description="A silver-tongued Theran agent who trades in secrets and slave-marks.",
        personality="Charming, ruthless, utterly certain of Theran superiority.",
        background="Sent to recover an artifact lost when the Scourge ended.",
        tone="Velvet menace, formal, condescending.",
        stats={"role": "antagonist", "affiliation": "Thera"},
    )

    threads = [
        Thread(id="thr_korgath_oath", character_id=korgath.id, topic="On the nature of his oath"),
        Thread(id="thr_zeph_storm", character_id=zephyrine.id, topic="Planning the storm gambit"),
    ]

    messages = [
        Message(
            id="msg_1",
            thread_id="thr_korgath_oath",
            role="user",
            content="Korgath, why did you swear to protect us?",
        ),
        Message(
            id="msg_2",
            thread_id="thr_korgath_oath",
            role="assistant",
            content="Stone does not choose the river that shapes it. Yet I chose you. "
            "An oath, once carved, does not weather.",
        ),
    ]

    sessions = [
        Session(
            id="sess_kaer",
            campaign_id=camp.id,
            title="Descent into Kaer Vhrist",
            status="planned",
            plan="Open at the sealed kaer door. Three obstacles: the warden construct, "
            "the flooded vault, the Horror-marked archive.",
            notes="",
            summary="",
        ),
        Session(
            id="sess_market",
            campaign_id=camp.id,
            title="The Bartertown Bargain",
            status="done",
            plan="Negotiations with the t'skrang riverboat guild.",
            notes="Party haggled passage downriver; Zephyrine insulted the guildmaster; "
            "Korgath calmed things with a show of strength; Vhalon was spotted in the crowd.",
            summary="",
        ),
    ]

    return {
        "campaigns": [camp],
        "characters": [korgath, zephyrine, vhalon],
        "threads": threads,
        "messages": messages,
        "sessions": sessions,
    }
