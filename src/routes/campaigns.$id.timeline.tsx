import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Filter, ScrollText } from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { SectionHeading } from "@/components/campaign-sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppState, useAuth } from "@/services";

export const Route = createFileRoute("/campaigns/$id/timeline")({
  head: () => ({ meta: [{ title: "Story Timeline — StoryWeaver" }] }),
  component: TimelinePage,
});

function TimelinePage() {
  const { id } = Route.useParams();
  const state = useAppState();
  const { user } = useAuth();
  const isGm = user?.role === "gm";
  const [characterFilter, setCharacterFilter] = useState<string | null>(null);

  const characters = useMemo(
    () => state.characters.filter((c) => c.campaignId === id),
    [state.characters, id],
  );
  const charById = useMemo(
    () => Object.fromEntries(characters.map((c) => [c.id, c])),
    [characters],
  );

  const events = useMemo(() => {
    return state.timeline
      .filter((e) => e.campaignId === id)
      .filter((e) => isGm || e.visibility === "all")
      .filter((e) => !characterFilter || e.characterIds.includes(characterFilter))
      .sort((a, b) => b.occurredAt - a.occurredAt);
  }, [state.timeline, id, isGm, characterFilter]);

  const sessionTitle = (sid?: string) =>
    state.sessions.find((s) => s.id === sid)?.title;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-primary/10 pb-6">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">
            The shared memory of the campaign
          </p>
          <h2 className="mt-1 flex items-center gap-3 font-display text-4xl">
            <ScrollText className="size-8 text-accent" /> Story Timeline
          </h2>
        </div>
        {!isGm && (
          <p className="text-xs text-muted-foreground">
            You see what your character would know.
          </p>
        )}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
          <Filter className="size-3.5" /> Filter
        </span>
        <Button
          variant={characterFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setCharacterFilter(null)}
          className="font-display text-[10px] tracking-widest"
        >
          ALL
        </Button>
        {characters.map((c) => (
          <Button
            key={c.id}
            variant={characterFilter === c.id ? "default" : "outline"}
            size="sm"
            onClick={() => setCharacterFilter(c.id)}
            className="font-display text-[10px] tracking-widest"
          >
            {c.name.split(" ")[0].toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="surface-parchment relative mx-auto max-w-3xl rounded-xl p-6 shadow-arcane md:p-10">
        <SectionHeading className="!text-parchment-foreground">Chronicle</SectionHeading>
        {events.length === 0 ? (
          <p className="py-10 text-center text-sm italic opacity-70">
            No remembered events yet. They appear here as your sessions unfold.
          </p>
        ) : (
          <ol className="relative space-y-8 border-l-2 border-current/15 pl-6">
            {events.map((e) => (
              <li key={e.id} className="relative">
                <span
                  className={cn(
                    "absolute -left-[31px] top-1.5 size-3.5 rounded-full ring-4 ring-[var(--parchment)]",
                    e.visibility === "gm" ? "bg-accent" : "bg-primary",
                  )}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest opacity-60">
                    {new Date(e.occurredAt).toLocaleDateString()}
                    {sessionTitle(e.sessionId) ? ` · ${sessionTitle(e.sessionId)}` : ""}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                      e.visibility === "gm"
                        ? "bg-accent/20 text-accent-foreground/80"
                        : "bg-primary/15 text-primary",
                    )}
                  >
                    {e.visibility === "gm" ? (
                      <>
                        <EyeOff className="size-2.5" /> GM only
                      </>
                    ) : (
                      <>
                        <Eye className="size-2.5" /> Shared
                      </>
                    )}
                  </span>
                </div>
                <h4 className="mt-1 font-display text-lg">{e.title}</h4>
                <p className="mt-1 text-sm leading-relaxed opacity-80">{e.body}</p>
                {e.characterIds.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    {e.characterIds.map((cid) =>
                      charById[cid] ? (
                        <CharacterAvatar
                          key={cid}
                          name={charById[cid].name}
                          portraitUrl={charById[cid].portraitUrl}
                          disposition={charById[cid].disposition}
                          size={28}
                          className="rounded-full"
                        />
                      ) : null,
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
