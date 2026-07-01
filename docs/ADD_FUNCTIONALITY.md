# Adding Functionality to StoryWeaver

StoryWeaver ships fully working on **mock providers** — no API keys, no backend.
This guide is the complete reference for turning those mocks into real
functionality (real AI, authentication, a database, image generation, and
rules RAG).

The core idea: **every external capability is an interface**. The app only ever
depends on the contracts in `src/services/interfaces.ts`. You make things real
by implementing a contract and swapping one line in `src/services/provider.tsx`.
No screen, route, or component needs to change.

---

## Table of contents

1. [Architecture: the "seams"](#1-architecture-the-seams)
2. [The one file you swap: `provider.tsx`](#2-the-one-file-you-swap-providertsx)
3. [Where to put secrets / config](#3-where-to-put-secrets--config)
4. [Provider reference (what to fill, one by one)](#4-provider-reference)
   - [4.1 Auth](#41-auth--authprovider)
   - [4.2 Data / persistence](#42-data--datarepository)
   - [4.3 Chat (digital twin)](#43-chat--chatprovider)
   - [4.4 Session summaries](#44-summary--summaryprovider)
   - [4.5 Image generation](#45-images--imageprovider)
   - [4.6 Rules Q&A (RAG)](#46-knowledge--knowledgeprovider)
   - [4.7 GM session planner](#47-planner--plannerprovider)
5. [The domain model (what the fields mean)](#5-the-domain-model)
6. [Adding a new game system](#6-adding-a-new-game-system)
7. [Server-side calls (keeping keys off the client)](#7-server-side-calls)
8. [Checklist](#8-go-live-checklist)

---

## 1. Architecture: the "seams"

```text
 UI (routes/, components/)
        │  depends only on ↓
 src/services/interfaces.ts     ← contracts (never change these to add features)
        ▲
        │  satisfied by
 mock adapters                  real adapters
  auth.ts / ai.ts / store.ts →  your OpenAI / Supabase / etc. implementations
        ▲
        │  wired here
 src/services/provider.tsx      ← the single wiring point
```

The `Services` object bundles every capability:

```ts
// src/services/interfaces.ts
export interface Services {
  auth: AuthProvider;
  data: DataRepository;
  ai: ChatProvider;
  summary: SummaryProvider;
  images: ImageProvider;
  knowledge: KnowledgeProvider;
  planner: PlannerProvider;
}
```

Components read these through hooks:

- `useServices()` → the whole `Services` bundle
- `useAuth()` → `{ user, isAuthed, signIn, signUp, signOut }`
- `useAppState()` → a reactive snapshot of all data

You never touch those hooks to add functionality — you only implement the
provider they call.

---

## 2. The one file you swap: `provider.tsx`

```ts
// src/services/provider.tsx  (current — all mock)
const services: Services = {
  auth: mockAuthProvider,
  data: store,
  ai: mockChatProvider,
  summary: mockSummaryProvider,
  images: mockImageProvider,
  knowledge: mockKnowledgeProvider,
  planner: mockPlannerProvider,
};
```

To go live, implement any subset and swap the reference:

```ts
import { openAIChatProvider } from "./providers/openai-chat";
import { supabaseAuthProvider } from "./providers/supabase-auth";

const services: Services = {
  auth: supabaseAuthProvider,   // ← real
  data: store,                  // still mock
  ai: openAIChatProvider,       // ← real
  summary: mockSummaryProvider, // still mock
  images: mockImageProvider,
  knowledge: mockKnowledgeProvider,
  planner: mockPlannerProvider,
};
```

You can migrate **incrementally** — mix real and mock providers freely.

> Recommended convention: put real implementations in
> `src/services/providers/<name>.ts` and keep the mock files as reference.

---

## 3. Where to put secrets / config

**Never put private API keys in client code.** Anything imported by a route or
component ships to the browser.

- **Public/publishable values** (e.g. a Supabase anon key, a project URL):
  `import.meta.env.VITE_*` — safe in the client.
- **Private secrets** (OpenAI/Anthropic keys, service-role keys): keep them on
  the server. Read `process.env.*` **inside** a TanStack **server function**
  (`createServerFn`) or a server route, and have the client provider call that.
  See [§7](#7-server-side-calls).

If you enable **Lovable Cloud**, a Postgres database, auth, storage, secrets,
and the AI gateway are provisioned for you — that's the fastest path to real
`DataRepository` + `AuthProvider` + `ChatProvider` implementations.

---

## 4. Provider reference

For each provider below: **what it powers**, **the exact contract to implement**,
**what the mock does today**, and **what you fill in to make it real**.

### 4.1 Auth — `AuthProvider`

**Powers:** sign in / sign up / sign out, current user, and the GM-vs-Player role
that gates the entire UI.

**Contract** (`interfaces.ts`):

```ts
export interface AuthProvider {
  getCurrentUser(): User | null;
  signIn(email: string, password: string): Promise<User>;
  signUp(input: { name: string; email: string; password: string; role: User["role"] }): Promise<User>;
  signOut(): Promise<void>;
}
```

**Mock today** (`auth.ts`): any password works; the session is just
`currentUserId` in the store; an email containing `gm` maps to a GM.

**To make it real, you must provide:**

- A real identity backend (Supabase Auth, Auth0, Clerk, custom JWT…).
- A mapping from your backend's user → StoryWeaver's `User`:
  `{ id, name, email, role: "gm" | "player", characterId? }`.
- **Where the `role` comes from.** This is a product decision — e.g. store it in
  a `profiles`/`user_roles` table and read it after login. Do **not** trust a
  client-set role for anything security-sensitive.
- Persisting the session across reloads (your SDK usually handles this).
- `getCurrentUser()` must return synchronously from cached session state (the UI
  calls it during render).

> Security note: role-based visibility (GM-only timeline beats, GM-only lore) is
> currently enforced **in the UI only**. Once you have a real backend, enforce
> it server-side too (row-level security / API authorization). The client rules
> are UX, not a security boundary.

### 4.2 Data — `DataRepository`

**Powers:** everything persistent — campaigns, characters, chat threads &
messages, sessions, generated images, timeline events, knowledge sources, evals.

**Contract** (`interfaces.ts`):

```ts
export interface DataRepository {
  getState(): AppState;
  subscribe(listener: () => void): () => void;

  createCampaign(input: { name; description; setting }): Campaign;
  createCharacter(input: Omit<Character, "id" | "createdAt">): Character;
  updateCharacter(id, patch): void;
  createThread(characterId, title): ChatThread;
  appendMessage(input: Omit<ChatMessage, "id" | "createdAt">): ChatMessage;
  updateMessage(id, patch): void;
  createSession(input: { campaignId; title; scheduledFor? }): Session;
  updateSession(id, patch): void;
  saveImage(input: Omit<GeneratedImage, "id" | "createdAt">): GeneratedImage;
  addTimelineEvent(input: Omit<TimelineEvent, "id" | "createdAt">): TimelineEvent;
  addKnowledge(input: Omit<KnowledgeSource, "id">): KnowledgeSource;
  addEval(input: Omit<EvalRecord, "id" | "createdAt">): EvalRecord;
}
```

**Mock today** (`store.ts`): one big `AppState` object held in memory, persisted
to `localStorage` (`storyweaver.state.v1`), replaced immutably on every mutation
so `useSyncExternalStore` reads stay stable.

**To make it real, you must provide:**

- A backend database with a table per entity (see [§5](#5-the-domain-model) for
  the shapes). Suggested tables: `campaigns`, `characters`, `chat_threads`,
  `chat_messages`, `sessions`, `images`, `timeline_events`, `knowledge_sources`,
  `evals`, plus `users`/`profiles`.
- A reactivity story. The UI depends on `getState()` + `subscribe()` returning
  a **whole snapshot** that changes identity on every write. Two options:
  1. **Cache-backed (recommended):** keep the same in-memory `AppState` shape as
     a client cache, hydrate it from the DB on load, subscribe to realtime
     changes (e.g. Supabase Realtime) to update the snapshot, and write through
     on each mutation. This preserves the exact contract.
  2. **Full rewrite:** replace the snapshot model with TanStack Query
     per-entity. This touches more of the UI and is not recommended for a first
     pass.
- **ID + timestamp generation** for the `Omit<..., "id" | "createdAt">` inputs
  (DB defaults like `gen_random_uuid()` / `now()` are ideal).
- Scoping every query to the current campaign and enforcing role visibility
  server-side (`TimelineEvent.visibility`, `KnowledgeSource.gmOnly`).

> Tip: the fastest real implementation keeps `store.ts`'s snapshot/subscribe
> mechanics and only changes the persistence layer from `localStorage` to your
> DB (hydrate on boot, write-through + realtime on mutate).

### 4.3 Chat — `ChatProvider`

**Powers:** the digital-twin conversations. Streams an in-character reply
token-by-token.

**Contract:**

```ts
export interface ChatProvider {
  streamReply(
    character: Character,
    history: ChatMessage[],
    userMessage: string,
  ): AsyncIterable<string>;   // yield text chunks as they arrive
}
```

**Mock today** (`ai.ts`): hand-authored per-character lines, word-streamed with
random delays.

**To make it real, you must provide:**

- An LLM call (OpenAI / Anthropic / Lovable AI gateway / local) that **streams**.
- **A system prompt built from the character.** This is the most important part —
  the persona fields are your prompt material:
  - `character.name`, `race`, `discipline`, `circle`, `disposition`
  - `character.personality`, `background`, `tone`, `description`
  - `character.talents`, `goals`, `relationships`
  - `character.stats` (freeform record)
- Converting `history: ChatMessage[]` (`role: "user" | "assistant"`) into the
  model's message format, plus the new `userMessage`.
- (Optional but recommended) injecting relevant **memory** — past timeline beats
  and session summaries — so the twin "remembers." Pull these from
  `DataRepository` / your RAG store and prepend as context.
- Yielding string chunks from the stream. The UI already handles partial tokens,
  a **Stop** button (via `AbortController`), and the "trails off" indicator — so
  make your async iterator abortable.

### 4.4 Summary — `SummaryProvider`

**Powers:** one-click session recaps in the session detail view.

**Contract:**

```ts
export interface SummaryProvider {
  streamSummary(session: Session): AsyncIterable<string>;
}
```

**Mock today:** condenses `session.notes` into a templated recap.

**To make it real:** send `session.title`, `session.plan`, and `session.notes`
to an LLM with a "summarize this RPG session into a chronicle recap + dangling
threads" prompt, and stream the result.

### 4.5 Images — `ImageProvider`

**Powers:** the "Forge of Visions" — portraits, NPC art, scene art.

**Contract:**

```ts
export interface ImageProvider {
  generate(prompt: string, kind: ImageKind): Promise<{ url: string }>;
}
// ImageKind = "portrait" | "npc" | "scene"
```

**Mock today:** returns a random image from a bundled art pool after a fake delay.

**To make it real, you must provide:**

- An image model call (DALL·E / Flux / SDXL / Lovable AI image gen).
- Optionally shape the prompt by `kind` (portrait vs scene framing/aspect ratio).
- **Persistent hosting for the result.** Return a durable URL — upload the
  generated bytes to storage (e.g. a storage bucket) and return that URL, not an
  ephemeral one. The URL is then saved via `DataRepository.saveImage(...)`.

### 4.6 Knowledge — `KnowledgeProvider`

**Powers:** the Rules Q&A page — natural-language questions answered with
**expandable source citations**, plus quality scores that feed the Eval
dashboard.

**Contract:**

```ts
export interface KnowledgeProvider {
  ask(question: string, sources: KnowledgeSource[]): Promise<RuleAnswer>;
}
export interface RuleAnswer {
  answer: string;
  citations: { sourceId; title; excerpt }[];
  scores: { faithfulness: number; relevance: number; accuracy: number }; // 0–100
}
```

**Mock today:** keyword-scores the seeded `KnowledgeSource[]`, returns the best
excerpts as citations with jittered scores.

**To make it real (RAG), you must provide:**

- **Ingestion**: chunk + embed your rulebooks/lore and store vectors (pgvector,
  Pinecone, etc.). Each chunk keeps a `sourceId`, `title`, and text `excerpt`.
- **Retrieval**: embed the question, fetch top-k chunks. Respect
  `KnowledgeSource.gmOnly` — never return GM-only lore to a player (filter by the
  caller's role, ideally server-side).
- **Generation**: prompt the LLM to answer **only** from retrieved chunks and to
  cite them; return those chunks as `citations`.
- **Scoring**: compute real `faithfulness` / `relevance` / `accuracy` (e.g. an
  LLM-as-judge or retrieval metrics) instead of random numbers — these numbers
  drive the Eval dashboard, so store each result with `addEval(...)`.

### 4.7 Planner — `PlannerProvider`

**Powers:** the GM session-planner agent in session detail — generates an
outline from campaign history.

**Contract:**

```ts
export interface PlannerProvider {
  streamOutline(input: {
    campaign: Campaign;
    sessions: Session[];
    characters: Character[];
    timeline: TimelineEvent[];
  }): AsyncIterable<string>;
}
```

**Mock today:** assembles a Markdown outline from recent timeline beats, planned
sessions, and available NPCs.

**To make it real:** feed the same inputs to an LLM ("you are a GM assistant;
propose a session outline given this history, open threads, and available NPCs")
and stream Markdown. Consider retrieving extra context from the knowledge store.

---

## 5. The domain model

All types live in `src/services/types.ts`. Key entities (see the file for the
full, authoritative definitions):

- **User** — `{ id, name, email, role: "gm" | "player", characterId? }`
- **Campaign** — `{ id, name, description, setting, system?, createdAt }`
- **Character** — identity + persona (`personality`, `background`, `tone`),
  freeform `stats`, and structured `talents` / `goals` / `relationships`;
  `kind: "pc" | "npc"`, `ownerUserId?` links a PC to its player.
- **ChatThread** / **ChatMessage** — per-character topic threads and their
  `role: "user" | "assistant"` messages.
- **Session** — `{ status: "planned" | "active" | "done", plan, notes, summary? }`.
- **GeneratedImage** — `{ prompt, url, kind, characterId? }`.
- **TimelineEvent** — `{ title, body, characterIds[], visibility: "gm" | "all", occurredAt }`.
  `visibility` drives player-scoped filtering.
- **KnowledgeSource** — `{ title, kind, gmOnly, excerpt }` for Rules Q&A.
- **EvalRecord** — logged rules answer with `faithfulness / relevance / accuracy`.

`AppState` is the aggregate of all of these plus `currentUserId`. It's what
`DataRepository.getState()` returns.

**When you add a real backend, keep these shapes as the API boundary** even if
your DB columns differ — map DB rows → these types in your adapter so the UI is
untouched.

---

## 6. Adding a new game system

Earthdawn is only the seed. To support another system:

- `Character.stats` is a freeform `Record<string, string | number>` — put any
  system's attributes there without a schema change.
- `Campaign.system` labels the system; `Character.discipline` / `circle` are
  Earthdawn-flavored but optional/renamable in your UI copy.
- Add structured fields to `types.ts` only if you need first-class UI for them,
  then surface them in the Character Creation Wizard
  (`src/routes/campaigns.$id.characters.new.tsx`).
- Seed a new campaign's rulebook chunks via `KnowledgeProvider` ingestion.

---

## 7. Server-side calls

To keep private keys out of the browser, front any real AI/DB call with a
TanStack **server function**:

```ts
// src/lib/twin.functions.ts  (client-safe module path)
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const streamTwinReply = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ characterId: z.string(), text: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENAI_API_KEY!; // read INSIDE the handler
    // ...call the model, return the reply (or a streamed Response)...
  });
```

Then your `ChatProvider` implementation calls `streamTwinReply` instead of
holding a key. Rules:

- Read `process.env.*` **inside** `.handler()`, never at module scope.
- Put client-imported server functions in `src/lib/` or next to the route —
  **not** in `src/server/` (that path is blocked from client bundles).
- For webhooks / public endpoints use server routes under
  `src/routes/api/public/*` and verify the caller.

See the repo's TanStack guidance for the full server-function rules.

---

## 8. Go-live checklist

- [ ] Implement `AuthProvider` and decide where `role` comes from (server-authoritative).
- [ ] Implement `DataRepository` (keep snapshot/subscribe; hydrate + realtime + write-through).
- [ ] Move AI keys to server functions; implement `ChatProvider` + `SummaryProvider` + `PlannerProvider`.
- [ ] Implement `ImageProvider` with durable storage for outputs.
- [ ] Implement `KnowledgeProvider` (ingest → retrieve → cite → score) and log `EvalRecord`s.
- [ ] Enforce `visibility` / `gmOnly` **server-side**, not just in the UI.
- [ ] Swap each adapter in `src/services/provider.tsx` as it becomes real.
- [ ] Remove/disable the `localStorage` seed once the DB is authoritative.

You can ship any of these independently — mixed mock + real is fully supported.
