"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, ChevronDown, Trash2 } from "lucide-react";
import type { Trip } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_OPTIONS = [
  { value: "planning", label: "Planificando", color: "text-amber" },
  { value: "confirmed", label: "Confirmado", color: "text-blue-600" },
  { value: "in_progress", label: "En curso", color: "text-green-600" },
  { value: "completed", label: "Completado", color: "text-muted-foreground" },
  { value: "cancelled", label: "Cancelado", color: "text-destructive" },
];

export default function TripHeader({ trip }: { trip: Trip }) {
  const router = useRouter();
  const [status, setStatus] = useState(trip.status);
  const [statusOpen, setStatusOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus as Trip["status"]);
    setStatusOpen(false);
    await fetch(`/api/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este viaje? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
    router.push("/dashboard");
  }

  const dateStr =
    trip.start_date || trip.end_date
      ? [
          trip.start_date
            ? format(new Date(trip.start_date), "d MMM", { locale: es })
            : null,
          trip.end_date
            ? format(new Date(trip.end_date), "d MMM yyyy", { locale: es })
            : null,
        ]
          .filter(Boolean)
          .join(" — ")
      : null;

  return (
    <header className="border-b border-border bg-background px-6 py-4 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <MapPin className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-lg leading-tight truncate text-balance">
            {trip.title}
          </h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground">{trip.destination}</span>
            {dateStr && (
              <>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {dateStr}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Status badge */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-card hover:bg-secondary transition-colors ${currentStatus.color}`}
          >
            {currentStatus.label}
            <ChevronDown className="w-3 h-3" />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 z-20 min-w-[160px]">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-secondary transition-colors ${opt.color} ${
                    opt.value === status ? "font-medium" : ""
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          aria-label="Eliminar viaje"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
