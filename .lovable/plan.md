# StoryWeaver — Product Build Plan & Status Tracker

> **Progress (this pass):** ✅ Phase 1 (rebrand + dark arcane theme + new sigil/hero + landing), ✅ Phase 2 (timeline/knowledge/eval data model + role-aware fields + role switcher), ✅ Phase 3 (role-aware campaign entry), ✅ Phase 4 (Player Dashboard), ✅ Phase 5 (GM Command Center), ✅ Phase 6 (immersive full-screen Digital Twin Chat: ambient backdrop, streaming + Stop, role-aware context panel, shared-memory affordance), ✅ Phase 7 (Story Timeline w/ role visibility), ✅ Phase 8 (Rules Q&A w/ cited sources), ✅ Phase 9 (Character Creation Wizard + live preview), ✅ Phase 10 (GM planner agent in session detail), ✅ Phase 11 (Rules Eval dashboard), ✅ Phase 12 (per-route SEO/meta on all routes, smoke-tested GM + Player journeys + immersive chat streaming, no console errors).
> **Status:** All 12 phases complete. Real AI/auth/storage/RAG providers still swap behind the existing interfaces without touching screens.

A living plan for the **React (TanStack Start)** design-first app. Everything runs on the existing **provider-agnostic mock adapters** (auth, data, chat, summary, images) so real AI/auth/storage/RAG plug in later without touching screens. Earthdawn 4e is the seed system, but data and UI are structured so other systems can be added later.

## Status legend
`[x]` done · `[~]` partial / needs rework · `[ ]` not started

---

## Phase 0 — Foundation (mostly built)
- `[x]` Provider-agnostic service contracts (`src/services/interfaces.ts`)
- `[x]` Mock adapters: auth, data store (localStorage), chat stream, summary, images
- `[x]` Observable store + `ServicesProvider` + `useAuth`/`useAppState`
- `[x]` Earthdawn seed data (campaign, PCs, NPCs, threads, sessions, images)
- `[x]` AI Elements chat primitives, base routing tree
- `[~]` Domain types — extend for new features (see Phase 2 data model)

## Phase 1 — Rebrand & "Arcane but clean" theme
- `[ ]` Rename **Barsaive Chronicle → StoryWeaver** across brand, titles, meta, storage key
- `[ ]` New dark palette in `src/styles.css` (OKLCH tokens): deep navy/slate base, aged-parchment surfaces, **gold + ember** accents; keep light parchment as an optional reading surface for journal/timeline
- `[ ]` Typography: keep Cinzel (display) + EB Garamond (body) tuned for dark bg; verify contrast in both roles
- `[ ]` Generate a StoryWeaver logo/sigil + atmospheric landing art
- `[ ]` "Living" polish: subtle glow states, transitions, ambient motion (no clutter)
- `[ ]` Rewrite landing page (`/`) for StoryWeaver value prop + key features

## Phase 2 — Data model & role foundation
Extend types/seed (provider-agnostic, still freeform Earthdawn `stats`):
- `[ ]` **Role-aware access**: GM sees all; player sees only their character's knowledge. Add `visibility: "gm" | "all"` to timeline events, lore, notes
- `[ ]` **Timeline events** entity (sessionId, characterRefs, title, body, visibility, timestamp)
- `[ ]` **Knowledge sources** entity (title, type, GM-only flag) + **Q&A** with cited chunks
- `[ ]` **Rules eval** records (question, faithfulness/relevance/accuracy scores)
- `[ ]` **Character creation** structured fields (identity, discipline, talents, relationships, goals) layered over existing `stats`
- `[ ]` Role switcher (GM/Player) wired to seeded users for demoing both experiences

## Phase 3 — Campaign Hub
- `[~]` Campaign list/create exists (`campaigns.index.tsx`) → restyle as **Campaign Hub**: recent campaigns, quick-join, create
- `[ ]` Per-campaign landing routes by role (GM → Command Center, Player → Dashboard)

