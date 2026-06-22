import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { CampaignSidebar, MobileTopBar } from "@/components/campaign-sidebar";
import { useAppState, useAuth } from "@/services";

export const Route = createFileRoute("/campaigns/$id")({
  component: CampaignLayout,
});

function CampaignLayout() {
  const { id } = Route.useParams();
  const { isAuthed } = useAuth();
  const state = useAppState();
  const navigate = useNavigate();

  const campaign = state.campaigns.find((c) => c.id === id);

  useEffect(() => {
    if (!isAuthed) navigate({ to: "/auth" });
  }, [isAuthed, navigate]);

  if (!campaign) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
        <div>
          <h1 className="font-display text-2xl text-primary">Campaign not found</h1>
          <p className="mt-2 text-muted-foreground">
            This chronicle may have been lost to the Scourge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      <CampaignSidebar />
      <MobileTopBar />
      <main className="md:ml-64">
        <Outlet />
      </main>
    </div>
  );
}
