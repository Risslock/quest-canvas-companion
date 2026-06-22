import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { BookOpen, LogOut, ScrollText, Sparkles, Users, Wand2 } from "lucide-react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppState, useAuth } from "@/services";

const navItems = [
  { label: "Campaign Hub", to: "/campaigns/$id" as const, icon: BookOpen, exact: true },
  { label: "Character Roster", to: "/campaigns/$id/characters" as const, icon: Users, exact: false },
  { label: "Forge of Visions", to: "/campaigns/$id/images" as const, icon: Wand2, exact: false },
  { label: "Session Logs", to: "/campaigns/$id/sessions" as const, icon: ScrollText, exact: false },
];

export function CampaignSidebar() {
  const { id } = useParams({ from: "/campaigns/$id" });
  const state = useAppState();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const campaign = state.campaigns.find((c) => c.id === id);
  const activeSession =
    state.sessions.find((s) => s.campaignId === id && s.status === "active") ??
    state.sessions.find((s) => s.campaignId === id && s.status === "planned");

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-accent/20 bg-sidebar/70 backdrop-blur md:flex">
      <div className="border-b border-accent/15 p-5">
        <Brand to="/campaigns" />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ label, to, icon: Icon, exact }) => (
          <Link
            key={label}
            to={to}
            params={{ id }}
            activeOptions={{ exact }}
            className="group flex items-center gap-3 rounded-md px-3 py-2 font-display text-xs tracking-widest text-foreground/70 transition-colors hover:bg-accent/10 hover:text-primary"
            activeProps={{
              className:
                "!bg-primary/10 !text-primary border border-primary/20",
            }}
          >
            <Icon className="size-4" />
            {label.toUpperCase()}
          </Link>
        ))}
      </nav>

      <div className="space-y-3 border-t border-accent/15 p-4">
        {campaign && (
          <Link
            to="/campaigns/$id/sessions"
            params={{ id }}
            className="block rounded-md border border-accent/20 bg-background/60 p-3 transition-colors hover:border-accent/40"
          >
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent">
              <Sparkles className="size-3" />
              {activeSession ? "Active session" : "Campaign"}
            </p>
            <p className="mt-1 truncate font-display text-sm font-semibold">
              {activeSession?.title ?? campaign.name}
            </p>
          </Link>
        )}

        <div className="flex items-center justify-between gap-2 px-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name ?? "Guest"}</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {user?.role === "gm" ? "Game Master" : user ? "Player" : "Not signed in"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth" });
            }}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function MobileTopBar() {
  const { id } = useParams({ from: "/campaigns/$id" });
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-accent/20 bg-background/90 px-4 py-3 backdrop-blur md:hidden">
      <Brand to="/campaigns" />
      <div className="flex gap-3 font-display text-[10px] tracking-widest">
        {navItems.map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            params={{ id }}
            className="text-foreground/60"
            activeProps={{ className: "!text-primary" }}
          >
            {label.split(" ")[0].toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3
      className={cn(
        "mb-6 flex items-center gap-3 font-display text-xl tracking-wide",
        className,
      )}
    >
      <span className="arcane-divider flex-1" />
      <span className="uppercase">{children}</span>
      <span className="arcane-divider flex-1" />
    </h3>
  );
}