## Phase 4 — Player Dashboard
- `[ ]` `/campaigns/$id` player view: character summary card, twin chat entry, timeline feed (filtered to character), rules Q&A widget
- `[~]` Reuse/restyle existing dashboard (`campaigns.$id.index.tsx`)

## Phase 5 — GM Command Center
- `[ ]` GM `/campaigns/$id` view: campaign overview, NPC roster, session planner entry, knowledge upload, eval panel entry
- `[ ]` Information-dense "command center" layout, organized not overwhelming

## Phase 6 — Digital Twin Chat (extend existing)
- `[x]` Threaded per-character + topic chat, streaming mock replies
- `[ ]` Immersive full-screen mode: large portrait, in-character voice framing
- `[ ]` "Memory" affordance: show what the twin remembers (seeded summary of past beats)
- `[ ]` GM speaks-as-any-NPC; player speaks-as-own-character gating

## Phase 7 — Story Timeline
- `[ ]` `/campaigns/$id/timeline`: chronological event feed, filter by session/character
- `[ ]` Role-based visibility (player sees only what their character would know)
- `[ ]` Auto-population hook from session summaries (mock now)

## Phase 8 — Rules / Game Knowledge Q&A
- `[ ]` `/campaigns/$id/rules`: natural-language question input
- `[ ]` Answer display with **expandable source citations** (mock RAG over seeded rules)
- `[ ]` GM-only lore stays GM-only

## Phase 9 — Character Creation Wizard
- `[ ]` `/campaigns/$id/characters/new`: multi-step guided builder with **live preview**
- `[ ]` Steps: identity → discipline → talents → background → personality → relationships → goals
- `[ ]` Output structured so the twin is "smarter," not just a sheet

## Phase 10 — Session Planning (GM)
- `[x]` Session list + detail + one-click AI summary exist
- `[ ]` GM planner agent view: open plot threads, available NPCs, last-time recap → generated outline (mock)

## Phase 11 — Rules Evaluation Dashboard (GM)
- `[ ]` `/campaigns/$id/eval`: panel scoring faithfulness / relevance / accuracy of rules answers (mock metrics, charts)

## Phase 12 — Polish & ship
- `[ ]` Empty states, responsive, accessibility pass
- `[ ]` SEO/meta per route (titles, descriptions, og)
- `[ ]` Smoke-test full GM + Player journeys

---

## Routing map (target)
```text
/                                         landing (StoryWeaver)
/auth                                     sign in / up (mock)
/campaigns                                Campaign Hub
/campaigns/$id                            role-aware dashboard (GM CC / Player)
/campaigns/$id/characters                 roster
/campaigns/$id/characters/new             creation wizard
/campaigns/$id/characters/$cid            profile + thread list
/campaigns/$id/characters/$cid/$threadId  twin chat (immersive)
/campaigns/$id/timeline                   story timeline
/campaigns/$id/rules                      rules Q&A
/campaigns/$id/sessions                   session list
/campaigns/$id/sessions/$sid              prep / notes / summary / planner
/campaigns/$id/eval                       rules eval dashboard (GM)
/campaigns/$id/images                     portraits & scene art
```

## Technical notes (for the curious)
- Stays on TanStack file-based routing; `routeTree.gen.ts` auto-generated.
- New capabilities (RAG Q&A, eval scoring, planner) added as **mock adapter methods behind interfaces** — real OpenAI/Anthropic/vector-DB/auth swap in one place later.
- Theme via Tailwind v4 `@theme` tokens in `src/styles.css`; fonts via `<link>` in `__root.tsx` (no remote `@import`).
- Role visibility enforced in the UI/data layer now; real server-side enforcement deferred to the real auth/data provider.
- The separate `/gradio` Python track is untouched by this plan.

## Suggested build order
Phase 1 (rebrand + theme) → 2 (data/roles) → 3 (hub) → 4 & 5 (dashboards) → 6/7/8 (twin, timeline, rules) → 9 (wizard) → 10/11 (planner, eval) → 12 (polish).

First implementation step after approval: Phase 1 — rebrand to StoryWeaver and lock the dark arcane theme tokens.