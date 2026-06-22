## Earthdawn Roleplaying Companion — Build Plan (provider-agnostic, design-first)

Goal: design the product and UI/UX first. Build a fully interactive front end with **no hard dependency on any specific backend, auth, or AI provider.** All external capabilities sit behind thin interfaces so the real provider (auth, database, LLM, image gen, storage) is plugged in later without touching screens.

### Guiding principles
- **Design & UX first.** Ship a complete, navigable, polished UI with realistic mock data before wiring any real backend.
- **Provider-agnostic by contract.** Define TypeScript service interfaces; back them with an in-memory/mock adapter now. Swapping to a real provider later means writing one adapter, not rewriting features.
- No Lovable Auth, no Lovable AI Gateway, no Supabase assumptions baked into components.

### Abstraction layer (the seams)
```text
src/services/
  auth/        AuthProvider interface  -> mockAuthAdapter (local state)
  data/        Repository interfaces (campaigns, characters, threads,
               messages, sessions, notes, images) -> mockDataAdapter (in-memory + seed)
  ai/          ChatProvider + SummaryProvider interfaces -> mockAiAdapter
               (scripted/streamed canned responses)
  images/      ImageProvider interface -> mockImageAdapter (placeholder art)
  storage/     FileStorage interface -> mockStorageAdapter (object URLs)
```
- Each interface is small and explicit (e.g. `ChatProvider.streamReply(thread, persona) -> AsyncIterable<string>`).
- A single `services` context provides the active adapters; flipping mock→real happens in one place.
- Mock adapters return realistic, seeded Earthdawn content so every screen looks alive.

### Product surface & UX
Roles in the UI: **Game Master** and **Player** (modeled in mock data; enforcement deferred to real auth later).

1. **Auth screens (UI only).** Sign in / sign up forms wired to the mock auth adapter. Real provider plugged later.
2. **Campaign hub.** Create/select campaigns; dashboard with characters, sessions, and an image gallery.
3. **Characters & NPCs (digital twins).**
   - Roster of PCs and NPCs with light profiles (name, kind, description, personality, background, tone, portrait).
   - **Threaded chat per character + topic:** thread list per character; "New thread" routes to a dedicated thread URL. Streaming-style chat UI (typing indicator, markdown, focused composer) driven by the mock AI adapter.
4. **Image generation.** Prompt UI (seeded from character description) with progressive/streaming preview from the mock image adapter; save to gallery / set as portrait.
5. **Sessions.** Session list with status (planned/active/done), planning view, live notes, and one-click **auto-summary** (mock summary adapter) browsable per campaign.

### Routing (TanStack Start, all client-rendered with mock data)
```text
/                                landing / campaign picker
/auth                            sign in / up (mock)
/campaigns                       list + create
/campaigns/$id                   dashboard
/campaigns/$id/characters/$cid                 profile + thread list
/campaigns/$id/characters/$cid/$threadId       chat thread
/campaigns/$id/sessions/$sid                   prep, notes, summary
```
No auth route guards or server routes yet — those arrive with the real provider.

### Earthdawn data
Light now: freeform profile fields + `stats` as a flexible structure. Structured Disciplines/Talents/Karma/attributes added later without reworking the UI.

### Build order
1. **Design direction** — propose 3 rendered directions (fantasy/Earthdawn flavored, parchment-ink + arcane accent), pick one, lock tokens/typography.
2. App shell, theme, navigation, layout primitives.
3. Service interfaces + mock adapters + seed data.
4. Auth UI (mock) and campaign hub.
5. Characters roster + profiles.
6. Threaded character chat (digital twins) end-to-end on mock AI.
7. Image generation UI on mock image adapter + gallery.
8. Sessions: planning, notes, auto-summary on mock adapters.
9. Polish: empty states, responsive, accessibility, SEO/meta.

### Later (out of scope for this phase, unblocked by the seams)
- Plug real auth, database, LLM chat, image generation, storage by implementing each adapter interface.
- Real role enforcement, persistence, multi-user sync.

First step after approval: gather design preferences and present 3 design directions before building.