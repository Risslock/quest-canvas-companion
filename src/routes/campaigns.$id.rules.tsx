import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Lock, Send, Sparkles } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAppState, useAuth, useServices } from "@/services";
import type { RuleAnswer } from "@/services";

export const Route = createFileRoute("/campaigns/$id/rules")({
  head: () => ({ meta: [{ title: "Rules Q&A — StoryWeaver" }] }),
  component: RulesPage,
});

const SUGGESTIONS = [
  "How does spellcasting work?",
  "What's the penalty for casting while injured?",
  "How does Karma refresh?",
];

function RulesPage() {
  const { id } = Route.useParams();
  const state = useAppState();
  const { user } = useAuth();
  const { knowledge, data } = useServices();
  const isGm = user?.role === "gm";

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<RuleAnswer | null>(null);
  const [asked, setAsked] = useState("");

  const sources = useMemo(
    () =>
      state.knowledge
        .filter((s) => s.campaignId === id)
        .filter((s) => isGm || !s.gmOnly),
    [state.knowledge, id, isGm],
  );

  const ask = async (q: string) => {
    const query = q.trim();
    if (!query || loading) return;
    setLoading(true);
    setAsked(query);
    setAnswer(null);
    const result = await knowledge.ask(query, sources);
    setAnswer(result);
    data.addEval({
      campaignId: id,
      question: query,
      faithfulness: result.scores.faithfulness,
      relevance: result.scores.relevance,
      accuracy: result.scores.accuracy,
    });
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 border-b-2 border-primary/10 pb-6">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">
          Grounded in your sourcebooks — never hallucinated
        </p>
        <h2 className="mt-1 flex items-center gap-3 font-display text-4xl">
          <BookOpen className="size-8 text-accent" /> Rules &amp; Knowledge
        </h2>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(question)}
            placeholder="Ask anything about the rules…"
            className="flex-1"
          />
          <Button
            onClick={() => ask(question)}
            disabled={loading || !question.trim()}
            className="font-display tracking-widest"
          >
            <Send className="size-4" /> ASK
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuestion(s);
                ask(s);
              }}
              className="rounded-full border border-accent/25 bg-accent/5 px-3 py-1 text-xs text-foreground/70 transition-colors hover:border-accent/50 hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
            <Spinner /> Consulting the sourcebooks…
          </div>
        )}

        {answer && !loading && (
          <div className="mt-8 space-y-5">
            <div className="rounded-xl border border-accent/20 bg-card p-6 shadow-sm">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-accent">
                Answer
              </p>
              <p className="mb-4 text-xs italic text-muted-foreground">“{asked}”</p>
              <p className="whitespace-pre-line leading-relaxed">{answer.answer}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <ScoreChip label="Faithfulness" value={answer.scores.faithfulness} />
                <ScoreChip label="Relevance" value={answer.scores.relevance} />
                <ScoreChip label="Accuracy" value={answer.scores.accuracy} />
              </div>
            </div>

            {answer.citations.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Sparkles className="size-3.5" /> Sources
                </p>
                <Accordion type="single" collapsible className="rounded-lg border border-border">
                  {answer.citations.map((c, i) => (
                    <AccordionItem key={c.sourceId} value={c.sourceId} className="px-4">
                      <AccordionTrigger className="text-sm">
                        <span className="flex items-center gap-2 text-left">
                          <Badge variant="outline" className="shrink-0">
                            {i + 1}
                          </Badge>
                          {c.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-foreground/80">
                        {c.excerpt}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        )}

        <div className="mt-12">
          <p className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            <span>Knowledge sources ({sources.length})</span>
            {!isGm && (
              <span className="flex items-center gap-1 text-[10px]">
                <Lock className="size-3" /> GM-only lore hidden
              </span>
            )}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {sources.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-border bg-card/60 p-4"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="font-display text-sm">{s.title}</p>
                  {s.gmOnly && (
                    <Badge variant="outline" className="gap-1 text-accent">
                      <Lock className="size-2.5" /> GM
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.kind}
                </p>
                <p className="mt-2 line-clamp-3 text-sm text-foreground/70">{s.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 85 ? "text-primary" : value >= 65 ? "text-accent" : "text-destructive";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-display font-bold ${tone}`}>{value}</span>
    </span>
  );
}
