"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Plus, MapPin, Calendar, ArrowRight, Sparkles } from "lucide-react";
import type { Trip } from "@/lib/db";
import NewTripDialog from "./NewTripDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  planning: { label: "Planificando", color: "bg-amber/10 text-amber" },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  in_progress: { label: "En curso", color: "bg-green-100 text-green-700" },
  completed: { label: "Completado", color: "bg-secondary text-muted-foreground" },
  cancelled: { label: "Cancelado", color: "bg-destructive/10 text-destructive" },
};

interface DashboardClientProps {
  initialTrips: Trip[];
  userName: string;
}

export default function DashboardClient({ initialTrips, userName }: DashboardClientProps) {
  const [newTripOpen, setNewTripOpen] = useState(false);
  const { data, mutate } = useSWR<{ trips: Trip[] }>("/api/trips", fetcher, {
    fallbackData: { trips: initialTrips },
  });
  const trips = data?.trips ?? initialTrips;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {greeting()}, {userName.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {trips.length === 0
              ? "Crea tu primer viaje para empezar a planificar."
              : `Tienes ${trips.length} viaje${trips.length !== 1 ? "s" : ""} en curso.`}
          </p>
        </div>
        <button
          onClick={() => setNewTripOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo viaje
        </button>
      </div>

      {/* Empty state */}
      {trips.length === 0 && (
        <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-display font-bold text-lg mb-2">Sin viajes todavía</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Crea tu primer workspace de viaje y deja que la IA te ayude a planificar cada detalle.
          </p>
          <button
            onClick={() => setNewTripOpen(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear mi primer viaje
          </button>
        </div>
      )}

      {/* Trips grid */}
      {trips.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => {
            const statusInfo = STATUS_LABELS[trip.status] ?? STATUS_LABELS.planning;
            return (
              <Link
                key={trip.id}
                href={`/trip/${trip.id}`}
                className="group bg-card border border-border rounded-xl p-5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all flex flex-col gap-4"
              >
                {/* Trip icon + destination */}
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}
                  >
                    {statusInfo.label}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors text-balance">
                    {trip.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{trip.destination}</p>
                </div>

                {/* Dates */}
                {(trip.start_date || trip.end_date) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {trip.start_date
                        ? format(new Date(trip.start_date), "d MMM", { locale: es })
                        : ""}
                      {trip.start_date && trip.end_date ? " — " : ""}
                      {trip.end_date
                        ? format(new Date(trip.end_date), "d MMM yyyy", { locale: es })
                        : ""}
                    </span>
                  </div>
                )}

                {/* CTA */}
                <div className="flex items-center gap-1 text-xs font-medium text-primary mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  Abrir workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}

          {/* Add new card */}
          <button
            onClick={() => setNewTripOpen(true)}
            className="bg-secondary/50 border-2 border-dashed border-border rounded-xl p-5 hover:border-primary/40 hover:bg-accent/50 transition-all flex flex-col items-center justify-center gap-3 min-h-[180px] group"
          >
            <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center group-hover:border-primary/40 transition-colors">
              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">
              Nuevo viaje
            </span>
          </button>
        </div>
      )}

      {/* AI tip banner */}
      {trips.length > 0 && (
        <div className="mt-8 bg-accent border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Consejo del asistente IA</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Abre cualquier viaje y chatea con tu asistente de viajes para obtener recomendaciones personalizadas, validar horarios y optimizar tu itinerario.
            </p>
          </div>
        </div>
      )}

      <NewTripDialog
        open={newTripOpen}
        onClose={() => setNewTripOpen(false)}
        onCreated={() => mutate()}
      />
    </div>
  );
}
