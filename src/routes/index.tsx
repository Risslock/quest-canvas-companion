import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Image as ImageIcon,
  MessageCircle,
  ScrollText,
  Sparkles,
  UserPlus,
  Wand2,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import heroArt from "@/assets/scene-storyweaver-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StoryWeaver — AI Companion for Tabletop RPG Campaigns" },
      {
        name: "description",
        content:
          "StoryWeaver remembers every story beat, voices every NPC, generates portraits and scene art, and answers rules questions — so your table can focus on the adventure.",
      },
      { property: "og:title", content: "StoryWeaver — AI Tabletop RPG Companion" },
      {
        property: "og:description",
        content:
          "Living digital twins, an automatic campaign timeline, cited rules Q&A, and AI session planning.",
      },
      { property: "og:image", content: heroArt },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: MessageCircle,
    title: "Digital Twins",
    body: "Every character and NPC becomes a persistent AI agent that knows its backstory and remembers the campaign — responding in a consistent voice, session after session.",
  },
  {
    icon: ScrollText,
    title: "Living Story History",
    body: "A searchable timeline built automatically from your sessions. GMs see everything; players see what their character would know.",
  },
  {
    icon: BookOpen,
    title: "Game Knowledge Q&A",
    body: "Ask rules questions in plain language and get grounded, cited answers pulled from the actual sourcebooks — never hallucinated. GM-only lore stays GM-only.",
  },
  {
    icon: ImageIcon,
    title: "Portraits & Scene Art",
    body: "Turn a description into a custom portrait, or conjure an illustration mid-session. The world goes from abstract to vivid.",
  },
  {
    icon: UserPlus,
    title: "Guided Character Creation",
    body: "A step-by-step builder that captures identity, talents, relationships, and goals — structured so the digital twin is genuinely smarter.",
  },
  {
    icon: Wand2,
    title: "Session Planning",
    body: "A GM agent reads the campaign history, knows the open threads and available NPCs, and drafts a full session outline in minutes.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <Brand />
        <Button asChild variant="outline">
          <Link to="/auth">Enter StoryWeaver</Link>
        </Button>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${heroArt})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage: "linear-gradient(to bottom, black 30%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center md:py-32">
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background/40 px-4 py-1.5 font-display text-xs uppercase tracking-[0.3em] text-accent backdrop-blur">
            <Sparkles className="size-3" />
            The intelligent tabletop companion
          </p>
          <h1 className="mt-6 font-display text-5xl font-bold leading-tight md:text-7xl">
            <span className="text-gradient-arcane">Every detail</span>
            <br />
            remembered.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg italic text-foreground/75">
            StoryWeaver is the backstage crew for your campaign — tireless, consistent, and
            invisibly excellent. It remembers every beat, voices every character, and lets the
            adventure take center stage.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="font-display tracking-widest glow-gold">
              <Link to="/campaigns">Open Campaigns</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="font-display tracking-widest"
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="group rounded-xl border border-accent/15 bg-card/70 p-6 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-arcane"
            >
              <span className="grid size-11 place-items-center rounded-lg border border-accent/25 bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
                <Icon className="size-5" />
              </span>
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
