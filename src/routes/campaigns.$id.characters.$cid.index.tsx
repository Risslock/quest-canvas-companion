import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MessageSquarePlus, Plus } from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppState, useServices } from "@/services";

export const Route = createFileRoute("/campaigns/$id/characters/$cid/")({
  head: () => ({
    meta: [
      { title: "Character — StoryWeaver" },
      {
        name: "description",
        content:
          "Character profile, sheet, and digital twin conversations — chat in-character with a persistent AI that remembers the campaign.",
      },
    ],
  }),
  component: CharacterProfile,
});

function CharacterProfile() {
  const { id, cid } = Route.useParams();
  const state = useAppState();
  const { data } = useServices();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const character = state.characters.find((c) => c.id === cid);
  const threads = useMemo(
    () =>
      state.threads
        .filter((t) => t.characterId === cid)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [state.threads, cid],
  );

  if (!character) {
    return <div className="p-8 text-muted-foreground">Character not found.</div>;
  }

  const startThread = (presetTitle?: string) => {
    const t = data.createThread(cid, (presetTitle ?? title).trim() || "New thread");
    setOpen(false);
    setTitle("");
    navigate({
      to: "/campaigns/$id/characters/$cid/$threadId",
      params: { id, cid, threadId: t.id },
    });
  };

  return (
    <div className="p-6 md:p-8">
      <Link
        to="/campaigns/$id/characters"
        params={{ id }}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
      >
        <ArrowLeft className="size-4" /> Roster
      </Link>

      <div className="grid grid-cols-12 gap-8">
        {/* Profile */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-lg border border-accent/20 bg-card p-6 shadow-sm">
            <div className="flex gap-5">
              <CharacterAvatar
                name={character.name}
                portraitUrl={character.portraitUrl}
                disposition={character.disposition}
                size={120}
              />
              <div className="min-w-0">
                <h2 className="font-display text-2xl leading-tight">{character.name}</h2>
                <p className="italic text-foreground/70">
                  {character.race} {character.discipline}
                  {character.circle ? ` · Circle ${character.circle}` : ""}
                </p>
                <span className="mt-2 inline-block rounded border border-accent/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-accent">
                  {character.kind === "pc" ? "Player Character" : "NPC"} · {character.disposition}
                </span>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-foreground/80">
              {character.description}
            </p>

            <dl className="mt-6 space-y-4 text-sm">
              <Detail term="Personality" value={character.personality} />
              <Detail term="Background" value={character.background} />
              <Detail term="Voice & tone" value={character.tone} />
            </dl>

            {Object.keys(character.stats).length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 font-display text-xs uppercase tracking-widest text-foreground/50">
                  Stats
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(character.stats).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between rounded border border-accent/15 bg-background px-3 py-1.5"
                    >
                      <span className="text-xs text-muted-foreground">{k}</span>
                      <span className="font-display text-sm">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Threads */}
        <div className="col-span-12 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl">Twin Conversations</h3>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="font-display tracking-widest">
                  <Plus className="size-4" /> NEW THREAD
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">Begin a new thread</DialogTitle>
                </DialogHeader>
                <div className="space-y-1.5 py-2">
                  <Label htmlFor="t-title">Topic</Label>
                  <Input
                    id="t-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && startThread()}
                    placeholder="On entering the Kaer…"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={() => startThread()} className="font-display tracking-widest">
                    START
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <p className="mb-4 text-sm italic text-foreground/60">
            Each thread keeps {character.name.split(" ")[0]} in character on a single topic.
          </p>

          <div className="space-y-3">
            {threads.map((t) => {
              const count = state.messages.filter((m) => m.threadId === t.id).length;
              return (
                <Link
                  key={t.id}
                  to="/campaigns/$id/characters/$cid/$threadId"
                  params={{ id, cid, threadId: t.id }}
                  className="flex items-center justify-between rounded-lg border border-accent/20 bg-card p-4 transition-colors hover:border-accent/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-base">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {count} message{count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <MessageSquarePlus className="size-4 shrink-0 text-accent" />
                </Link>
              );
            })}

            {threads.length === 0 && (
              <button
                onClick={() => startThread("First conversation")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-accent/30 p-8 text-sm text-muted-foreground hover:border-accent/60"
              >
                <MessageSquarePlus className="size-4" /> Start the first conversation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ term, value }: { term: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="font-display text-xs uppercase tracking-widest text-foreground/50">{term}</dt>
      <dd className="mt-1 leading-relaxed text-foreground/80">{value}</dd>
    </div>
  );
}
