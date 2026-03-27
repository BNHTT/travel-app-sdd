"use client";

import { useState } from "react";
import type { Trip, ChatMessage } from "@/lib/db";
import TripHeader from "./TripHeader";
import TripBlocks from "./TripBlocks";
import TripChatPanel from "./TripChatPanel";
import { MessageSquare, FileText, PanelRightClose, PanelRightOpen } from "lucide-react";

interface TripWorkspaceProps {
  trip: Trip;
  initialChatHistory: ChatMessage[];
}

export default function TripWorkspace({ trip, initialChatHistory }: TripWorkspaceProps) {
  const [chatOpen, setChatOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"blocks" | "chat">("blocks");

  return (
    <div className="flex flex-col h-full">
      <TripHeader trip={trip} />

      {/* Mobile tabs */}
      <div className="flex md:hidden border-b border-border bg-background px-4">
        <button
          onClick={() => setActiveTab("blocks")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "blocks"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          Itinerario
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "chat"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Asistente IA
        </button>
      </div>

      {/* Desktop layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div
          className={`flex-1 overflow-auto ${
            activeTab === "chat" ? "hidden md:block" : ""
          }`}
        >
          <TripBlocks trip={trip} />
        </div>

        {/* Chat panel toggle button (desktop) */}
        <div className="hidden md:flex items-start pt-4 px-1">
          <button
            onClick={() => setChatOpen((v) => !v)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label={chatOpen ? "Cerrar chat" : "Abrir chat"}
          >
            {chatOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Chat panel */}
        <div
          className={`
            border-l border-border bg-card
            ${chatOpen ? "w-80 xl:w-96" : "w-0 overflow-hidden"}
            hidden md:block transition-all duration-200
            ${activeTab === "chat" ? "!block !w-full md:!w-80 xl:!w-96" : ""}
          `}
        >
          <TripChatPanel tripId={trip.id} initialHistory={initialChatHistory} />
        </div>
      </div>
    </div>
  );
}
