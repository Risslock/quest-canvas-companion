import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarDays, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppState, useServices, type SessionStatus } from "@/services";

export const Route = createFileRoute("/campaigns/$id/sessions/")({
  head: () => ({ meta: [{ title: "Session Logs — Barsaive Chronicle" }] }),
  component: SessionsPage,
});

const statusStyles: Record<SessionStatus, string> = {
  planned: "border-accent/40 text-accent",
  active: "border-primary/50 bg-primary/10 text-primary",
  done: "border-border text-muted-foreground",
};

const statusLabel: Record<SessionStatus, string> = {
  planned: "Planned",
  active: "In session",
  done: "Concluded",
};

function SessionsPage() {
  const { id } = Route.useParams();
  const state = useAppState();
  const { data } = useServices();
  const navigate = useNavigate();

  const sessions = useMemo(
    () =>
      state.sessions
        .filter((s) => s.campaignId === id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [state.sessions, id],
  );

  const create = () => {
    const s = data.createSession({ campaignId: id, title: `Session ${sessions.length + 1}` });
    navigate({ to: "/campaigns/$id/sessions/$sid", params: { id, sid: s.id } });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-primary/10 pb-6">
        <div>
          <h2 className="font-display text-4xl">Session Logs</h2>
          <p className="mt-2 italic text-foreground/60">
            Plan, run, and chronicle every gathering of the table.
          </p>
        </div>
        <Button onClick={create} className="font-display tracking-widest">
          <Plus className="size-4" /> NEW SESSION
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.map((s) => (
          <Link
            key={s.id}
            to="/campaigns/$id/sessions/$sid"
            params={{ id, sid: s.id }}
            className="block rounded-lg border border-accent/20 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-xl">{s.title}</h3>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest",
                      statusStyles[s.status],
                    )}
                  >
                    {statusLabel[s.status]}
                  </span>
                </div>
                {s.scheduledFor && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    {new Date(s.scheduledFor).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                )}
                <p className="mt-3 line-clamp-2 max-w-2xl text-sm text-foreground/70">
                  {s.summary || s.plan || "No plan written yet."}
                </p>
              </div>
            </div>
          </Link>
        ))}

        {sessions.length === 0 && (
          <button
            onClick={create}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-accent/30 p-10 text-sm text-muted-foreground hover:border-accent/60"
          >
            <Plus className="size-4" /> Schedule your first session
          </button>
        )}
      </div>
    </div>
  );
}
