# Enchanted Archive — Gradio MVP (Earthdawn 4e)

A Python/Gradio roleplaying companion. Runs on **your own host** — this is the
Python product surface; the React app in this repo is the design reference.

## Features (all on swappable mock providers, no API keys required)

- **Auth** — mock sign-in / sign-up with GM vs Player role (use `gm` in the email for GM).
- **Digital Twins** — threaded, streaming, in-character chat per character + topic.
- **Forge of Visions** — image generation for portraits / scenes / maps / items.
- **Sessions** — planning, live notes, one-click auto-summary.

## Run

```bash
cd gradio
pip install -r requirements.txt
python app.py
```

Open the printed local URL (default http://127.0.0.1:7860).

## Provider-agnostic architecture

The UI only talks to interfaces in `services/interfaces.py`:

| Capability   | Interface          | Mock                         | Swap in `services/registry.py` |
|--------------|--------------------|------------------------------|--------------------------------|
| Auth         | `AuthProvider`     | `MockAuth`                   | Supabase / Auth0 / custom      |
| Chat (LLM)   | `ChatProvider`     | `MockChat` (word stream)     | OpenAI / Anthropic / local     |
| Summaries    | `SummaryProvider`  | `MockSummary`                | any LLM                        |
| Images       | `ImageProvider`    | `MockImage` (PIL placeholder)| SDXL / DALL·E / Flux           |
| Persistence  | `DataRepository`   | `MockRepository` (JSON file) | Postgres / Supabase            |

To go live, implement one class and assign it in `build_services()` — no UI
changes. The character persona fields (`personality`, `tone`, `background`)
are the system-prompt material for a real `ChatProvider`.

## State

Mock data persists to `gradio/state.json`; generated images go to
`gradio/generated/`. Delete `state.json` to re-seed Earthdawn content.

## Earthdawn data

`Character.stats` is a freeform dict — structured Disciplines / Talents /
Karma / attributes can be layered in later without schema changes.
