# 03 — Arquitectura General del Sistema

> **Versión:** 0.1.0 | **Estado:** Borrador | **Fecha:** 2026-03-26

---

## 1. Diagrama de Contexto (C4 — Nivel 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                      USUARIOS EXTERNOS                           │
│                                                                   │
│   👤 Viajero (web browser)    📧 Email (verificación/notifs)    │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│              WORKSPACE INTELIGENTE DE VIAJES                     │
│                  (Aplicación Next.js en Vercel)                  │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │   Frontend  │  │  API Layer   │  │   Sistema de Agentes   │  │
│  │  (React/    │  │  (Next.js    │  │   IA (Orquestador +    │  │
│  │   Next.js)  │  │  API Routes) │  │   Especialistas)       │  │
│  └─────────────┘  └──────────────┘  └────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────────┐
        │                  │                      │
        ▼                  ▼                      ▼
┌───────────────┐  ┌───────────────┐   ┌──────────────────────┐
│  PostgreSQL   │  │  OpenAI API   │   │  APIs de Viaje       │
│  (Neon/       │  │  (GPT-4o)     │   │  Amadeus, SerpAPI,   │
│  Supabase)    │  │               │   │  Viator, GMaps       │
└───────────────┘  └───────────────┘   └──────────────────────┘
        │
        ▼
┌───────────────┐  ┌───────────────┐   ┌──────────────────────┐
│  Vercel Blob  │  │  Upstash      │   │  Resend (Email)      │
│  (Documentos) │  │  Redis        │   │                      │
└───────────────┘  └───────────────┘   └──────────────────────┘
```

---

## 2. Diagrama de Contenedores (C4 — Nivel 2)

```
┌──────────────────────────────────────────────────────────────────┐
│                    APLICACIÓN (Vercel)                            │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND (React/Next.js)                 │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌────────────────┐  ┌───────────────┐  │  │
│  │  │  App Router  │  │  Workspace UI  │  │   Chat Panel  │  │  │
│  │  │  (Routing +  │  │  (Views:       │  │   (Streaming  │  │  │
│  │  │   Layouts)   │  │  Board/Time-   │  │    + Blocks   │  │  │
│  │  │              │  │  line/Map/     │  │    Preview)   │  │  │
│  │  │              │  │  Table)        │  │               │  │  │
│  │  └──────────────┘  └────────────────┘  └───────────────┘  │  │
│  │                           │                                 │  │
│  │          Zustand (UI state) + React Query (server state)   │  │
│  └─────────────────────────────┬───────────────────────────── ┘  │
│                                 │ HTTPS / SSE                     │
│  ┌──────────────────────────────▼───────────────────────────── ┐ │
│  │                    API LAYER (Next.js Routes)                │ │
│  │                                                              │ │
│  │  ┌────────────┐  ┌────────────────┐  ┌────────────────────┐ │ │
│  │  │ REST CRUD  │  │  AI Chat SSE   │  │  Auth (NextAuth)   │ │ │
│  │  │ /api/trips │  │  /api/ai/chat  │  │  + File Upload     │ │ │
│  │  │ /api/blocks│  │  /api/ai/      │  │                    │ │ │
│  │  │ /api/budget│  │  validate      │  │                    │ │ │
│  │  └────────────┘  └───────┬────────┘  └────────────────────┘ │ │
│  │                           │                                   │ │
│  │  ┌────────────────────────▼──────────────────────────────┐  │ │
│  │  │               SISTEMA DE AGENTES IA                    │  │ │
│  │  │                                                         │  │ │
│  │  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │  │ │
│  │  │  │  Orquestador │  │  Planner     │  │  Validator   │  │  │ │
│  │  │  │  (routing,   │  │  (itinerario │  │  (logística, │  │  │ │
│  │  │  │  context,    │  │  actividades)│  │  viabilidad) │  │  │ │
│  │  │  │  streaming)  │  └──────────────┘  └──────────────┘  │  │ │
│  │  │  └─────────────┘                                        │  │ │
│  │  │         │                    Info Agent                  │  │ │
│  │  │         │              (destinos, clima, visa)           │  │ │
│  │  │  ┌──────▼──────────────────────────────────────────┐   │  │ │
│  │  │  │  Travel API Tools (MCP-style unified layer)      │   │  │ │
│  │  │  │  flights | hotels | activities | maps | weather  │   │  │ │
│  │  │  └──────────────────────────────────────────────────┘   │  │ │
│  │  └─────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Flujo de Datos Principal: Chat IA → Workspace

