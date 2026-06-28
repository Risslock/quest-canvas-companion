import type {
  ChatProvider,
  ImageProvider,
  KnowledgeProvider,
  PlannerProvider,
  RuleCitation,
  SummaryProvider,
} from "./interfaces";
import { mockImagePool } from "./seed";
import type {
  Character,
  ChatMessage,
  ImageKind,
  KnowledgeSource,
  Session,
} from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Splits text into tokens that include their trailing whitespace. */
function tokenize(text: string): string[] {
  return text.match(/\S+\s*/g) ?? [text];
}

async function* streamText(text: string, perToken = 22): AsyncIterable<string> {
  for (const token of tokenize(text)) {
    await sleep(perToken + Math.random() * 30);
    yield token;
  }
}

function craftReply(character: Character, userMessage: string): string {
  const msg = userMessage.toLowerCase();
  const intro = (() => {
    if (/fear|afraid|scared|danger/.test(msg)) return "fear";
    if (/feel|think|believe|opinion/.test(msg)) return "feel";
    if (/plan|do|next|should|how/.test(msg)) return "plan";
    if (/who|what.*you|tell me about|background|past/.test(msg)) return "past";
    return "default";
  })();

  const lines: Record<string, Record<string, string>> = {
    "Korgath the Unbroken": {
      fear: "Fear is weather. It passes over stone and leaves the stone unchanged. We move when it has spent itself, not before.",
      feel: "I feel the weight of the mountain in me, and the mountain has no use for haste. What must be done, we will do.",
      plan: "We go carefully. I take the front. Mark every passage, trust nothing this place offers freely, and keep the Windling close — her sight reaches where ours fails.",
      past: "I am Obsidiman, born of a Liferock in the Twilight Peaks. I left my Brotherhood for a debt of blood. Until it is paid, I am not whole.",
      default: "Speak plainly and I will answer the same. Stone keeps no secrets it does not have to.",
    },
    "Zephyrine Whisper": {
      fear: "Oh, I'm *terrified* — isn't it wonderful? The dead are loudest where the living are most afraid. Let's listen before we run, hmm?",
      feel: "I feel threads. Everything here is tied to something else, and someone has been pulling them very gently for a very long time.",
      plan: "Let me drift ahead and taste the astral. If a thing wears a kaer like a coat, it leaves seams. Find the seams, and we find the throat.",
      past: "I left the Blood Wood when I saw the price of its thorns. Now I trade questions with spirits — they always answer, though rarely kindly.",
      default: "Ask me something the dead would know. Those are the only answers worth having down here.",
    },
    "Thrakka Vol": {
      fear: "A Swordmaster does not flee — he *withdraws with flourish*. But not today. My blade has been bored for a week.",
      feel: "I feel that honor is in short supply in this kaer, and I intend to import some at the point of my rapier.",
      plan: "We announce ourselves. Cowards strike from shadow; we are not cowards. Let whatever rules here see who has come to unseat it.",
      past: "I was heir to a riverboat House until pride — mine and my father's — cast me out. I will earn my clan-name back or die with a story worth telling.",
      default: "Make it a worthy question, friend. I answer worthy questions with worthy words.",
    },
    "Vhalon the Merchant": {
      fear: "Frightened? Me? I'm a businessman. I simply recalculate the odds and adjust my prices accordingly.",
      feel: "I feel that everyone in this kaer wants something, and a man who learns what people want never goes hungry.",
      plan: "Here's my counsel, free of charge — which should tell you how nervous I am: talk first, draw steel last, and let me do the talking.",
      past: "Caravans, mostly. Throal to Bartertown and back. I owe a favor I'd rather not name to someone you'd rather not meet. But that's tomorrow's ledger.",
      default: "Everything's negotiable, friend. Tell me what you need and we'll find a price we both pretend to be unhappy with.",
    },
    "The Blight-Walker": {
      fear: "Oh, don't be afraid. They were afraid too, at first. Now look how peaceful they are. Stay. I'll keep you so very safe.",
      feel: "I feel such *love* for the little ones who stayed. I kept them whole. Isn't that what a god is for?",
      plan: "You needn't plan, dear traveler. Plans are such a tiring habit of the living. Set them down. Let me decide what comes next.",
      past: "I slipped a ward, once, long ago, when the sky was screaming. They opened their arms to me. I have never let go.",
      default: "Hush now. Come closer. There is room in my congregation for one more believer.",
    },
  };

  const byChar = lines[character.name];
  if (byChar) return byChar[intro] ?? byChar.default;

  // Generic fallback shaped by the character's declared tone.
  return `*(${character.tone})* As ${character.name}, a ${character.race} ${character.discipline}, I'd answer: this is a thread of my story, and your words just pulled it. Ask, and I will respond in kind.`;
}

export const mockChatProvider: ChatProvider = {
  async *streamReply(character: Character, _history: ChatMessage[], userMessage: string) {
    await sleep(350);
    yield* streamText(craftReply(character, userMessage));
  },
};

export const mockSummaryProvider: SummaryProvider = {
  async *streamSummary(session: Session) {
    await sleep(400);
    const notes = session.notes.trim();
    const body = notes
      ? `**${session.title} — Recap**\n\nThe party's path through this chapter wound toward consequence. ${condense(
          notes,
        )}\n\n**Threads left dangling**\n- A choice was deferred, not avoided.\n- Someone's loyalty is no longer certain.\n- The kaer remembers what was done here.`
      : `**${session.title}**\n\nNo notes were recorded for this session yet. Jot a few beats in the live notes and I'll weave them into a proper chronicle.`;
    yield* streamText(body, 14);
  },
};

function condense(notes: string): string {
  const sentences = notes
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 2) return notes;
  return `${sentences.slice(0, 2).join(" ")} In the end, ${sentences[sentences.length - 1]
    .charAt(0)
    .toLowerCase()}${sentences[sentences.length - 1].slice(1)}`;
}

export const mockImageProvider: ImageProvider = {
  async generate(_prompt: string, _kind: ImageKind) {
    // Simulate generation latency, then resolve to a piece from the art pool.
    await sleep(1600 + Math.random() * 1400);
    const url = mockImagePool[Math.floor(Math.random() * mockImagePool.length)];
    return { url };
  },
};
