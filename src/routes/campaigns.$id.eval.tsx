import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { LineChart } from "lucide-react";

import { useAppState, useAuth } from "@/services";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/campaigns/$id/eval")({
  head: () => ({ meta: [{ title: "Rules Evaluation — StoryWeaver" }] }),
  component: EvalPage,
});

function avg(nums: number[]) {
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
}

function EvalPage() {
  const { id } = Route.useParams();
  const state = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "gm") {
      navigate({ to: "/campaigns/$id", params: { id } });
    }
  }, [user, navigate, id]);

  const records = useMemo(
    () =>
      state.evals
        .filter((e) => e.campaignId === id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [state.evals, id],
  );

  const metrics = [
    { key: "faithfulness" as const, label: "Faithfulness", hint: "Grounded in the cited sources" },
    { key: "relevance" as const, label: "Relevance", hint: "On-topic with the question" },
    { key: "accuracy" as const, label: "Accuracy", hint: "Matches the actual rules" },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 border-b-2 border-primary/10 pb-6">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">
          GM power tool — quality of the intelligence behind the scenes
        </p>
        <h2 className="mt-1 flex items-center gap-3 font-display text-4xl">
          <LineChart className="size-8 text-accent" /> Rules Evaluation
        </h2>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {metrics.map((m) => {
          const value = avg(records.map((r) => r[m.key]));
          return (
            <div key={m.key} className="rounded-xl border border-accent/20 bg-card p-6 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{m.label}</p>
              <p
                className={cn(
                  "mt-2 font-display text-5xl font-bold",
                  value >= 85 ? "text-primary" : value >= 65 ? "text-accent" : "text-destructive",
                )}
              >
                {value}
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${value}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{m.hint}</p>
            </div>
          );
        })}
      </div>

      <h3 className="mb-4 font-display text-lg uppercase tracking-wide text-foreground/70">
        Evaluated questions ({records.length})
      </h3>
      <div className="space-y-3">
        {records.map((r) => (
          <div
            key={r.id}
            className="rounded-lg border border-border bg-card/60 p-4 md:flex md:items-center md:gap-6"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium">{r.question}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4 md:mt-0 md:w-80">
              {metrics.map((m) => (
                <Bar key={m.key} label={m.label.slice(0, 4)} value={r[m.key]} />
              ))}
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <p className="rounded-lg border border-dashed border-accent/30 p-10 text-center text-sm text-muted-foreground">
            No evaluations yet. Ask questions in Rules Q&amp;A and they'll be scored here.
          </p>
        )}
      </div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>{label}</span>
        <span className="font-display text-foreground/80">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full",
            value >= 85 ? "bg-primary" : value >= 65 ? "bg-accent" : "bg-destructive",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
