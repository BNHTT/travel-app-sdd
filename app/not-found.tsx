import Link from "next/link";
import { MapPin, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-6">
        <MapPin className="w-6 h-6 text-primary" />
      </div>
      <h1 className="font-display text-4xl font-bold tracking-tight mb-2">404</h1>
      <p className="text-muted-foreground mb-8 max-w-sm leading-relaxed">
        Esta página no existe o no tienes acceso a ella.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al dashboard
      </Link>
    </div>
  );
}
