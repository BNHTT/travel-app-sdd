"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  MapPin,
  LayoutDashboard,
  Plus,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import type { Trip } from "@/lib/db";
import NewTripDialog from "./NewTripDialog";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface AppSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const [tripsOpen, setTripsOpen] = useState(true);
  const [newTripOpen, setNewTripOpen] = useState(false);

  const { data, mutate } = useSWR<{ trips: Trip[] }>("/api/trips", fetcher);
  const trips = data?.trips ?? [];

  return (
    <>
      <aside className="w-56 flex flex-col border-r border-sidebar-border bg-sidebar shrink-0 h-full">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base tracking-tight text-foreground">
              Wandr
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === "/dashboard"
                ? "bg-sidebar-active text-primary font-medium"
                : "text-sidebar-foreground hover:bg-secondary"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Dashboard
          </Link>

          {/* Trips section */}
          <div className="pt-3">
            <button
              onClick={() => setTripsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <span>Mis viajes</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewTripOpen(true);
                  }}
                  className="p-0.5 rounded hover:bg-secondary transition-colors"
                  aria-label="Nuevo viaje"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${tripsOpen ? "" : "-rotate-90"}`}
                />
              </div>
            </button>

            {tripsOpen && (
              <div className="mt-0.5 space-y-0.5">
                {trips.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground italic">
                    Sin viajes todavía
                  </p>
                ) : (
                  trips.map((trip) => {
                    const isActive = pathname === `/trip/${trip.id}`;
                    return (
                      <Link
                        key={trip.id}
                        href={`/trip/${trip.id}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors truncate ${
                          isActive
                            ? "bg-sidebar-active text-primary font-medium"
                            : "text-sidebar-foreground hover:bg-secondary"
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{trip.title}</span>
                      </Link>
                    );
                  })
                )}
                <button
                  onClick={() => setNewTripOpen(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  Nuevo viaje
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* User footer */}
        <div className="border-t border-sidebar-border p-3 space-y-0.5">
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-secondary transition-colors"
          >
            <Settings className="w-4 h-4 shrink-0" />
            Configuración
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-secondary hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesión
          </button>
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 text-xs font-medium text-accent-foreground">
              {user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user.name ?? "Usuario"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <NewTripDialog
        open={newTripOpen}
        onClose={() => setNewTripOpen(false)}
        onCreated={() => mutate()}
      />
    </>
  );
}
