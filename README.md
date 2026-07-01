# StoryWeaver

An AI-powered tabletop RPG companion. StoryWeaver remembers every story beat,
brings NPCs to life with consistent voices as **digital twins**, generates
portraits and scene art, plans sessions, and answers rules questions with cited
sources — for both **Game Masters** and **Players**.

Earthdawn 4e is the seed system, but the data model and UI are architected so
any game system can be added later.

> This repository contains **two product surfaces**:
> - **`/` (root)** — the React app built on **TanStack Start** (this is the primary app).
> - **`/gradio`** — a parallel Python/Gradio surface. See [`gradio/README.md`](./gradio/README.md).
>
> Both run entirely on **swappable mock providers**, so nothing below requires an
> API key to start. When you're ready to add real functionality, see
> **[`docs/ADD_FUNCTIONALITY.md`](./docs/ADD_FUNCTIONALITY.md)**.

---

## Quick start (React app)

Prerequisites: **[Bun](https://bun.sh)** (recommended) or Node 20+.

```bash
# 1. Install dependencies
bun install

# 2. Start the dev server (Vite)
bun run dev
```

Open the printed local URL (default **http://localhost:8080**).

### Signing in (mock auth)

There is no real account system yet — any email/password works.

- Put **`gm`** in the email (e.g. `gm@storyweaver.dev`) to sign in as a **Game Master**.
- Any other email signs you in as a **Player**.
- Two demo accounts are seeded: `gm@storyweaver.dev` (GM) and `aria@storyweaver.dev` (Player).

You can also flip roles at any time using the **role switcher** in the sidebar.

### Available scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Start the Vite dev server with HMR |
| `bun run build` | Production build |
| `bun run build:dev` | Development-mode build (used for prerender checks) |
| `bun run preview` | Preview a production build locally |
| `bun run lint` | Run ESLint |
| `bun run format` | Format with Prettier |

### Resetting demo data

All app state (campaigns, characters, chats, sessions, images, timeline,
knowledge, evals) is persisted in **`localStorage`** under the key
`storyweaver.state.v1`. To re-seed the Earthdawn demo content, clear that key:

```js
// In the browser devtools console:
localStorage.removeItem("storyweaver.state.v1");
location.reload();
```

---

## What's built

The full 12-phase build plan and status live in
**[`.lovable/plan.md`](./.lovable/plan.md)**. Highlights:

- Dark "arcane but clean" theme (OKLCH tokens in `src/styles.css`)
- Role-aware Campaign Hub, GM Command Center, and Player Dashboard
- Immersive full-screen **Digital Twin Chat** with streaming replies
- **Story Timeline** with role-based visibility
- **Rules Q&A** with cited sources + a **Rules Eval** dashboard
- Multi-step **Character Creation Wizard** with live preview
- **GM session planner** agent

## Project structure

```text
src/
  routes/          File-based routes (TanStack Start). See src/routes/README.md
  components/       Reusable UI + shadcn/ui primitives (components/ui)
  services/         ⭐ The "seams" — all swappable functionality lives here
    interfaces.ts   Provider-agnostic contracts (the API you implement)
    provider.tsx    ⭐ Where concrete adapters are wired up
    types.ts        Domain model (Campaign, Character, Session, ...)
    auth.ts         Mock auth adapter
    ai.ts           Mock chat / summary / image / knowledge / planner adapters
    store.ts        Mock data repository (localStorage)
    seed.ts         Earthdawn demo data
  styles.css        Theme tokens (Tailwind v4 @theme)
gradio/            Parallel Python/Gradio product surface
docs/
  ADD_FUNCTIONALITY.md  ⭐ How to replace mocks with real providers
```

---

## Adding real functionality

Every external capability is defined as an interface in
`src/services/interfaces.ts` and wired once in `src/services/provider.tsx`.
To go live (real AI, auth, database, image generation, RAG), you implement the
interface and swap the adapter — **no screen changes required**.

👉 **Read [`docs/ADD_FUNCTIONALITY.md`](./docs/ADD_FUNCTIONALITY.md)** for the
complete, field-by-field integration guide.
