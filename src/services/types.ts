// Domain types for the Earthdawn companion.
// Deliberately light/freeform now (stats as a flexible record) so structured
// Earthdawn mechanics can be layered on later without migrations.

export type UserRole = "gm" | "player";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type CharacterKind = "pc" | "npc";
export type Disposition = "ally" | "hostile" | "neutral";

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
  /** Freeform Earthdawn stats — expand into structured fields later. */
  stats: Record<string, string | number>;
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
}
