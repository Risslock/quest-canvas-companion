import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth, type UserRole } from "@/services";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "Sign In — StoryWeaver" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("gm@barsaive.dev");
  const [password, setPassword] = useState("password");
  const [role, setRole] = useState<UserRole>("gm");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp({ name: name || "Adept", email, password, role });
      }
      toast.success("Welcome to the Chronicle.");
      navigate({ to: "/campaigns" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 text-foreground selection:bg-accent/30">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>

        <div className="rounded-lg border border-accent/20 bg-card p-6 shadow-sm">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-md border border-border p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "rounded px-3 py-1.5 font-display text-xs tracking-widest transition-colors",
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/60 hover:text-foreground",
                )}
              >
                {m === "signin" ? "SIGN IN" : "SIGN UP"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name at the table"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label>I am a…</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["gm", "player"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm transition-colors",
                        role === r
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-accent/40",
                      )}
                    >
                      {r === "gm" ? "Game Master" : "Player"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" disabled={busy} className="w-full font-display tracking-widest">
              {busy ? "Channeling…" : mode === "signin" ? "ENTER" : "CREATE ACCOUNT"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo uses a mock provider. Any email works — the seeded GM account is prefilled.
          </p>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link to="/" className="text-accent hover:underline">
            ← Back to the gate
          </Link>
        </p>
      </div>
    </div>
  );
}
