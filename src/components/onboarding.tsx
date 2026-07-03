import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Check, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Local-storage backed flags (no data-model changes)                  */
/* ------------------------------------------------------------------ */
function readFlag(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeFlag(key: string, val: string) {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}
function clearFlag(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Set at sign-up time so the campaigns page can greet a brand-new GM once. */
export function markWelcomePending(userId: string) {
  writeFlag(`sw:welcome-pending:${userId}`, "1");
}

/** True only until the welcome panel is dismissed for this user. */
export function useWelcomePending(userId?: string): readonly [boolean, () => void] {
  const key = userId ? `sw:welcome-pending:${userId}` : "";
  const [pending, setPending] = useState(false);
  useEffect(() => {
    setPending(!!key && readFlag(key) === "1");
  }, [key]);
  const dismiss = useCallback(() => {
    if (key) clearFlag(key);
    setPending(false);
  }, [key]);
  return [pending, dismiss] as const;
}

/** Generic "dismiss forever" flag, keyed by an arbitrary string. */
export function useDismissed(key: string): readonly [boolean, () => void] {
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    setDismissed(readFlag(key) === "1");
  }, [key]);
  const dismiss = useCallback(() => {
    writeFlag(key, "1");
    setDismissed(true);
  }, [key]);
  return [dismissed, dismiss] as const;
}

/* ------------------------------------------------------------------ */
/* Presentational pieces                                               */
/* ------------------------------------------------------------------ */
export function WelcomePanel({
  name,
  onDismiss,
  action,
}: {
  name?: string;
  onDismiss: () => void;
  action: ReactNode;
}) {
  return (
    <section className="relative mb-10 overflow-hidden rounded-xl border border-accent/25 bg-card/70 p-6 shadow-arcane backdrop-blur md:p-8">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss welcome"
        className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <p className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-[0.3em] text-accent">
        <Sparkles className="size-3" /> Welcome, {name || "Game Master"}
      </p>
      <h2 className="mt-3 max-w-2xl font-display text-2xl">
        Your tireless backstage crew is ready.
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/70">
        StoryWeaver remembers every beat, voices every NPC, and drafts your sessions — so you can
        run the table, not the paperwork. Start by founding your first chronicle.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {action}
        <Button variant="ghost" onClick={onDismiss} className="text-muted-foreground">
          Maybe later
        </Button>
      </div>
    </section>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: typeof Sparkles;
  title: string;
  body: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid place-items-center rounded-xl border border-dashed border-accent/30 p-10 text-center",
        className,
      )}
    >
      <span className="grid size-12 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 font-display text-lg">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export interface ChecklistItem {
  label: string;
  hint?: string;
  done: boolean;
  action?: ReactNode;
}

export function ChecklistCard({
  title,
  items,
  onDismiss,
}: {
  title: string;
  items: ChecklistItem[];
  onDismiss: () => void;
}) {
  const completed = items.filter((i) => i.done).length;
  return (
    <section className="relative mb-10 overflow-hidden rounded-xl border border-accent/25 bg-card/70 p-6 shadow-arcane backdrop-blur">
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss getting started"
        className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">Getting started</p>
      <div className="mt-1 flex items-baseline gap-3">
        <h3 className="font-display text-xl">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {completed} of {items.length} done
        </span>
      </div>

      <ul className="mt-5 space-y-2">
        {items.map((item) => (
          <li
            key={item.label}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3 transition-colors",
              item.done
                ? "border-border/60 bg-background/40"
                : "border-accent/20 bg-background/60",
            )}
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full border",
                item.done
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-border text-muted-foreground",
              )}
            >
              {item.done ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-display text-sm",
                  item.done && "text-muted-foreground line-through",
                )}
              >
                {item.label}
              </p>
              {item.hint && !item.done && (
                <p className="text-xs text-muted-foreground">{item.hint}</p>
              )}
            </div>
            {!item.done && item.action}
          </li>
        ))}
      </ul>
    </section>
  );
}
