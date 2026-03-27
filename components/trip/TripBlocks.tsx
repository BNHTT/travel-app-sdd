"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Plus,
  FileText,
  MapPin,
  Plane,
  Hotel,
  StickyNote,
  CheckSquare,
  Loader2,
  Trash2,
  GripVertical,
} from "lucide-react";
import type { Trip, Block } from "@/lib/db";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const BLOCK_TYPES = [
  { type: "text", label: "Texto", icon: FileText },
  { type: "heading", label: "Título", icon: FileText },
  { type: "place", label: "Lugar / Actividad", icon: MapPin },
  { type: "transport", label: "Transporte", icon: Plane },
  { type: "accommodation", label: "Alojamiento", icon: Hotel },
  { type: "note", label: "Nota", icon: StickyNote },
  { type: "checklist", label: "Checklist", icon: CheckSquare },
];

const BLOCK_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  text: FileText,
  heading: FileText,
  place: MapPin,
  transport: Plane,
  accommodation: Hotel,
  note: StickyNote,
  checklist: CheckSquare,
};

interface TripBlocksProps {
  trip: Trip;
}

export default function TripBlocks({ trip }: TripBlocksProps) {
  const { data, mutate } = useSWR<{ trip: Trip; blocks: Block[] }>(
    `/api/trips/${trip.id}`,
    fetcher
  );
  const blocks = data?.blocks ?? [];

  const [addingType, setAddingType] = useState(false);
  const [savingBlock, setSavingBlock] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<Record<string, string>>({});

  async function addBlock(type: string) {
    setAddingType(false);
    setSavingBlock(true);
    const defaultContent: Record<string, string> = {
      text: "Nuevo bloque de texto...",
      heading: "Nuevo título",
      place: "Nombre del lugar",
      transport: "Vuelo / Tren / Bus",
      accommodation: "Hotel / Hostal / Airbnb",
      note: "Nota...",
      checklist: "Elemento de lista",
    };

    await fetch(`/api/trips/${trip.id}/blocks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        content: { text: defaultContent[type] ?? "..." },
        position: blocks.length,
      }),
    });
    setSavingBlock(false);
    mutate();
  }

  async function deleteBlock(blockId: string) {
    await fetch(`/api/trips/${trip.id}/blocks/${blockId}`, { method: "DELETE" });
    mutate();
  }

  async function saveEdit(blockId: string) {
    await fetch(`/api/trips/${trip.id}/blocks/${blockId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { text: editContent[blockId] ?? "" } }),
    });
    setEditingId(null);
    mutate();
  }

  function startEdit(block: Block) {
    setEditingId(block.id);
    const text = (block.content as Record<string, string>)?.text ?? "";
    setEditContent((prev) => ({ ...prev, [block.id]: text }));
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Blocks list */}
      <div className="space-y-2 mb-6">
        {blocks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              No hay bloques todavía. Añade contenido a tu itinerario.
            </p>
          </div>
        )}

        {blocks.map((block) => {
          const Icon = BLOCK_ICONS[block.type] ?? FileText;
          const text = (block.content as Record<string, string>)?.text ?? "";
          const isEditing = editingId === block.id;

          return (
            <div
              key={block.id}
              className="group flex items-start gap-2 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/30 mt-1 shrink-0 cursor-grab" />
              <Icon className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                      rows={3}
                      value={editContent[block.id] ?? ""}
                      onChange={(e) =>
                        setEditContent((prev) => ({ ...prev, [block.id]: e.target.value }))
                      }
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(block.id)}
                        className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs border border-border rounded-md hover:bg-secondary transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p
                    onClick={() => startEdit(block)}
                    className={`text-sm text-foreground cursor-text leading-relaxed ${
                      block.type === "heading" ? "font-bold text-base font-display" : ""
                    }`}
                  >
                    {text || <span className="text-muted-foreground italic">Vacío — haz clic para editar</span>}
                  </p>
                )}
              </div>
              <button
                onClick={() => deleteBlock(block.id)}
                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                aria-label="Eliminar bloque"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add block UI */}
      {addingType ? (
        <div className="border border-border rounded-xl p-4 bg-card">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Tipo de bloque
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => addBlock(type)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-accent text-sm text-left transition-colors"
              >
                <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setAddingType(false)}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAddingType(true)}
          disabled={savingBlock}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          {savingBlock ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <div className="w-6 h-6 rounded-md border border-dashed border-border flex items-center justify-center group-hover:border-primary/60 group-hover:text-primary transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
          )}
          Agregar bloque
        </button>
      )}
    </div>
  );
}
