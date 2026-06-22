import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { mockAuthProvider } from "./auth";
import { mockChatProvider, mockImageProvider, mockSummaryProvider } from "./ai";
import type { Services } from "./interfaces";
import { store } from "./store";
import type { AppState, User } from "./types";

/**
 * The single place where concrete adapters are wired up. To move from mock to
 * a real backend, swap these implementations for ones that satisfy the same
 * interfaces — no screen needs to change.
 */
const services: Services = {
  auth: mockAuthProvider,
  data: store,
  ai: mockChatProvider,
  summary: mockSummaryProvider,
  images: mockImageProvider,
};

const ServicesContext = createContext<Services>(services);

export function ServicesProvider({ children }: { children: ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  return useContext(ServicesContext);
}

/** Reactive snapshot of the whole app state. Stable between mutations. */
export function useAppState(): AppState {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

export interface AuthApi {
  user: User | null;
  isAuthed: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
    role: User["role"];
  }) => Promise<User>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthApi {
  const { auth } = useServices();
  const state = useAppState();
  const user = useMemo(
    () => state.users.find((u) => u.id === state.currentUserId) ?? null,
    [state.users, state.currentUserId],
  );

  const signIn = useCallback((email: string, password: string) => auth.signIn(email, password), [auth]);
  const signUp = useCallback((input: Parameters<AuthApi["signUp"]>[0]) => auth.signUp(input), [auth]);
  const signOut = useCallback(() => auth.signOut(), [auth]);

  return { user, isAuthed: !!user, signIn, signUp, signOut };
}
