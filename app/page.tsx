import Link from "next/link";
import { MapPin, Sparkles, Clock, Shield, ArrowRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-700 text-lg tracking-tight">Wandr</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Funciones</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Precios</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-accent px-3 py-1.5 rounded-full mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Workspace inteligente para viajeros
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-800 tracking-tight leading-[1.05] text-balance mb-6">
            De 18 horas de caos<br />
            <span className="text-primary">a un plan perfecto.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mb-10">
            Wandr es el workspace de planificación de viajes con IA. Organiza tu itinerario, valida la logística y gestiona todo desde un solo lugar — como Notion, pero hecho para viajeros.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Crea tu primer viaje gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* App screenshot mockup */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl shadow-primary/5">
          <div className="border-b border-border bg-secondary/50 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/50" />
              <div className="w-3 h-3 rounded-full bg-amber/50" />
              <div className="w-3 h-3 rounded-full bg-primary/30" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-background rounded px-4 py-1 text-xs text-muted-foreground w-48 text-center">
                wandr.app/trip/tokyo-2026
              </div>
            </div>
          </div>
          {/* Workspace preview */}
          <div className="flex h-[420px]">
            {/* Sidebar preview */}
            <div className="w-52 border-r border-border bg-sidebar p-4 hidden md:block">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Mis viajes</div>
              <div className="space-y-1">
                {["Tokyo 2026", "Lisboa Mayo", "Patagonia"].map((trip, i) => (
                  <div
                    key={trip}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer ${
                      i === 0
                        ? "bg-sidebar-active text-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-secondary"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {trip}
                  </div>
                ))}
              </div>
            </div>
            {/* Main content preview */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="mb-4">
                <h2 className="font-display text-xl font-700 text-foreground">Tokyo 2026</h2>
                <p className="text-xs text-muted-foreground mt-1">12–22 Mar · 10 días · Planificando</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Actividades", count: 14, color: "bg-primary/10 text-primary" },
                  { label: "Alojamiento", count: 3, color: "bg-amber/10 text-amber" },
                  { label: "Vuelos", count: 2, color: "bg-green-500/10 text-green-600" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card border border-border rounded-lg p-3">
                    <div className={`text-lg font-display font-700 ${stat.color.split(" ")[1]}`}>{stat.count}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { icon: "✈️", text: "Vuelo MAD → NRT · Iberia IB6829", tag: "Reservado" },
                  { icon: "🏨", text: "Shinjuku Granbell Hotel · 3 noches", tag: "Planificado" },
                  { icon: "🗼", text: "Senso-ji Temple · 10:00–12:00", tag: "Idea" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm text-foreground flex-1 truncate">{item.text}</span>
                    <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border shrink-0">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Chat panel preview */}
            <div className="w-72 border-l border-border bg-card p-4 hidden lg:flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">Asistente IA</span>
              </div>
              <div className="flex-1 space-y-3 text-xs">
                <div className="bg-secondary rounded-lg p-3 text-muted-foreground leading-relaxed">
                  ¡Hola! Soy tu asistente de viajes. ¿En qué puedo ayudarte con Tokyo?
                </div>
                <div className="bg-primary text-primary-foreground rounded-lg p-3 ml-4 leading-relaxed">
                  ¿Qué días recomiendas para visitar el Monte Fuji?
                </div>
                <div className="bg-secondary rounded-lg p-3 text-muted-foreground leading-relaxed">
                  Te recomiendo el día 15 (miércoles). Tengo disponibilidad en tu itinerario y el clima ese día estará despejado...
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs text-muted-foreground">
                  Escribe aquí...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-700 tracking-tight mb-4">
            Todo lo que necesitas para planificar
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Desde el primer vuelo hasta el último restaurante, organiza cada detalle con ayuda de la IA.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <Sparkles className="w-5 h-5" />,
              title: "Chat IA especializado",
              desc: "Habla con tu asistente de viajes. Propone bloques de itinerario, valida horarios y detecta conflictos logísticos en tiempo real.",
            },
            {
              icon: <Clock className="w-5 h-5" />,
              title: "Itinerario día a día",
              desc: "Vista timeline con franjas horarias proporcionales. Reorganiza actividades con drag & drop y ve los conflictos al instante.",
            },
            {
              icon: <Shield className="w-5 h-5" />,
              title: "Validación logística",
              desc: "La IA detecta conexiones imposibles, museos cerrados en lunes y tiempos de tránsito irreales antes de que sean un problema.",
            },
          ].map((feat) => (
            <div key={feat.title} className="bg-card border border-border rounded-xl p-6">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-accent-foreground mb-4">
                {feat.icon}
              </div>
              <h3 className="font-display font-600 text-base mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-700 tracking-tight mb-4">Planes simples</h2>
          <p className="text-muted-foreground">Empieza gratis, escala cuando lo necesites.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: "Free",
              price: "$0",
              period: "/mes",
              features: ["2 viajes activos", "Funciones básicas", "10 mensajes IA/día"],
              cta: "Comenzar gratis",
              highlight: false,
            },
            {
              name: "Explorer",
              price: "$9",
              period: "/mes",
              features: ["Viajes ilimitados", "IA ilimitada", "Document vault (1GB)", "Exportar a PDF"],
              cta: "Empezar con Explorer",
              highlight: true,
            },
            {
              name: "Pro",
              price: "$15",
              period: "/mes",
              features: ["Todo Explorer", "Búsqueda de vuelos", "Alertas de precio", "Compartir viajes"],
              cta: "Empezar con Pro",
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border p-6 flex flex-col ${
                plan.highlight
                  ? "border-primary bg-accent shadow-lg shadow-primary/10"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-medium text-primary mb-3 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Más popular
                </div>
              )}
              <div className="mb-6">
                <div className="font-display font-700 text-base mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-800 text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </div>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border hover:bg-secondary text-foreground"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-700 text-sm">Wandr</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Wandr. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
