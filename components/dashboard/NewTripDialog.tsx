"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";

interface NewTripDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function NewTripDialog({ open, onClose, onCreated }: NewTripDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        destination,
        start_date: startDate || null,
        end_date: endDate || null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Error al crear el viaje.");
      return;
    }

    onCreated();
    onClose();
    setTitle("");
    setDestination("");
    setStartDate("");
    setEndDate("");
    router.push(`/trip/${data.trip.id}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-trip-title"
    >
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 id="new-trip-title" className="font-display text-lg font-bold tracking-tight">
            Nuevo viaje
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="trip-title">
              Nombre del viaje
            </label>
            <input
              id="trip-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
              placeholder="ej. Tokyo Primavera 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="trip-destination">
              Destino
            </label>
            <input
              id="trip-destination"
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
              placeholder="ej. Tokio, Japón"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="trip-start">
                Fecha inicio
              </label>
              <input
                id="trip-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="trip-end">
                Fecha fin
              </label>
              <input
                id="trip-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded-lg py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear viaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
