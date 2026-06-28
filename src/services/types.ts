// Domain types for StoryWeaver.
// Deliberately light/freeform now (stats as a flexible record, optional
// structured fields) so other game systems and richer mechanics can be
// layered on later without migrations. Earthdawn 4e is the seed system.

export type UserRole = "gm" | "player";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** For players: the PC they control (drives role-based visibility). */
  characterId?: string;
}

export type CharacterKind = "pc" | "npc";
export type Disposition = "ally" | "hostile" | "neutral";

export interface Relationship {
  name: string;
  relation: string;
}

export interface Character {
  id: string;
  campaignId: string;
  kind: CharacterKind;
  name: string;
  race: string;
  discipline: string;
  circle?: number;
  disposition: Disposition;
  description: string;
  personality: string;
  background: string;
  tone: string;
  portraitUrl?: string;
  /** Freeform stats — expand into structured fields later. */
  stats: Record<string, string | number>;
  /** Structured creation fields that make the digital twin smarter. */
  talents?: string[];
  goals?: string[];
  relationships?: Relationship[];
  /** For PCs: which player owns this character. */
  ownerUserId?: string;
  createdAt: number;
}

export interface ChatThread {
  id: string;
  characterId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  threadId: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

export type SessionStatus = "planned" | "active" | "done";

export interface Session {
  id: string;
  campaignId: string;
  title: string;
  status: SessionStatus;
  scheduledFor?: string;
  plan: string;
  notes: string;
  summary?: string;
  createdAt: number;
}

export type ImageKind = "portrait" | "npc" | "scene";

export interface GeneratedImage {
  id: string;
  campaignId: string;
  prompt: string;
  url: string;
  kind: ImageKind;
  characterId?: string;
  createdAt: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  setting: string;
  system?: string;
  createdAt: number;
}

/** Who can see a piece of campaign knowledge. */
export type Visibility = "gm" | "all";

/** A single beat in the campaign's living story timeline. */
export interface TimelineEvent {
  id: string;
  campaignId: string;
  sessionId?: string;
  title: string;
  body: string;
  /** Characters involved — used for player-scoped filtering. */
  characterIds: string[];
  visibility: Visibility;
  /** Ordering timestamp (story chronology). */
  occurredAt: number;
  createdAt: number;
}

export type KnowledgeKind = "rulebook" | "lore" | "houserule";

/** A source the rules / knowledge Q&A can cite. */
export interface KnowledgeSource {
  id: string;
  campaignId: string;
  title: string;
  kind: KnowledgeKind;
  /** GM-only lore never surfaces to players. */
  gmOnly: boolean;
  excerpt: string;
}

/** A logged rules answer with quality scores (0–100). */
export interface EvalRecord {
  id: string;
  campaignId: string;
  question: string;
  faithfulness: number;
  relevance: number;
  accuracy: number;
  createdAt: number;
}

export interface AppState {
  users: User[];
  currentUserId: string | null;
  campaigns: Campaign[];
  characters: Character[];
  threads: ChatThread[];
  messages: ChatMessage[];
  sessions: Session[];
  images: GeneratedImage[];
  timeline: TimelineEvent[];
  knowledge: KnowledgeSource[];
  evals: EvalRecord[];
}
