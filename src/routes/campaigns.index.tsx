import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, ScrollText, Users } from "lucide-react";

import { Brand } from "@/components/brand";
import { EmptyState, WelcomePanel, useWelcomePending } from "@/components/onboarding";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppState, useAuth, useServices } from "@/services";

export const Route = createFileRoute("/campaigns/")({
  head: () => ({ meta: [{ title: "Campaigns — StoryWeaver" }] }),
  component: CampaignsPage,
});

function CampaignsPage() {
  const { user, isAuthed, signOut } = useAuth();
  const navigate = useNavigate();
  const state = useAppState();
  const { data } = useServices();

  useEffect(() => {
    if (!isAuthed) navigate({ to: "/auth" });
  }, [isAuthed, navigate]);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [setting, setSetting] = useState("Barsaive · The Age of Legend");
  const [description, setDescription] = useState("");

  const [welcomePending, dismissWelcome] = useWelcomePending(user?.id);
  const isGm = user?.role === "gm";
  const hasCampaigns = state.campaigns.length > 0;

  const create = () => {
    if (!name.trim()) return;
    const c = data.createCampaign({ name: name.trim(), setting, description });
    setOpen(false);
    setName("");
    setDescription("");
    navigate({ to: "/campaigns/$id", params: { id: c.id } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Brand to="/" />
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user?.name} · {user?.role === "gm" ? "Game Master" : "Player"}
          </span>
          <Button
            variant="ghost"
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth" });
            }}
          >
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 md:px-12">
        <div className="mb-10 flex items-end justify-between border-b-2 border-primary/10 pb-6">
          <div>
            <h1 className="font-display text-4xl">Your Chronicles</h1>
            <p className="mt-2 italic text-foreground/60">
              Choose a campaign to enter, or begin a new legend.
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="font-display tracking-widest">
                <Plus className="size-4" /> NEW CAMPAIGN
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">Found a new chronicle</DialogTitle>
                <DialogDescription>
                  Name your campaign and set the stage. You can change everything later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="c-name">Name</Label>
                  <Input
                    id="c-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="The Kaer of Ruin"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-setting">Setting</Label>
                  <Input id="c-setting" value={setting} onChange={(e) => setSetting(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-desc">Premise</Label>
                  <Textarea
                    id="c-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What dark legend is about to unfold?"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={create} disabled={!name.trim()} className="font-display tracking-widest">
                  CREATE
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {state.campaigns.map((c) => {
            const members = state.characters.filter((ch) => ch.campaignId === c.id).length;
            return (
              <Link
                key={c.id}
                to="/campaigns/$id"
                params={{ id: c.id }}
                className="group rounded-lg border border-accent/20 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="font-display text-xs uppercase tracking-[0.3em] text-accent">
                  {c.setting}
                </p>
                <h2 className="mt-2 font-display text-2xl group-hover:text-primary">{c.name}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/70">
                  {c.description || "No premise written yet."}
                </p>
                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="size-4" /> {members} characters
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
