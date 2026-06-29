import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  BookOpen,
  Gauge,
  LayoutDashboard,
  LineChart,
  LogOut,
  ScrollText,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { store, useAppState, useAuth } from "@/services";

type NavItem = {
  label: string;
  to:
    | "/campaigns/$id"
    | "/campaigns/$id/characters"
    | "/campaigns/$id/timeline"
    | "/campaigns/$id/rules"
    | "/campaigns/$id/images"
    | "/campaigns/$id/sessions"
    | "/campaigns/$id/eval";
  icon: typeof BookOpen;
  exact: boolean;
  gmOnly?: boolean;
};

function navFor(isGm: boolean): NavItem[] {
  return [
    {
      label: isGm ? "Command Center" : "Dashboard",
      to: "/campaigns/$id",
      icon: isGm ? Gauge : LayoutDashboard,
      exact: true,
    },
    { label: "Characters", to: "/campaigns/$id/characters", icon: Users, exact: false },
    { label: "Story Timeline", to: "/campaigns/$id/timeline", icon: ScrollText, exact: false },
    { label: "Rules Q&A", to: "/campaigns/$id/rules", icon: BookOpen, exact: false },
    { label: "Forge of Visions", to: "/campaigns/$id/images", icon: Wand2, exact: false },
    { label: "Sessions", to: "/campaigns/$id/sessions", icon: Sparkles, exact: false },
    { label: "Rules Eval", to: "/campaigns/$id/eval", icon: LineChart, exact: false, gmOnly: true },
  ];
}

function RoleSwitcher() {
  const { user } = useAuth();
  const state = useAppState();
  const isGm = user?.role === "gm";

  const switchTo = (role: "gm" | "player") => {
    const target = state.users.find((u) => u.role === role);
    if (target) store.setCurrentUser(target.id);
  };

  return (
    <div className="grid grid-cols-2 gap-1 rounded-md border border-accent/20 bg-background/60 p-1">
      <button
        onClick={() => switchTo("gm")}
        className={cn(
          "rounded px-2 py-1.5 font-display text-[10px] uppercase tracking-widest transition-colors",
          isGm ? "bg-primary/15 text-primary" : "text-foreground/50 hover:text-foreground",
        )}
      >
        GM
      </button>
      <button
        onClick={() => switchTo("player")}
        className={cn(
          "rounded px-2 py-1.5 font-display text-[10px] uppercase tracking-widest transition-colors",
          !isGm ? "bg-accent/15 text-accent" : "text-foreground/50 hover:text-foreground",
        )}
      >
        Player
      </button>
    </div>
  );
}

export function CampaignSidebar() {
  const { id } = useParams({ from: "/campaigns/$id" });
  const state = useAppState();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const isGm = user?.role === "gm";
  const campaign = state.campaigns.find((c) => c.id === id);
  const items = navFor(!!isGm).filter((i) => !i.gmOnly || isGm);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-accent/20 bg-sidebar/70 backdrop-blur md:flex">
      <div className="border-b border-accent/15 p-5">
        <Brand to="/campaigns" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {items.map(({ label, to, icon: Icon, exact }) => (
          <Link
            key={label}
            to={to}
            params={{ id }}
            activeOptions={{ exact }}
            className="group flex items-center gap-3 rounded-md px-3 py-2 font-display text-xs tracking-widest text-foreground/70 transition-colors hover:bg-accent/10 hover:text-primary"
            activeProps={{
              className: "!bg-primary/10 !text-primary border border-primary/20",
            }}
          >
            <Icon className="size-4" />
            {label.toUpperCase()}
          </Link>
        ))}
      </nav>

      <div className="space-y-3 border-t border-accent/15 p-4">
        {campaign && (
          <div className="rounded-md border border-accent/20 bg-background/60 p-3">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent">
              <Sparkles className="size-3" />
              Campaign
            </p>
            <p className="mt-1 truncate font-display text-sm font-semibold">{campaign.name}</p>
          </div>
        )}

        <RoleSwitcher />

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
  const { user } = useAuth();
  const items = navFor(user?.role === "gm").filter((i) => !i.gmOnly || user?.role === "gm");
  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 overflow-x-auto border-b border-accent/20 bg-background/90 px-4 py-3 backdrop-blur md:hidden">
      <Brand to="/campaigns" />
      <div className="flex gap-3 font-display text-[10px] tracking-widest">
        {items.map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            params={{ id }}
            className="whitespace-nowrap text-foreground/60"
            activeProps={{ className: "!text-primary" }}
          >
            {label.split(" ")[0].toUpperCase()}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
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
