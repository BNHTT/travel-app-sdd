"use client";

import { useRef, useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { Send, Sparkles, Loader2, Bot, User } from "lucide-react";
import type { ChatMessage } from "@/lib/db";

function getUIMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return "";
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function historyToUIMessages(history: ChatMessage[]): UIMessage[] {
  return history.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
    metadata: {},
  }));
}

interface TripChatPanelProps {
  tripId: string;
  initialHistory: ChatMessage[];
}

const SUGGESTIONS = [
  "¿Qué puedo visitar en 3 días?",
  "Dame un itinerario día por día",
  "¿Cuál es la mejor época para ir?",
  "Recomiéndame restaurantes locales",
];

export default function TripChatPanel({ tripId, initialHistory }: TripChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/trips/${tripId}/chat`,
    }),
    initialMessages: historyToUIMessages(initialHistory),
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage({ text });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-primary-foreground" />
        </div>
        <span className="text-sm font-medium">Asistente IA</span>
        {isStreaming && (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground ml-auto" />
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mx-auto mb-3">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Asistente de viajes
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Pregúntame sobre tu destino, pídeme un itinerario o valida tu plan actual.
            </p>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                  }}
                  className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-secondary hover:bg-accent hover:text-primary border border-border transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const text = getUIMessageText(msg);
          if (!text) return null;
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser ? "bg-primary" : "bg-secondary"
                }`}
              >
                {isUser ? (
                  <User className="w-3 h-3 text-primary-foreground" />
                ) : (
                  <Bot className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {text}
              </div>
            </div>
          );
        })}

        {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2.5">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="bg-secondary rounded-xl px-3.5 py-2.5">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none bg-secondary border border-transparent rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-ring focus:bg-background transition-colors placeholder:text-muted-foreground disabled:opacity-50 max-h-32"
            style={{ overflowY: "auto" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            aria-label="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Enter para enviar · Shift+Enter nueva línea
        </p>
      </div>
    </div>
  );
}
