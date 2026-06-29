import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";

import { CharacterAvatar } from "@/components/character-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  useServices,
  type CharacterKind,
  type Disposition,
  type Relationship,
} from "@/services";

export const Route = createFileRoute("/campaigns/$id/characters/new")({
  head: () => ({ meta: [{ title: "Create a Character — StoryWeaver" }] }),
  component: CharacterWizard,
});

const STEPS = ["Identity", "Discipline & Talents", "Story & Voice", "Bonds & Goals", "Review"];

type Form = {
  kind: CharacterKind;
  name: string;
  race: string;
  discipline: string;
  circle: string;
  disposition: Disposition;
  talents: string;
  description: string;
  personality: string;
  background: string;
  tone: string;
  goals: string;
  relationships: Relationship[];
};

const EMPTY: Form = {
  kind: "pc",
  name: "",
  race: "Human",
  discipline: "Warrior",
  circle: "1",
  disposition: "ally",
  talents: "",
  description: "",
  personality: "",
  background: "",
  tone: "",
  goals: "",
  relationships: [{ name: "", relation: "" }],
};

function CharacterWizard() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useServices();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canNext = step !== 0 || form.name.trim().length > 0;
  const last = step === STEPS.length - 1;

  const create = () => {
    const c = data.createCharacter({
      campaignId: id,
      kind: form.kind,
      name: form.name.trim(),
      race: form.race,
      discipline: form.discipline,
      circle: form.circle ? Number(form.circle) : undefined,
      disposition: form.disposition,
      description: form.description,
      personality: form.personality,
      background: form.background,
      tone: form.tone || "Neutral and grounded.",
      stats: {},
      talents: form.talents
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      goals: form.goals
        .split("\n")
        .map((g) => g.trim())
        .filter(Boolean),
      relationships: form.relationships.filter((r) => r.name.trim()),
    });
    navigate({ to: "/campaigns/$id/characters/$cid", params: { id, cid: c.id } });
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

      <h2 className="font-display text-4xl">Guided Character Creation</h2>
      <p className="mt-2 italic text-foreground/60">
        Capture who they are — so their digital twin is genuinely smarter, not just a sheet.
      </p>

      {/* Stepper */}
      <div className="mt-8 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => i < step && setStep(i)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors",
              i === step
                ? "border-primary bg-primary/10 text-primary"
                : i < step
                  ? "border-accent/40 text-accent"
                  : "border-border text-muted-foreground",
            )}
          >
            <span className="grid size-5 place-items-center rounded-full bg-current/10 font-display text-[10px]">
              {i < step ? <Check className="size-3" /> : i + 1}
            </span>
            {s}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-xl border border-accent/20 bg-card p-6 shadow-sm">
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {(["pc", "npc"] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => set("kind", k)}
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
                    autoFocus
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Zephyrine Whisper"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Race">
                    <Input value={form.race} onChange={(e) => set("race", e.target.value)} />
                  </Field>
                  <Field label="Disposition">
                    <select
                      value={form.disposition}
                      onChange={(e) => set("disposition", e.target.value as Disposition)}
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                    >
                      <option value="ally">Ally</option>
                      <option value="neutral">Neutral</option>
                      <option value="hostile">Hostile</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Discipline / Class">
                    <Input
                      value={form.discipline}
                      onChange={(e) => set("discipline", e.target.value)}
                    />
                  </Field>
                  <Field label="Circle / Level">
                    <Input
                      type="number"
                      min={1}
                      value={form.circle}
                      onChange={(e) => set("circle", e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Talents (comma-separated)">
                  <Textarea
                    rows={3}
                    value={form.talents}
                    onChange={(e) => set("talents", e.target.value)}
                    placeholder="Spellcasting, Astral Sight, Spirit Talk"
                  />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Field label="Description">
                  <Textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="A palm-sized scholar of the spaces between life and death…"
                  />
                </Field>
                <Field label="Personality">
                  <Textarea
                    rows={2}
                    value={form.personality}
                    onChange={(e) => set("personality", e.target.value)}
                    placeholder="Curious to a fault, mischievous, secretly tender-hearted…"
                  />
                </Field>
                <Field label="Background">
                  <Textarea
                    rows={3}
                    value={form.background}
                    onChange={(e) => set("background", e.target.value)}
                    placeholder="Where they came from, and what they left behind…"
                  />
                </Field>
                <Field label="Voice & tone">
                  <Input
                    value={form.tone}
                    onChange={(e) => set("tone", e.target.value)}
                    placeholder="Quick, lyrical, faintly eerie."
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <Field label="Goals (one per line)">
                  <Textarea
                    rows={3}
                    value={form.goals}
                    onChange={(e) => set("goals", e.target.value)}
                    placeholder={"Earn the trust of a spirit that will not lie\nLearn the Blood Wood's true bargain"}
                  />
                </Field>
                <div className="space-y-2">
                  <Label>Relationships</Label>
                  {form.relationships.map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={r.name}
                        onChange={(e) =>
                          set(
                            "relationships",
                            form.relationships.map((x, j) =>
                              j === i ? { ...x, name: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="Name"
                      />
                      <Input
                        value={r.relation}
                        onChange={(e) =>
                          set(
                            "relationships",
                            form.relationships.map((x, j) =>
                              j === i ? { ...x, relation: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder="Relation"
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      set("relationships", [...form.relationships, { name: "", relation: "" }])
                    }
                  >
                    Add relationship
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Review the soul you've inscribed. The twin will draw on all of it.
                </p>
                <ReviewRow label="Talents" value={form.talents || "—"} />
                <ReviewRow label="Goals" value={form.goals || "—"} />
                <ReviewRow
                  label="Bonds"
                  value={
                    form.relationships
                      .filter((r) => r.name)
                      .map((r) => `${r.name} (${r.relation})`)
                      .join(", ") || "—"
                  }
                />
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
            {last ? (
              <Button
                onClick={create}
                disabled={!form.name.trim()}
                className="font-display tracking-widest glow-gold"
              >
                <Sparkles className="size-4" /> CREATE TWIN
              </Button>
            ) : (
              <Button
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={!canNext}
                className="font-display tracking-widest"
              >
                Next <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="col-span-12 lg:col-span-5">
          <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
            Live preview
          </p>
          <div className="rounded-xl border border-accent/20 bg-card p-6 shadow-arcane">
            <div className="flex gap-4">
              <CharacterAvatar
                name={form.name || "New Soul"}
                disposition={form.disposition}
                size={88}
              />
              <div className="min-w-0">
                <h4 className="truncate font-display text-xl">{form.name || "Unnamed"}</h4>
                <p className="text-sm italic text-foreground/70">
                  {form.race} {form.discipline}
                  {form.circle ? ` · Circle ${form.circle}` : ""}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {form.kind === "pc" ? "Player Character" : "NPC"} · {form.disposition}
                </p>
              </div>
            </div>
            {form.description && (
              <p className="mt-4 text-sm leading-relaxed text-foreground/80">{form.description}</p>
            )}
            {form.tone && (
              <p className="mt-3 rounded-md border border-accent/20 bg-accent/5 px-3 py-2 text-xs italic text-accent">
                Voice: {form.tone}
              </p>
            )}
            {form.talents && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {form.talents
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs"
                    >
                      {t}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 border-b border-border py-2">
      <span className="w-24 shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="whitespace-pre-line">{value}</span>
    </div>
  );
}
