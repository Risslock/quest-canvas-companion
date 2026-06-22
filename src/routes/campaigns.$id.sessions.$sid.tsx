import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ScrollText, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAppState, useServices, type SessionStatus } from "@/services";

export const Route = createFileRoute("/campaigns/$id/sessions/$sid")({
  component: SessionDetail,
});

const statuses: SessionStatus[] = ["planned", "active", "done"];
const statusLabel: Record<SessionStatus, string> = {
  planned: "Planned",
  active: "In session",
  done: "Concluded",
};

function SessionDetail() {
  const { id, sid } = Route.useParams();
  const state = useAppState();
  const { data, summary } = useServices();

  const session = state.sessions.find((s) => s.id === sid);
  const [summarizing, setSummarizing] = useState(false);
  const [streamingSummary, setStreamingSummary] = useState("");

  if (!session) {
    return <div className="p-8 text-muted-foreground">Session not found.</div>;
  }

  const generateSummary = async () => {
    if (summarizing) return;
    setSummarizing(true);
    setStreamingSummary("");
    try {
      let acc = "";
      for await (const token of summary.streamSummary(session)) {
        acc += token;
        setStreamingSummary(acc);
      }
      data.updateSession(sid, { summary: acc });
      toast.success("Chronicle written.");
    } catch {
      toast.error("The quill ran dry. Try again.");
    } finally {
      setSummarizing(false);
      setStreamingSummary("");
    }
  };

  return (
    <div className="p-6 md:p-8">
      <Link
        to="/campaigns/$id/sessions"
        params={{ id }}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
      >
        <ArrowLeft className="size-4" /> Session Logs
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-primary/10 pb-6">
        <div className="min-w-0">
          <Input
            value={session.title}
            onChange={(e) => data.updateSession(sid, { title: e.target.value })}
            className="h-auto border-0 bg-transparent p-0 font-display text-3xl shadow-none focus-visible:ring-0 md:text-4xl"
          />
          <div className="mt-3 flex items-center gap-2">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Scheduled
            </Label>
            <Input
              type="date"
              value={session.scheduledFor ?? ""}
              onChange={(e) => data.updateSession(sid, { scheduledFor: e.target.value })}
              className="h-8 w-auto"
            />
          </div>
        </div>

        <div className="flex gap-1 rounded-md border border-border p-1">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => data.updateSession(sid, { status: st })}
              className={cn(
                "rounded px-3 py-1.5 font-display text-[10px] tracking-widest transition-colors",
                session.status === st
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:text-foreground",
              )}
            >
              {statusLabel[st].toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Planning */}
        <section className="col-span-12 lg:col-span-6">
          <h3 className="mb-3 font-display text-lg italic text-primary underline decoration-accent/30">
            Planning
          </h3>
          <Textarea
            value={session.plan}
            onChange={(e) => data.updateSession(sid, { plan: e.target.value })}
            rows={8}
            placeholder="Outline scenes, encounters, hooks, and the beats you want to hit…"
            className="resize-none bg-card"
          />
        </section>

        {/* Live notes */}
        <section className="col-span-12 lg:col-span-6">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg italic text-primary underline decoration-accent/30">
            <span className="size-2 rounded-full bg-accent" /> Live Notes
          </h3>
          <Textarea
            value={session.notes}
            onChange={(e) => data.updateSession(sid, { notes: e.target.value })}
            rows={8}
            placeholder="Capture what actually happens at the table as it unfolds…"
            className="resize-none bg-card"
          />
        </section>

        {/* Summary */}
        <section className="col-span-12">
          <div className="rounded-lg border-l-4 border-accent bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg">
                <ScrollText className="size-5 text-accent" /> AI Auto-Summary
              </h3>
              <Button
                onClick={generateSummary}
                disabled={summarizing}
                variant="outline"
                className="border-accent/40 font-display text-xs tracking-widest text-accent hover:bg-accent hover:text-accent-foreground"
              >
                <Sparkles className="size-4" />
                {summarizing ? "WRITING…" : session.summary ? "REGENERATE" : "GENERATE"}
              </Button>
            </div>

            {summarizing && streamingSummary ? (
              <p className="whitespace-pre-wrap text-sm italic leading-relaxed text-foreground/80">
                {streamingSummary}
              </p>
            ) : session.summary ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                {session.summary}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {summarizing
                  ? "Summoning the chronicle…"
                  : "Jot down live notes, then generate a recap with one click."}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
