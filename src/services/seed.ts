import portraitKorgath from "@/assets/portrait-korgath.jpg";
import portraitZephyrine from "@/assets/portrait-zephyrine.jpg";
import portraitThrakka from "@/assets/portrait-thrakka.jpg";
import portraitVhalon from "@/assets/portrait-vhalon.jpg";
import portraitBlightwalker from "@/assets/portrait-blightwalker.jpg";
import sceneCavern from "@/assets/scene-cavern.jpg";
import sceneAstral from "@/assets/scene-astral.jpg";
import sceneAirship from "@/assets/scene-airship.jpg";

import type { AppState } from "./types";

// Stable ids so seeded relations and deep links survive reloads.
const C = "camp-kaer";
const ch = {
  korgath: "char-korgath",
  zephyrine: "char-zephyrine",
  thrakka: "char-thrakka",
  vhalon: "char-vhalon",
  blight: "char-blight",
};

const DAY = 86_400_000;
const now = Date.UTC(2026, 5, 22);

export function createSeedState(): AppState {
  return {
    currentUserId: "user-gm",
    users: [
      { id: "user-gm", name: "Game Master", email: "gm@storyweaver.dev", role: "gm" },
      {
        id: "user-player",
        name: "Aria",
        email: "aria@storyweaver.dev",
        role: "player",
        characterId: ch.zephyrine,
      },
    ],
    campaigns: [
      {
        id: C,
        name: "The Kaer of Ruin",
        description:
          "A band of adepts ventures into a sealed kaer that never opened after the Scourge — and finds it was sealed from the inside.",
        setting: "Barsaive · The Age of Legend",
        createdAt: now - 40 * DAY,
      },
    ],
    characters: [
      {
        id: ch.korgath,
        campaignId: C,
        kind: "pc",
        name: "Korgath the Unbroken",
        race: "Obsidiman",
        discipline: "Sky Raider",
        circle: 5,
        disposition: "ally",
        description:
          "A mountain given purpose. Korgath fights from the decks of troll airships, axe in hand, the wind screaming around him.",
        personality:
          "Stoic, deliberate, fiercely loyal. Speaks rarely and means every word. Distrusts merchants and quick promises.",
        background:
          "Born of a Liferock in the Twilight Peaks, Korgath left his Brotherhood to repay a life-debt to a troll moot that has long since scattered.",
        tone: "Grave, measured, sparing with words.",
        portraitUrl: portraitKorgath,
        stats: {
          Dexterity: 6,
          Strength: 9,
          Toughness: 8,
          Karma: "12 / 12",
          "Damage Step": 14,
          "Physical Defense": 9,
        },
        createdAt: now - 38 * DAY,
      },
      {
        id: ch.zephyrine,
        campaignId: C,
        kind: "pc",
        name: "Zephyrine Whisper",
        race: "Windling",
        discipline: "Nethermancer",
        circle: 4,
        disposition: "ally",
        description:
          "A palm-sized scholar of the spaces between life and death, trailing violet mist and far too many questions.",
        personality:
          "Curious to a fault, mischievous, secretly tender-hearted. Hides fear behind cleverness.",
        background:
          "Fled the Blood Wood after glimpsing what the Elves did to survive. Now she bargains with spirits for the truths the living refuse to speak.",
        tone: "Quick, lyrical, faintly eerie.",
        portraitUrl: portraitZephyrine,
        stats: {
          Dexterity: 7,
          Perception: 8,
          Willpower: 8,
          Karma: "9 / 16",
          "Spell Defense": 10,
          "Astral Sensing": "Rank 4",
        },
        talents: ["Spellcasting", "Astral Sight", "Spirit Talk", "Thread Weaving"],
        goals: [
          "Learn what the Blood Wood elves truly bargained away",
          "Earn the trust of a spirit that will not lie",
        ],
        relationships: [
          { name: "Korgath the Unbroken", relation: "Reluctant protector" },
          { name: "Vhalon the Merchant", relation: "Owes her a favor" },
        ],
        ownerUserId: "user-player",
        createdAt: now - 37 * DAY,
      },
      {
        id: ch.thrakka,
        campaignId: C,
        kind: "pc",
        name: "Thrakka Vol",
        race: "T'skrang",
        discipline: "Swordmaster",
        circle: 4,
        disposition: "ally",
        description:
          "A duelist of the Serpent River whose blade is an extension of his pride — and his honor.",
        personality:
          "Proud, theatrical, honor-bound. Never backs down from a challenge, never strikes a coward.",
        background:
          "Disowned heir of a riverboat House, Thrakka seeks a deed grand enough to earn his clan-name back.",
        tone: "Flamboyant, honorable, a touch dramatic.",
        portraitUrl: portraitThrakka,
        stats: {
          Dexterity: 9,
          Strength: 6,
          Charisma: 7,
          Karma: "10 / 12",
          "Attack (Melee)": "Rank 6",
          "Physical Defense": 11,
        },
        createdAt: now - 36 * DAY,
      },
      {
        id: ch.vhalon,
        campaignId: C,
        kind: "npc",
        name: "Vhalon the Merchant",
        race: "Human",
        discipline: "Troubadour",
        disposition: "neutral",
        description:
          "A silver-tongued trader who always seems to know which way the wind is turning — and how to profit from it.",
        personality:
          "Affable, shrewd, evasive about debts. Genuinely fond of the party, but fonder of coin.",
        background:
          "Runs caravans between Throal and Bartertown. Owes a dangerous favor to someone the party has not yet met.",
        tone: "Warm, persuasive, slippery.",
        portraitUrl: portraitVhalon,
        stats: { Charisma: 8, Perception: 6, "Haggle": "Rank 7" },
        createdAt: now - 30 * DAY,
      },
      {
        id: ch.blight,
        campaignId: C,
        kind: "npc",
        name: "The Blight-Walker",
        race: "Horror",
        discipline: "—",
        disposition: "hostile",
        description:
          "Something that wore the kaer's people like a cloak and never took it off. It remembers being adored.",
        personality:
          "Patient, possessive, mockingly gentle. Feeds on hope more than fear.",
        background:
          "A lesser Horror that slipped a ward during the Scourge and has ruled the sealed kaer as a benevolent god ever since.",
        tone: "Soft, intimate, deeply wrong.",
        portraitUrl: portraitBlightwalker,
        stats: { "Spell Defense": 14, Willpower: 12, Corruption: "High" },
        createdAt: now - 28 * DAY,
      },
    ],
    threads: [
      {
        id: "thread-korgath-1",
        characterId: ch.korgath,
        title: "On entering the Kaer",
        createdAt: now - 6 * DAY,
        updatedAt: now - 2 * DAY,
      },
      {
        id: "thread-korgath-2",
        characterId: ch.korgath,
        title: "The life-debt",
        createdAt: now - 4 * DAY,
        updatedAt: now - 4 * DAY,
      },
      {
        id: "thread-zephyrine-1",
        characterId: ch.zephyrine,
        title: "What the spirits whisper",
        createdAt: now - 3 * DAY,
        updatedAt: now - 1 * DAY,
      },
    ],
    messages: [
      {
        id: "msg-1",
        threadId: "thread-korgath-1",
        role: "user",
        content:
          "Korgath, the party found traces of corruption in the kaer's water supply. Do you press on?",
        createdAt: now - 2 * DAY,
      },
      {
        id: "msg-2",
        threadId: "thread-korgath-1",
        role: "assistant",
        content:
          "Stone does not flinch from rot; it endures until the rot is cut away.\n\nWe press on. But we drink nothing we did not carry, and we mark every passage we pass. If this place was sealed from within, then someone — or **something** — wished to keep its sickness for itself. I will walk first.",
        createdAt: now - 2 * DAY,
      },
    ],
    sessions: [
      {
        id: "session-1",
        campaignId: C,
        title: "The Sealed Gate",
        status: "done",
        scheduledFor: "2026-06-08",
        plan: "Cold open at the East Gate. The party must solve the ward-lock before nightfall draws the husk-hounds.",
        notes:
          "Players entered through the East Gate. Found corruption in the water. Korgath felt a resonance in his Liferock. Zephyrine spoke with a bound spirit that begged to be 'let out into the dark'.",
        summary:
          "The party discovered the Kaer of Ruin was not abandoned but sealed from the inside. They bypassed the ward-lock and made first camp in the cistern halls. A bound spirit hinted at a presence that 'loves' the kaer's dead. Tension is rising between Korgath and Vhalon over who decides the party's course.",
        createdAt: now - 14 * DAY,
      },
      {
        id: "session-2",
        campaignId: C,
        title: "The Benevolent God",
        status: "planned",
        scheduledFor: "2026-06-29",
        plan: "Reveal the Blight-Walker's 'congregation' — kaer-dwellers who believe they were saved. Force a moral choice: expose the Horror and shatter their faith, or play along to reach the inner sanctum.",
        notes: "",
        createdAt: now - 2 * DAY,
      },
    ],
    images: [
      {
        id: "img-1",
        campaignId: C,
        prompt: "A vast dark cavern with towering glowing blue crystals beneath the kaer",
        url: sceneCavern,
        kind: "scene",
        createdAt: now - 10 * DAY,
      },
      {
        id: "img-2",
        campaignId: C,
        prompt: "The ruined ghost-city of Parlainth under a swirling purple astral storm",
        url: sceneAstral,
        kind: "scene",
        createdAt: now - 9 * DAY,
      },
      {
        id: "img-3",
        campaignId: C,
        prompt: "A crashed magical airship half-buried in jungle vines",
        url: sceneAirship,
        kind: "scene",
        createdAt: now - 8 * DAY,
      },
    ],
  };
}

/** Reusable pool the mock image generator cycles through for new "results". */
export const mockImagePool = [sceneCavern, sceneAstral, sceneAirship];
