import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Compass,
  Eye,
  EyeOff,
  Heart,
  ScrollText,
  ShieldHalf,
  Sparkles,
  Swords,
  Target,
  Users,
} from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { CharacterAvatar } from "@/components/character-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppState, useAuth, useServices } from "@/services";
import type { Character } from "@/services";
import type { ChatStatus } from "ai";

export const Route = createFileRoute("/campaigns/$id/characters/$cid/$threadId")({
  head: () => ({
    meta: [
      { title: "Digital Twin Chat — StoryWeaver" },
      {
        name: "description",
        content:
          "Immersive in-character conversation with a digital twin that remembers your campaign, with role-aware context for GMs and players.",
      },
    ],
  }),
  component: ChatThread,
});

function ChatThread() {
  const { id, cid, threadId } = Route.useParams();
  const state = useAppState();
  const { ai, data } = useServices();
  const { user } = useAuth();

  const [status, setStatus] = useState<ChatStatus>("ready");
  const [streaming, setStreaming] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const stopRef = useRef(false);

  const character = state.characters.find((c) => c.id === cid);
  const thread = state.threads.find((t) => t.id === threadId);
  const messages = useMemo(
    () =>
      state.messages
        .filter((m) => m.threadId === threadId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [state.messages, threadId],
  );

  const isGm = user?.role === "gm";
  const isOwnPc = !!user?.characterId && user.characterId === cid;

  if (!character || !thread) {
    return <div className="p-8 text-muted-foreground">Conversation not found.</div>;
  }

  const firstName = character.name.split(" ")[0];
  const busy = status === "submitted" || status === "streaming";

  const send = async (text: string) => {
    const value = text.trim();
    if (!value || busy) return;

    const history = state.messages.filter((m) => m.threadId === threadId);
    data.appendMessage({ threadId, role: "user", content: value });

    stopRef.current = false;
    setStatus("submitted");
    setStreaming("");
    try {
      let acc = "";
      let first = true;
      for await (const token of ai.streamReply(character, history, value)) {
        if (stopRef.current) break;
        if (first) {
          setStatus("streaming");
          first = false;
        }
        acc += token;
        setStreaming(acc);
      }
      const interrupted = stopRef.current;
      if (acc) {
        data.appendMessage({
          threadId,
          role: "assistant",
          content: interrupted ? `${acc}\n\n_…the thought trails off._` : acc,
        });
      }
    } catch {
      setStatus("error");
    } finally {
      stopRef.current = false;
      setStreaming("");
      setStatus("ready");
    }
  };

  const handleSubmit = (message: PromptInputMessage) => send(message.text ?? "");
  const handleStop = () => {
    stopRef.current = true;
  };

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden md:h-screen">
      {/* Ambient portrait backdrop */}
      {character.portraitUrl && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center opacity-[0.07] blur-2xl"
          style={{ backgroundImage: `url(${character.portraitUrl})` }}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/80 to-background"
      />

      {/* Header */}
      <header className="flex items-center gap-4 border-b border-accent/20 bg-card/50 px-5 py-3 backdrop-blur">
        <Link
          to="/campaigns/$id/characters/$cid"
          params={{ id, cid }}
          className="text-accent transition-colors hover:text-primary"
          aria-label="Back to character"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <CharacterAvatar
          name={character.name}
          portraitUrl={character.portraitUrl}
          disposition={character.disposition}
          size={42}
          className="rounded-full ring-2"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base leading-tight">{character.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            <span className={cn("inline-flex items-center gap-1", busy && "text-accent")}>
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  busy ? "animate-arcane-pulse bg-accent" : "bg-accent/60",
                )}
              />
              {busy ? `${firstName} is speaking…` : `Digital Twin · ${thread.title}`}
            </span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="hidden font-display text-[10px] tracking-widest lg:inline-flex"
          onClick={() => setPanelOpen((v) => !v)}
        >
          {panelOpen ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {panelOpen ? "HIDE" : "CONTEXT"}
        </Button>
      </header>

      {/* Body: transcript + context panel */}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <Conversation className="flex-1">
            <ConversationContent className="mx-auto w-full max-w-3xl">
              {messages.length === 0 && !busy && (
                <div className="flex flex-col items-center gap-6 py-6">
                  <ConversationEmptyState
                    title={`Speak with ${firstName}`}
                    description={`${character.race} ${character.discipline}. Ask anything — they answer in character.`}
                    icon={
                      <CharacterAvatar
                        name={character.name}
                        portraitUrl={character.portraitUrl}
                        size={72}
                        className="rounded-full ring-2"
                      />
                    }
                  />
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestionsFor(character, isGm).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full border border-accent/25 bg-card/60 px-3.5 py-1.5 text-xs text-foreground/80 transition-colors hover:border-accent/60 hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent>
                    {m.role === "assistant" ? (
                      <MessageResponse>{m.content}</MessageResponse>
                    ) : (
                      m.content
                    )}
                  </MessageContent>
                </Message>
              ))}

              {status === "submitted" && (
                <Message from="assistant">
                  <MessageContent>
                    <Shimmer>{`${firstName} is considering…`}</Shimmer>
                  </MessageContent>
                </Message>
              )}

              {status === "streaming" && streaming && (
                <Message from="assistant">
                  <MessageContent>
                    <MessageResponse>{streaming}</MessageResponse>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Composer */}
          <div className="border-t border-accent/20 bg-card/30 px-4 py-4 backdrop-blur">
            <div className="mx-auto max-w-3xl">
              <PromptInput onSubmit={handleSubmit}>
                <PromptInputTextarea
                  autoFocus
                  placeholder={
                    isGm
                      ? `Direct ${firstName} or ask them anything…`
                      : `Ask ${firstName} something…`
                  }
                />
                <PromptInputFooter>
                  <span className="px-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {isGm
                      ? "Director's view · full knowledge"
                      : isOwnPc
                        ? "Your character"
                        : `In character · ${character.tone.split(",")[0]}`}
                  </span>
                  <PromptInputSubmit status={status} onStop={handleStop} />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>
        </div>

        {/* Role-aware context panel */}
        {panelOpen && (
          <ContextPanel
            character={character}
            isGm={!!isGm}
            isOwnPc={isOwnPc}
            memoryCount={messages.length}
          />
        )}
      </div>
    </div>
  );
}

