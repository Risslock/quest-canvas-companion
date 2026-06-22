import type { DataRepository } from "./interfaces";
import { createSeedState } from "./seed";
import type {
  AppState,
  Campaign,
  Character,
  ChatMessage,
  ChatThread,
  GeneratedImage,
  Session,
} from "./types";

const STORAGE_KEY = "barsaive-chronicle.state.v1";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

function loadInitialState(): AppState {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as AppState;
    } catch {
      /* fall through to seed */
    }
  }
  return createSeedState();
}

/**
 * Mock in-memory data store. Implements the DataRepository contract with an
 * immutable, observable state object persisted to localStorage. The whole
 * snapshot is replaced on every mutation, so `useSyncExternalStore` reads
 * remain stable between renders and components can derive slices with useMemo.
 */
class MockStore implements DataRepository {
  private state: AppState = loadInitialState();
  private listeners = new Set<() => void>();

  getState = (): AppState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private setState(next: AppState) {
    this.state = next;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore quota / serialization issues */
      }
    }
    this.listeners.forEach((l) => l());
  }

  // ---- auth-adjacent (current user lives in shared state) ----
  setCurrentUser(userId: string | null) {
    this.setState({ ...this.state, currentUserId: userId });
  }

  addUser(user: AppState["users"][number]) {
    this.setState({ ...this.state, users: [...this.state.users, user] });
  }

  // ---- campaigns ----
  createCampaign(input: { name: string; description: string; setting: string }): Campaign {
    const campaign: Campaign = { id: uid(), createdAt: Date.now(), ...input };
    this.setState({ ...this.state, campaigns: [...this.state.campaigns, campaign] });
    return campaign;
  }

  // ---- characters ----
  createCharacter(input: Omit<Character, "id" | "createdAt">): Character {
    const character: Character = { id: uid(), createdAt: Date.now(), ...input };
    this.setState({ ...this.state, characters: [...this.state.characters, character] });
    return character;
  }

  updateCharacter(id: string, patch: Partial<Character>) {
    this.setState({
      ...this.state,
      characters: this.state.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  // ---- threads & messages ----
  createThread(characterId: string, title: string): ChatThread {
    const now = Date.now();
    const thread: ChatThread = { id: uid(), characterId, title, createdAt: now, updatedAt: now };
    this.setState({ ...this.state, threads: [...this.state.threads, thread] });
    return thread;
  }

  appendMessage(input: Omit<ChatMessage, "id" | "createdAt">): ChatMessage {
    const message: ChatMessage = { id: uid(), createdAt: Date.now(), ...input };
    this.setState({
      ...this.state,
      messages: [...this.state.messages, message],
      threads: this.state.threads.map((t) =>
        t.id === input.threadId ? { ...t, updatedAt: message.createdAt } : t,
      ),
    });
    return message;
  }

  updateMessage(id: string, patch: Partial<ChatMessage>) {
    this.setState({
      ...this.state,
      messages: this.state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  }

  // ---- sessions ----
  createSession(input: { campaignId: string; title: string; scheduledFor?: string }): Session {
    const session: Session = {
      id: uid(),
      campaignId: input.campaignId,
      title: input.title,
      status: "planned",
      scheduledFor: input.scheduledFor,
      plan: "",
      notes: "",
      createdAt: Date.now(),
    };
    this.setState({ ...this.state, sessions: [...this.state.sessions, session] });
    return session;
  }

  updateSession(id: string, patch: Partial<Session>) {
    this.setState({
      ...this.state,
      sessions: this.state.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  // ---- images ----
  saveImage(input: Omit<GeneratedImage, "id" | "createdAt">): GeneratedImage {
    const image: GeneratedImage = { id: uid(), createdAt: Date.now(), ...input };
    this.setState({ ...this.state, images: [image, ...this.state.images] });
    return image;
  }

  reset() {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
    this.setState(createSeedState());
  }
}

export const store = new MockStore();
