import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { SectionHeading } from "@/components/campaign-sidebar";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useAppState,
  useServices,
  type CharacterKind,
  type Disposition,
} from "@/services";

export const Route = createFileRoute("/campaigns/$id/characters/")({
  head: () => ({ meta: [{ title: "Character Roster — StoryWeaver" }] }),
  component: RosterPage,
});

function RosterPage() {
  const { id } = Route.useParams();
  const state = useAppState();
  const { data } = useServices();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const pcs = useMemo(
    () => state.characters.filter((c) => c.campaignId === id && c.kind === "pc"),
    [state.characters, id],
  );
  const npcs = useMemo(
    () => state.characters.filter((c) => c.campaignId === id && c.kind === "npc"),
    [state.characters, id],
  );

  const [form, setForm] = useState({
    name: "",
    kind: "pc" as CharacterKind,
    race: "Human",
    discipline: "Warrior",
    disposition: "ally" as Disposition,
    description: "",
    personality: "",
    background: "",
    tone: "",
  });

  const create = () => {
    if (!form.name.trim()) return;
    const c = data.createCharacter({
      campaignId: id,
      kind: form.kind,
      name: form.name.trim(),
      race: form.race,
      discipline: form.discipline,
      disposition: form.disposition,
      description: form.description,
      personality: form.personality,
      background: form.background,
      tone: form.tone || "Neutral and grounded.",
      stats: {},
    });
    setOpen(false);
    navigate({ to: "/campaigns/$id/characters/$cid", params: { id, cid: c.id } });
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 border-primary/10 pb-6">
        <div>
          <h2 className="font-display text-4xl">Character Roster</h2>
          <p className="mt-2 italic text-foreground/60">
            The heroes and horrors of your chronicle. Each carries a digital twin.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="font-display tracking-widest">
            <Link to="/campaigns/$id/characters/new" params={{ id }}>
              <Sparkles className="size-4" /> GUIDED CREATION
            </Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="font-display tracking-widest">
                <Plus className="size-4" /> QUICK ADD
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Inscribe a new soul</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-2">
                {(["pc", "npc"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, kind: k }))}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm transition-colors",
                      form.kind === k
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-accent/40",
                    )}
                  >
                    {k === "pc" ? "Player Character" : "NPC"}
                  </button>
                ))}
              </div>
              <Field label="Name">
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Korgath the Unbroken"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Race">
                  <Input
                    value={form.race}
                    onChange={(e) => setForm((f) => ({ ...f, race: e.target.value }))}
                  />
                </Field>
                <Field label="Discipline">
                  <Input
                    value={form.discipline}
                    onChange={(e) => setForm((f) => ({ ...f, discipline: e.target.value }))}
                  />
                </Field>
              </div>
              <Field label="Personality">
                <Textarea
                  rows={2}
                  value={form.personality}
                  onChange={(e) => setForm((f) => ({ ...f, personality: e.target.value }))}
                  placeholder="Stoic, deliberate, fiercely loyal…"
                />
              </Field>
              <Field label="Voice & tone">
                <Input
                  value={form.tone}
                  onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
                  placeholder="Grave, measured, sparing with words."
                />
              </Field>
            </div>
            <DialogFooter>
              <Button onClick={create} disabled={!form.name.trim()} className="font-display tracking-widest">
                CREATE
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <section className="mb-12">
        <SectionHeading>Player Characters</SectionHeading>
        <RosterGrid id={id} chars={pcs} />
      </section>

      <section>
        <SectionHeading>Non-Player Characters</SectionHeading>
        <RosterGrid id={id} chars={npcs} />
      </section>
    </div>
  );
}

function RosterGrid({
  id,
  chars,
}: {
  id: string;
  chars: ReturnType<typeof useAppState>["characters"];
}) {
  if (chars.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-accent/30 p-8 text-center text-sm text-muted-foreground">
        None yet.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {chars.map((c) => (
        <Link
          key={c.id}
          to="/campaigns/$id/characters/$cid"
          params={{ id, cid: c.id }}
          className="group rounded-lg border border-accent/20 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex gap-4">
            <CharacterAvatar
              name={c.name}
              portraitUrl={c.portraitUrl}
              disposition={c.disposition}
              size={72}
            />
            <div className="min-w-0">
              <h4 className="truncate font-display text-lg group-hover:text-accent">{c.name}</h4>
              <p className="text-sm italic text-foreground/70">
                {c.race} {c.discipline}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                {c.disposition}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
