import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { SectionHeading } from "@/components/campaign-sidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAppState, useServices, type ImageKind } from "@/services";

type ImageSearch = { prompt?: string };

export const Route = createFileRoute("/campaigns/$id/images")({
  validateSearch: (search: Record<string, unknown>): ImageSearch => ({
    prompt: typeof search.prompt === "string" ? search.prompt : undefined,
  }),
  head: () => ({ meta: [{ title: "Forge of Visions — StoryWeaver" }] }),
  component: ImagesPage,
});

const kinds: { value: ImageKind; label: string }[] = [
  { value: "scene", label: "Scene" },
  { value: "portrait", label: "Portrait" },
  { value: "npc", label: "NPC" },
];

function ImagesPage() {
  const { id } = Route.useParams();
  const initial = Route.useSearch();
  const state = useAppState();
  const { images, data } = useServices();

  const [prompt, setPrompt] = useState(initial.prompt ?? "");
  const [kind, setKind] = useState<ImageKind>("scene");
  const [generating, setGenerating] = useState(false);

  const gallery = useMemo(
    () => state.images.filter((img) => img.campaignId === id),
    [state.images, id],
  );

  const generate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    try {
      const { url } = await images.generate(prompt.trim(), kind);
      data.saveImage({ campaignId: id, prompt: prompt.trim(), url, kind });
      toast.success("Vision manifested.");
      setPrompt("");
    } catch {
      toast.error("The forge sputtered. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 border-b-2 border-primary/10 pb-6">
        <h2 className="font-display text-4xl">Forge of Visions</h2>
        <p className="mt-2 italic text-foreground/60">
          Conjure portraits, NPCs, and scenes from a prompt. Build a living gallery for your chronicle.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Studio */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-lg bg-ink p-6 text-parchment shadow-arcane">
            <h3 className="mb-4 font-display text-sm uppercase tracking-[0.2em] text-parchment/50">
              Arcane Visualization
            </h3>

            <div
              className={cn(
                "mb-4 grid aspect-video place-items-center overflow-hidden rounded border border-white/10 bg-white/5",
                generating && "animate-arcane-pulse",
              )}
            >
              {generating ? (
                <div className="flex flex-col items-center gap-2 text-parchment/40">
                  <Wand2 className="size-6 animate-pulse text-accent" />
                  <span className="text-[10px] uppercase tracking-[0.2em]">Channeling sigil…</span>
                </div>
              ) : gallery[0] ? (
                <img
                  src={gallery[0].url}
                  alt={gallery[0].prompt}
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-[10px] uppercase tracking-[0.2em] text-parchment/30">
                  Your visions appear here
                </span>
              )}
            </div>

            <div className="mb-3 flex gap-2">
              {kinds.map((k) => (
                <button
                  key={k.value}
                  onClick={() => setKind(k.value)}
                  className={cn(
                    "flex-1 rounded border px-2 py-1.5 text-xs transition-colors",
                    kind === k.value
                      ? "border-accent bg-accent/20 text-accent"
                      : "border-white/10 text-parchment/60 hover:border-white/30",
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>

            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-parchment/40">
              Creative prompt
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Ruined towers of Parlainth under an astral storm, dark fantasy oil painting…"
              className="mb-3 resize-none border-white/10 bg-white/5 text-parchment placeholder:text-parchment/40 focus-visible:ring-accent"
            />
            <Button
              onClick={generate}
              disabled={!prompt.trim() || generating}
              className="w-full bg-accent font-display tracking-[0.2em] text-accent-foreground hover:bg-accent/90"
            >
              <Sparkles className="size-4" />
              {generating ? "MANIFESTING…" : "MANIFEST VISION"}
            </Button>
            <p className="mt-3 text-center text-[10px] text-parchment/30">
              Mock generator — swap in any image provider later.
            </p>
          </div>
        </div>

        {/* Gallery */}
        <div className="col-span-12 lg:col-span-7">
          <SectionHeading className="!mb-5 !text-lg">Gallery</SectionHeading>
          {gallery.length === 0 ? (
            <p className="rounded-lg border border-dashed border-accent/30 p-10 text-center text-sm text-muted-foreground">
              No visions yet. Forge your first.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {gallery.map((img) => (
                <figure
                  key={img.id}
                  className="group overflow-hidden rounded-lg border border-accent/20 bg-card"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.prompt}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="line-clamp-2 p-2.5 text-xs text-foreground/70">
                    {img.prompt}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
