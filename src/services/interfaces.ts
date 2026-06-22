// Provider-agnostic service contracts ("the seams").
//
// Every external capability the product needs is expressed as a small,
// explicit interface here. The app only ever depends on these contracts —
// never on a concrete backend, auth, AI, or image provider. Swapping the
// mock adapters for real providers later means implementing these interfaces
// in one place (see ./provider.tsx) without touching any screen.

import type {
  AppState,
  Campaign,
  Character,
  ChatMessage,
  ChatThread,
  GeneratedImage,
  ImageKind,
  Session,
  User,
} from "./types";

export interface AuthProvider {
  getCurrentUser(): User | null;
  signIn(email: string, password: string): Promise<User>;
  signUp(input: { name: string; email: string; password: string; role: User["role"] }): Promise<User>;
  signOut(): Promise<void>;
}

export interface DataRepository {
  getState(): AppState;
  subscribe(listener: () => void): () => void;

  createCampaign(input: { name: string; description: string; setting: string }): Campaign;

  createCharacter(
    input: Omit<Character, "id" | "createdAt">,
  ): Character;
  updateCharacter(id: string, patch: Partial<Character>): void;

  createThread(characterId: string, title: string): ChatThread;
  appendMessage(input: Omit<ChatMessage, "id" | "createdAt">): ChatMessage;
  updateMessage(id: string, patch: Partial<ChatMessage>): void;

  createSession(input: { campaignId: string; title: string; scheduledFor?: string }): Session;
  updateSession(id: string, patch: Partial<Session>): void;

  saveImage(input: Omit<GeneratedImage, "id" | "createdAt">): GeneratedImage;
}

/** Streams an in-character reply token-by-token. */
export interface ChatProvider {
  streamReply(
    character: Character,
    history: ChatMessage[],
    userMessage: string,
  ): AsyncIterable<string>;
}

export interface SummaryProvider {
  streamSummary(session: Session): AsyncIterable<string>;
}

export interface ImageProvider {
  generate(prompt: string, kind: ImageKind): Promise<{ url: string }>;
}

export interface Services {
  auth: AuthProvider;
  data: DataRepository;
  ai: ChatProvider;
  summary: SummaryProvider;
  images: ImageProvider;
}
