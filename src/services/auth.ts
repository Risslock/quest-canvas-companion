import type { AuthProvider } from "./interfaces";
import { store } from "./store";
import type { User } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

/**
 * Mock auth adapter. Holds the "session" as `currentUserId` in the shared
 * store. Real auth (email/password, OAuth, etc.) can replace this by
 * implementing the same AuthProvider contract.
 */
export const mockAuthProvider: AuthProvider = {
  getCurrentUser(): User | null {
    const s = store.getState();
    return s.users.find((u) => u.id === s.currentUserId) ?? null;
  },

  async signIn(email: string, _password: string): Promise<User> {
    await sleep(500);
    const s = store.getState();
    const existing = s.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const user = existing ?? s.users.find((u) => u.role === "gm") ?? s.users[0];
    if (!user) throw new Error("No account found.");
    store.setCurrentUser(user.id);
    return user;
  },

  async signUp(input): Promise<User> {
    await sleep(600);
    const s = store.getState();
    const existing = s.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) {
      store.setCurrentUser(existing.id);
      return existing;
    }
    const user: User = {
      id: uid(),
      name: input.name,
      email: input.email,
      role: input.role,
    };
    store.addUser(user);
    store.setCurrentUser(user.id);
    return user;
  },

  async signOut(): Promise<void> {
    await sleep(150);
    store.setCurrentUser(null);
  },
};
