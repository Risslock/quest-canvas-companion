# StoryWeaver — GM First-Run & Onboarding Pass

A focused, modest pass (scope ~2/5) that makes a **new Game Master** feel guided from the moment they arrive, instead of landing in dense screens that assume seeded data. No new backend, no new major features — just guidance, empty states, and a light "getting started" flow layered onto what exists.

## Goal

A first-time GM should always know the single next thing to do: create a campaign → add the party → plan a session → talk to a twin. Today those screens work, but only shine when demo seed data is present. A fresh, empty campaign feels blank and unguided.

## What we'll build

### 1. Welcome moment after sign-up (GM)
- After a GM signs up (not sign-in), show a short, dismissible welcome panel on the campaigns page: one line on what StoryWeaver does for a GM + a primary "Create your first campaign" call to action.
- Skippable, and never shown again once dismissed (stored per-user in local state).

### 2. Campaigns list — a real empty state
- When a GM has no campaigns, replace the bare grid with a centered, inviting empty state: a short prompt and a prominent "Found your first chronicle" button that opens the existing create dialog.
- Keeps the current grid untouched when campaigns exist.

### 3. GM Command Center — "Getting Started" checklist
- Add a compact, dismissible checklist card at the top of the Command Center that reflects real campaign state:
  - Add your first character/NPC (done when the campaign has ≥1 character)
  - Plan your first session (done when a session exists)
  - Talk to a digital twin (done when any thread exists)
  - Try a rules question (done when the campaign has an eval/Q&A record, or mark optional)
- Each incomplete item is a direct link to the right screen. Completed items show a check. The whole card auto-hides once all core steps are done, and can be dismissed manually.

### 4. Warmer empty states inside the Command Center
- Party section, NPC list, sessions/planner, and Forge gallery each get a friendly one-line empty prompt with a direct action when there's nothing yet (several already have partial versions — this makes them consistent).

### 5. Small guidance polish
- Auth page: a one-line hint under the GM/Player toggle explaining what a GM account unlocks.
- Command Center header: when the campaign has no description, show a gentle "Add a premise" affordance instead of empty space.

## Explicitly out of scope
- No changes to AI, data providers, or storage architecture.
- No player-side onboarding this pass (GM-first, per your choice).
- No new routes or multi-step product tours/overlays — guidance stays inline and lightweight.

## Technical notes
- All work is frontend/presentation only, in existing route files: `src/routes/campaigns.index.tsx`, `src/routes/campaigns.$id.index.tsx` (the `CommandCenter`), and `src/routes/auth.tsx`.
- Onboarding dismissal + "new signup" flag stored via the existing services/local state pattern (e.g. a small `localStorage`-backed flag keyed by user id) so nothing new is added to the data model.
- Checklist state is derived from existing `useAppState()` selectors (characters, sessions, threads) — no new persistence needed for completion status.
- One small reusable presentational component for the checklist/empty-state cards to keep the routes tidy; styled with existing semantic tokens (accent/card/muted) — no hardcoded colors.

## Outcome
A new GM is never dropped into a blank, ambiguous screen. Every empty state points to the obvious next action, and a lightweight checklist gives a clear sense of progress toward a live campaign — without adding feature bloat.