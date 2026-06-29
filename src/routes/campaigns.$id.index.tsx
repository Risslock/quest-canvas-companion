import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  LineChart,
  Plus,
  ScrollText,
  Sparkles,
  Wand2,
} from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { SectionHeading } from "@/components/campaign-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, useAuth, useServices } from "@/services";

export const Route = createFileRoute("/campaigns/$id/")({
  head: () => ({
    meta: [
      { title: "Campaign Dashboard — StoryWeaver" },
      {
        name: "description",
        content:
          "Your campaign at a glance — party and NPC roster, story timeline, digital twin chats, and AI session planning.",
      },
    ],
  }),
  component: CampaignDashboard,
});

const statusLabel: Record<string, string> = {
  planned: "Planned",
  active: "In session",
  done: "Concluded",
};

function CampaignDashboard() {
  const { user } = useAuth();
  return user?.role === "player" ? <PlayerDashboard /> : <CommandCenter />;
}

/* ------------------------------------------------------------------ */
/* Player Dashboard — a personal adventure journal                     */
/* ------------------------------------------------------------------ */
function PlayerDashboard() {
  const { id } = Route.useParams();
  const state = useAppState();
  const { user } = useAuth();

  const campaign = state.campaigns.find((c) => c.id === id)!;
  const character = useMemo(
    () => state.characters.find((c) => c.id === user?.characterId && c.campaignId === id),
    [state.characters, user?.characterId, id],
  );
  const threads = useMemo(
    () =>
      character
        ? state.threads
            .filter((t) => t.characterId === character.id)
            .sort((a, b) => b.updatedAt - a.updatedAt)
        : [],
    [state.threads, character],
  );
  const events = useMemo(
    () =>
      state.timeline
        .filter((e) => e.campaignId === id && e.visibility === "all")
        .sort((a, b) => b.occurredAt - a.occurredAt)
        .slice(0, 5),
    [state.timeline, id],
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-10 border-b-2 border-primary/10 pb-6">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">
          {campaign.setting}
        </p>
        <h2 className="mt-1 font-display text-4xl">Adventure Journal</h2>
        <p className="mt-2 max-w-2xl italic text-foreground/60">{campaign.description}</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 space-y-8 lg:col-span-7">
          {character ? (
            <section className="rounded-xl border border-accent/20 bg-card p-6 shadow-arcane">
              <div className="flex gap-5">
                <CharacterAvatar
                  name={character.name}
                  portraitUrl={character.portraitUrl}
                  disposition={character.disposition}
                  size={110}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-2xl">{character.name}</h3>
                  <p className="italic text-foreground/70">
                    {character.race} {character.discipline}
                    {character.circle ? ` · Circle ${character.circle}` : ""}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-foreground/70">
                    {character.description}
                  </p>
                  <Button
                    asChild
                    className="mt-4 font-display tracking-widest glow-gold"
                  >
                    <Link to="/campaigns/$id/characters/$cid" params={{ id, cid: character.id }}>
                      <Sparkles className="size-4" /> SPEAK WITH YOUR TWIN
                    </Link>
                  </Button>
                </div>
              </div>
              {threads.length > 0 && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                    Recent conversations
                  </p>
                  <div className="space-y-1">
                    {threads.slice(0, 3).map((t) => (
                      <Link
                        key={t.id}
                        to="/campaigns/$id/characters/$cid/$threadId"
                        params={{ id, cid: character.id, threadId: t.id }}
                        className="flex items-center justify-between rounded px-2 py-1.5 text-sm transition-colors hover:bg-accent/10"
                      >
                        <span className="truncate">{t.title}</span>
                        <ArrowRight className="size-3.5 text-accent" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ) : (
            <section className="rounded-xl border border-dashed border-accent/30 p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No character linked to your account yet.
              </p>
              <Button asChild className="mt-4 font-display tracking-widest">
                <Link to="/campaigns/$id/characters/new" params={{ id }}>
                  <Plus className="size-4" /> CREATE YOUR CHARACTER
                </Link>
              </Button>
            </section>
          )}

          <section>
            <SectionHeading>What You Remember</SectionHeading>
            <div className="space-y-3">
              {events.map((e) => (
                <div key={e.id} className="rounded-lg border border-border bg-card/60 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {new Date(e.occurredAt).toLocaleDateString()}
                  </p>
                  <p className="font-display">{e.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground/70">{e.body}</p>
                </div>
              ))}
              <Link
                to="/campaigns/$id/timeline"
                params={{ id }}
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                Open full timeline <ArrowRight className="size-4" />
              </Link>
            </div>
          </section>
        </div>

        <div className="col-span-12 space-y-6 lg:col-span-5">
          <QuickRules id={id} />
          <QuickLink
            to="/campaigns/$id/images"
            id={id}
            icon={Wand2}
            title="Forge of Visions"
            body="Conjure a portrait or scene."
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GM Command Center                                                    */
/* ------------------------------------------------------------------ */
function CommandCenter() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const state = useAppState();
  const { data } = useServices();
  const [forgePrompt, setForgePrompt] = useState("");

  const campaign = state.campaigns.find((c) => c.id === id)!;
  const pcs = useMemo(
    () => state.characters.filter((c) => c.campaignId === id && c.kind === "pc"),
    [state.characters, id],
  );
  const npcs = useMemo(
    () => state.characters.filter((c) => c.campaignId === id && c.kind === "npc"),
    [state.characters, id],
  );
  const sessions = useMemo(
    () => state.sessions.filter((s) => s.campaignId === id),
    [state.sessions, id],
  );
  const images = useMemo(
    () => state.images.filter((img) => img.campaignId === id).slice(0, 3),
    [state.images, id],
  );

  const plannerSession =
    sessions.find((s) => s.status === "active") ??
    sessions.find((s) => s.status === "planned") ??
    sessions[0];

  const newSession = () => {
    const s = data.createSession({ campaignId: id, title: `Session ${sessions.length + 1}` });
    navigate({ to: "/campaigns/$id/sessions/$sid", params: { id, sid: s.id } });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b-2 border-primary/10 pb-6">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">
            {campaign.setting}
          </p>
          <h2 className="mt-1 font-display text-4xl">{campaign.name}</h2>
          <p className="mt-2 max-w-2xl italic text-foreground/60">{campaign.description}</p>
        </div>
        <Button onClick={newSession} className="font-display tracking-widest">
          <Plus className="size-4" /> NEW SESSION
        </Button>
      </div>

      {/* GM quick tools */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <QuickLink
          to="/campaigns/$id/timeline"
          id={id}
          icon={ScrollText}
          title="Story Timeline"
          body="The campaign's shared memory."
        />
        <QuickLink
          to="/campaigns/$id/rules"
          id={id}
          icon={BookOpen}
          title="Knowledge & Rules"
          body="Cited rules Q&A and lore."
        />
        <QuickLink
          to="/campaigns/$id/eval"
          id={id}
          icon={LineChart}
          title="Rules Evaluation"
          body="Score retrieval quality."
        />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 space-y-8 lg:col-span-8">
          <section>
            <SectionHeading>Active Party</SectionHeading>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {pcs.map((c) => (
                <div
                  key={c.id}
                  className="group rounded-lg border border-accent/20 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex gap-4">
                    <CharacterAvatar
                      name={c.name}
                      portraitUrl={c.portraitUrl}
                      disposition={c.disposition}
                      size={88}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-display text-lg transition-colors group-hover:text-accent">
                        {c.name}
                      </h4>
                      <p className="text-sm italic text-foreground/70">
                        {c.race} {c.discipline}
                        {c.circle ? ` (Circle ${c.circle})` : ""}
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="mt-4 border-primary/40 font-display text-[10px] tracking-widest text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Link to="/campaigns/$id/characters/$cid" params={{ id, cid: c.id }}>
                          OPEN TWIN CHAT
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {pcs.length === 0 && (
                <Link
                  to="/campaigns/$id/characters/new"
                  params={{ id }}
                  className="grid place-items-center rounded-lg border border-dashed border-accent/30 p-8 text-center text-sm text-muted-foreground hover:border-accent/60"
                >
                  No characters yet — add your party.
                </Link>
              )}
            </div>
          </section>

          <section className="rounded-lg surface-parchment p-8 shadow-arcane">
            <h3 className="font-display text-xl">Forge of Visions</h3>
            <p className="mb-6 mt-1 text-sm opacity-70">
              Manifest the heroes and horrors of your world.
            </p>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <Input
                value={forgePrompt}
                onChange={(e) => setForgePrompt(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  navigate({
                    to: "/campaigns/$id/images",
                    params: { id },
                    search: { prompt: forgePrompt || undefined },
                  })
                }
                placeholder="Describe a scene…"
                className="flex-1 border-foreground/10 bg-background/30 placeholder:opacity-50"
              />
              <Button
                onClick={() =>
                  navigate({
                    to: "/campaigns/$id/images",
                    params: { id },
                    search: { prompt: forgePrompt || undefined },
                  })
                }
                className="font-display tracking-widest"
              >
                <Sparkles className="size-4" /> MANIFEST
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {images.map((img) => (
                <Link
                  key={img.id}
                  to="/campaigns/$id/images"
                  params={{ id }}
                  className="group relative aspect-square overflow-hidden rounded outline outline-1 outline-foreground/10"
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 space-y-8 lg:col-span-4">
          {plannerSession && (
            <section className="border-l-4 border-accent bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg italic text-primary underline decoration-accent/30">
                  Session Planner
                </h3>
                <Link
                  to="/campaigns/$id/sessions/$sid"
                  params={{ id, sid: plannerSession.id }}
                  className="text-xs text-accent hover:underline"
                >
                  Open
                </Link>
              </div>
              <p className="mb-4 text-xs uppercase tracking-widest text-muted-foreground">
                {statusLabel[plannerSession.status]} · {plannerSession.title}
              </p>
              {plannerSession.plan && (
                <p className="line-clamp-5 text-sm leading-relaxed text-foreground/80">
                  {plannerSession.plan}
                </p>
              )}
            </section>
          )}

          <section className="rounded border border-accent/10 bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm uppercase tracking-widest text-foreground/60">
                Key NPCs
              </h3>
              <Link
                to="/campaigns/$id/characters"
                params={{ id }}
                className="text-accent hover:text-primary"
              >
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="space-y-4">
              {npcs.map((c) => (
                <Link
                  key={c.id}
                  to="/campaigns/$id/characters/$cid"
                  params={{ id, cid: c.id }}
                  className="flex items-center gap-3 rounded-md p-1 transition-colors hover:bg-accent/5"
                >
                  <CharacterAvatar
                    name={c.name}
                    portraitUrl={c.portraitUrl}
                    disposition={c.disposition}
                    size={40}
                    className="rounded-full"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{c.name}</p>
                    <p
                      className={`text-[10px] uppercase tracking-tight ${
                        c.disposition === "hostile" ? "text-destructive/70" : "text-foreground/50"
                      }`}
                    >
                      {c.disposition === "hostile"
                        ? "Hostile Entity"
                        : c.disposition === "ally"
                          ? "Potential Ally"
                          : "Neutral"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared widgets                                                       */
/* ------------------------------------------------------------------ */
function QuickRules({ id }: { id: string }) {
  return (
    <Link
      to="/campaigns/$id/rules"
      params={{ id }}
      className="block rounded-xl border border-accent/20 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-arcane"
    >
      <BookOpen className="size-6 text-accent" />
      <h3 className="mt-3 font-display text-lg">Rules Q&amp;A</h3>
      <p className="mt-1 text-sm text-foreground/70">
        Ask a rules question and get a cited, grounded answer.
      </p>
    </Link>
  );
}

function QuickLink({
  to,
  id,
  icon: Icon,
  title,
  body,
}: {
  to:
    | "/campaigns/$id/timeline"
    | "/campaigns/$id/rules"
    | "/campaigns/$id/eval"
    | "/campaigns/$id/images";
  id: string;
  icon: typeof BookOpen;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      params={{ id }}
      className="block rounded-xl border border-accent/20 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-arcane"
    >
      <Icon className="size-6 text-accent" />
      <h3 className="mt-3 font-display text-lg">{title}</h3>
      <p className="mt-1 text-sm text-foreground/70">{body}</p>
    </Link>
  );
}
