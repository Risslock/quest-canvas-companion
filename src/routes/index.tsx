import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, MessageCircle, ScrollText, Wand2 } from "lucide-react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import sceneAstral from "@/assets/scene-astral.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Barsaive Chronicle — Earthdawn Roleplaying Companion" },
      {
        name: "description",
        content:
          "AI-powered character digital twins, art generation, and session planning for Earthdawn 4e tabletop campaigns.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: MessageCircle,
    title: "Digital Twins",
    body: "Give every character and NPC a voice. Threaded, in-character chats powered by AI help players and GMs breathe life into the table.",
  },
  {
    icon: Wand2,
    title: "Forge of Visions",
    body: "Conjure portraits, NPCs, and scenes from a prompt. Build a living gallery of art for your campaign.",
  },
  {
    icon: ScrollText,
    title: "Session Chronicles",
    body: "Plan sessions, take live notes, and let the chronicle write itself with one-click AI summaries.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Brand />
        <Button asChild variant="outline">
          <Link to="/auth">Enter the Chronicle</Link>
        </Button>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${sceneAstral})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-accent">
            For Earthdawn 4th Edition
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-primary md:text-6xl">
            Your campaign,
            <br />
            given life.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg italic text-foreground/70">
            A roleplaying companion for Barsaive. Speak with your characters, conjure the
            horrors of the Scourge, and let your sessions become legend.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="font-display tracking-widest">
              <Link to="/campaigns">Open Campaigns</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-display tracking-widest">
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-lg border border-accent/20 bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Icon className="size-7 text-accent" />
              <h2 className="mt-4 font-display text-xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <BookOpen className="size-4" />
          Provider-agnostic by design — bring your own AI, auth, and storage later.
        </div>
      </section>
    </div>
  );
}