function suggestionsFor(character: Character, isGm: boolean): string[] {
  const first = character.name.split(" ")[0];
  if (isGm) {
    return [
      `What does ${first} want most right now?`,
      `How would ${first} react to betrayal?`,
      "What secret are you hiding?",
    ];
  }
  return [
    "Who are you?",
    "What should we do next?",
    "What do you fear in this place?",
  ];
}

function ContextPanel({
  character,
  isGm,
  isOwnPc,
  memoryCount,
}: {
  character: Character;
  isGm: boolean;
  isOwnPc: boolean;
  memoryCount: number;
}) {
  // GM sees everything. The owning player sees their own full sheet.
  // Other players talking to an NPC only see public-facing knowledge.
  const full = isGm || isOwnPc;
  const heading = isGm ? "Director's View" : isOwnPc ? "Your Character" : "What You Know";

  return (
    <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-accent/20 bg-card/40 backdrop-blur lg:flex">
      <div className="border-b border-accent/15 p-5">
        <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent">
          {isGm ? <Eye className="size-3" /> : <ScrollText className="size-3" />}
          {heading}
        </p>
        <h3 className="mt-2 font-display text-lg leading-tight">{character.name}</h3>
        <p className="text-sm italic text-foreground/70">
          {character.race} {character.discipline}
          {character.circle ? ` · Circle ${character.circle}` : ""}
        </p>
        <span
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] uppercase tracking-widest",
            character.disposition === "hostile"
              ? "border-destructive/40 text-destructive"
              : character.disposition === "ally"
                ? "border-accent/40 text-accent"
                : "border-border text-muted-foreground",
          )}
        >
          <ShieldHalf className="size-3" />
          {character.disposition}
        </span>
      </div>

      <div className="space-y-5 p-5 text-sm">
        <PanelSection icon={ScrollText} title="Description">
          <p className="leading-relaxed text-foreground/80">{character.description}</p>
        </PanelSection>

        {full && character.personality && (
          <PanelSection icon={Sparkles} title="Personality">
            <p className="leading-relaxed text-foreground/80">{character.personality}</p>
          </PanelSection>
        )}

        {full && character.background && (
          <PanelSection icon={Compass} title="Background">
            <p className="leading-relaxed text-foreground/80">{character.background}</p>
          </PanelSection>
        )}

        {full && character.goals && character.goals.length > 0 && (
          <PanelSection icon={Target} title="Goals">
            <ul className="space-y-1.5">
              {character.goals.map((g) => (
                <li key={g} className="flex gap-2 text-foreground/80">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                  {g}
                </li>
              ))}
            </ul>
          </PanelSection>
        )}

        {full && character.talents && character.talents.length > 0 && (
          <PanelSection icon={Swords} title="Talents">
            <div className="flex flex-wrap gap-1.5">
              {character.talents.map((t) => (
                <span
                  key={t}
                  className="rounded border border-accent/20 bg-background/60 px-2 py-0.5 text-xs text-foreground/80"
                >
                  {t}
                </span>
              ))}
            </div>
          </PanelSection>
        )}

        {character.relationships && character.relationships.length > 0 && (
          <PanelSection icon={Users} title="Relationships">
            <ul className="space-y-1.5">
              {character.relationships.map((r) => (
                <li key={r.name} className="text-foreground/80">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-muted-foreground"> — {r.relation}</span>
                </li>
              ))}
            </ul>
          </PanelSection>
        )}

        {full && Object.keys(character.stats).length > 0 && (
          <PanelSection icon={ShieldHalf} title="Stats">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(character.stats).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded border border-accent/15 bg-background/60 px-2.5 py-1.5"
                >
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="font-display text-sm">{v}</span>
                </div>
              ))}
            </div>
          </PanelSection>
        )}

        <PanelSection icon={Heart} title="Shared Memory">
          <p className="text-xs text-muted-foreground">
            {memoryCount === 0
              ? "No memories yet in this thread."
              : `${memoryCount} message${memoryCount === 1 ? "" : "s"} remembered. ${character.name.split(" ")[0]} recalls everything said here.`}
          </p>
        </PanelSection>

        {!full && (
          <p className="rounded-md border border-dashed border-accent/20 p-3 text-xs italic text-muted-foreground">
            Some of {character.name.split(" ")[0]}'s secrets remain hidden — earn their trust to learn more.
          </p>
        )}
      </div>
    </aside>
  );
}

function PanelSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ScrollText;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 font-display text-[10px] uppercase tracking-widest text-foreground/50">
        <Icon className="size-3 text-accent/70" />
        {title}
      </h4>
      {children}
    </div>
  );
}
