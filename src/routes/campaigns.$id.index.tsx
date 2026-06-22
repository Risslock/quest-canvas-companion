import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Plus, Sparkles } from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { SectionHeading } from "@/components/campaign-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, useServices } from "@/services";

export const Route = createFileRoute("/campaigns/$id/")({
  component: CampaignHub,
});

const statusLabel: Record<string, string> = {
  planned: "Planned",
  active: "In session",
  done: "Concluded",
};

function CampaignHub() {
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
    const s = data.createSession({
      campaignId: id,
      title: `Session ${sessions.length + 1}`,
    });
    navigate({ to: "/campaigns/$id/sessions/$sid", params: { id, sid: s.id } });
  };

  const manifest = () => {
    navigate({
      to: "/campaigns/$id/images",
      params: { id },
      search: { prompt: forgePrompt || undefined },
    });
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
                <EmptyHint to={`roster`} id={id} label="No characters yet — add your party." />
              )}
            </div>
          </section>

          <section className="rounded-lg bg-ink p-8 text-parchment shadow-arcane">
            <h3 className="font-display text-xl text-accent">Forge of Visions</h3>
            <p className="mb-6 mt-1 text-sm text-parchment/60">
              Manifest the horrors and heroes of the Scourge.
            </p>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row">
              <Input
                value={forgePrompt}
                onChange={(e) => setForgePrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && manifest()}
                placeholder="Describe a scene on the Serpent River…"
                className="flex-1 border-white/10 bg-white/5 text-parchment placeholder:text-parchment/40 focus-visible:ring-accent"
              />
              <Button
                onClick={manifest}
                className="bg-accent font-display tracking-widest text-accent-foreground hover:bg-accent/90"
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
                  className="group relative aspect-square overflow-hidden rounded outline outline-1 outline-white/10"
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

              {plannerSession.notes && (
                <div className="relative mb-6 border-l border-accent/30 pl-4">
                  <span className="absolute -left-1 top-0 size-2 rounded-full bg-accent" />
                  <h5 className="mb-2 text-xs font-bold tracking-widest text-foreground/40">
                    LIVE NOTES
                  </h5>
                  <p className="line-clamp-4 text-sm leading-relaxed">{plannerSession.notes}</p>
                </div>
              )}

              {plannerSession.summary && (
                <div className="rounded border border-accent/10 bg-background p-4">
                  <h5 className="mb-2 text-[10px] font-bold tracking-widest text-accent">
                    AI AUTO-SUMMARY
                  </h5>
                  <p className="line-clamp-5 text-sm italic leading-relaxed text-foreground/80">
                    {plannerSession.summary}
                  </p>
                </div>
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

function EmptyHint({ id, label }: { id: string; to: string; label: string }) {
  return (
    <Link
      to="/campaigns/$id/characters"
      params={{ id }}
      className="grid place-items-center rounded-lg border border-dashed border-accent/30 p-8 text-center text-sm text-muted-foreground hover:border-accent/60"
    >
      {label}
    </Link>
  );
}