```
Usuario escribe mensaje
        │
        ▼
POST /api/ai/chat
{
  tripId, message, conversationHistory,
  workspaceContext: { blocks, destinations, budget }
}
        │
        ▼
Agente Orquestador
  ├── Analiza intención del usuario
  ├── Selecciona agente(s) especialista(s)
  └── Inicia SSE stream al cliente
        │
        ├── Agente Info (si necesita datos de destino)
        │     ├── Llama Travel API Tools
        │     └── Retorna datos verificados con fuente
        │
        ├── Agente Planner (si genera itinerario/sugerencias)
        │     ├── Genera plan basado en contexto del workspace
        │     └── Produce propuestas de bloques (JSON estructurado)
        │
        └── Agente Validator (siempre revisa el output del Planner)
              ├── Verifica tiempos de tránsito (Google Maps API)
              ├── Comprueba conflictos de horario
              └── Aprueba o devuelve con conflictos documentados
                      │
                      ▼
              SSE Stream → Cliente
              ┌─────────────────────────┐
              │ event: status           │  "Verificando tiempos..."
              │ event: text             │  Texto en streaming
              │ event: action           │  Propuesta de bloque JSON
              │ event: action           │  Otra propuesta...
              │ event: text             │  Continuación...
              └─────────────────────────┘
                      │
                      ▼
              Frontend renderiza ActionPreview cards
                      │
              Usuario: [Aceptar] / [Modificar] / [Rechazar]
                      │
              PATCH /api/trips/{id}/blocks  ← Solo si acepta
                      │
              Workspace se actualiza en tiempo real
```

---

## 4. Integración con APIs Externas

### 4.1 Capa de Caché (Upstash Redis)

```
Request de agente → ¿Existe en cache? ─── Sí ──→ Retorna desde cache
                           │
                          No
                           │
                           ▼
                    Llama API externa
                           │
                           ▼
                    Guarda en Redis (TTL: 15-30 min)
                           │
                           ▼
                    Retorna resultado
```

TTL por tipo de dato:
- Precios de vuelos/hoteles: 15 minutos (cambian frecuentemente)
- Info de destino (visa, moneda): 24 horas (relativamente estable)
- Clima: 3 horas
- Puntos de interés (Google Maps): 7 días

### 4.2 APIs de Viaje por Fase

| API | MVP | Fase 2 | Fase 3 |
|-----|-----|--------|--------|
| Amadeus Self-Service | ✓ | ✓ | → Enterprise |
| SerpAPI (Google Flights/Hotels) | ✓ | ✓ | ✓ |
| Viator Partner API | ✓ | ✓ | ✓ |
| Google Maps Platform | ✓ | ✓ | ✓ |
| Kiwi.com Tequila | — | ✓ | ✓ |
| Expedia Rapid API | — | ✓ | ✓ |
| GetYourGuide | — | ✓ | ✓ |
| Duffel (booking directo) | — | — | ✓ |

---

## 5. Decisiones Tecnológicas

### Stack Confirmado

| Componente | Tecnología | Versión objetivo |
|-----------|-----------|-----------------|
| Framework | Next.js App Router | 15.x |
| Lenguaje | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Componentes UI | shadcn/ui | latest |
| Estado UI | Zustand | 5.x |
| Estado Servidor | TanStack Query | 5.x |
| ORM | Prisma | 6.x |
| Base de datos | PostgreSQL (Neon) | 16 |
| IA SDK | Vercel AI SDK | 4.x |
| LLM primario | OpenAI GPT-4o | gpt-4o |
| Auth | NextAuth.js / Auth.js | 5.x |
| Storage | Vercel Blob | latest |
| Cache | Upstash Redis | latest |
| Email | Resend | latest |
| Deploy | Vercel | latest |

---

## 6. Consideraciones de Escalabilidad

- **API Routes de Next.js** son funciones serverless en Vercel — escalan automáticamente
- **AI Chat endpoint** puede volverse una Vercel Edge Function para menor latencia de streaming
- **PostgreSQL en Neon** tiene branching de base de datos para entornos de preview de Vercel
- **Redis cache** reduce llamadas a APIs externas en ~70%, controlando costos al escalar
- Si el Validator Agent requiere >30s (timeouts de Vercel), migrar a Vercel Queue (background jobs)
