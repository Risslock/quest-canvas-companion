import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

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
import { useAppState, useServices } from "@/services";
import type { ChatStatus } from "ai";

export const Route = createFileRoute("/campaigns/$id/characters/$cid/$threadId")({
  component: ChatThread,
});

function ChatThread() {
  const { id, cid, threadId } = Route.useParams();
  const state = useAppState();
  const { ai, data } = useServices();
  const navigate = useNavigate();

  const [status, setStatus] = useState<ChatStatus>("ready");
  const [streaming, setStreaming] = useState("");

  const character = state.characters.find((c) => c.id === cid);
  const thread = state.threads.find((t) => t.id === threadId);
  const messages = useMemo(
    () =>
      state.messages
        .filter((m) => m.threadId === threadId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [state.messages, threadId],
  );

  if (!character || !thread) {
    return <div className="p-8 text-muted-foreground">Conversation not found.</div>;
  }

  const handleSubmit = async (message: PromptInputMessage) => {
    const text = message.text?.trim();
    if (!text || status === "submitted" || status === "streaming") return;

    const history = state.messages.filter((m) => m.threadId === threadId);
    data.appendMessage({ threadId, role: "user", content: text });

    setStatus("submitted");
    setStreaming("");
    try {
      let acc = "";
      let first = true;
      for await (const token of ai.streamReply(character, history, text)) {
        if (first) {
          setStatus("streaming");
          first = false;
        }
        acc += token;
        setStreaming(acc);
      }
      data.appendMessage({ threadId, role: "assistant", content: acc });
    } catch {
      setStatus("error");
    } finally {
      setStreaming("");
      setStatus("ready");
    }
  };

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col md:h-screen">
      {/* Header */}
      <header className="flex items-center gap-4 border-b border-accent/20 bg-card/60 px-5 py-3 backdrop-blur">
        <Link
          to="/campaigns/$id/characters/$cid"
          params={{ id, cid }}
          className="text-accent hover:text-primary"
          aria-label="Back to character"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <CharacterAvatar
          name={character.name}
          portraitUrl={character.portraitUrl}
          disposition={character.disposition}
          size={40}
          className="rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base leading-tight">{character.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            Digital Twin · {thread.title}
          </p>
        </div>
        <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-widest text-accent sm:flex">
          <span className="size-1.5 rounded-full bg-accent" />
          {character.tone}
        </span>
      </header>

      {/* Transcript */}
      <Conversation className="flex-1">
        <ConversationContent className="mx-auto max-w-3xl">
          {messages.length === 0 && !busy && (
            <ConversationEmptyState
              title={`Speak with ${character.name.split(" ")[0]}`}
              description={`${character.race} ${character.discipline}. Ask anything — they'll answer in character.`}
              icon={
                <CharacterAvatar
                  name={character.name}
                  portraitUrl={character.portraitUrl}
                  size={64}
                  className="rounded-full"
                />
              }
            />
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
                <Shimmer>{`${character.name.split(" ")[0]} is considering…`}</Shimmer>
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
      <div className="border-t border-accent/20 bg-card/40 px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              placeholder={`Ask ${character.name.split(" ")[0]} something…`}
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={busy} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
