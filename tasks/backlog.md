# Backlog de Producto

> **Última actualización:** 2026-03-26
> **Framework de priorización:** RICE (Reach × Impact × Confidence / Effort)

---

## Sprint 1 — Fundación (En progreso)

| ID | Tarea | RICE | Criterio de Aceptación |
|----|-------|------|----------------------|
| T-001 | Inicializar Next.js 15 + TypeScript + Tailwind + shadcn/ui | — | `npm run dev` sin errores |
| T-002 | Configurar Prisma + PostgreSQL (Neon) + migraciones | — | Tablas creadas, `prisma studio` funciona |
| T-003 | NextAuth: Google OAuth + email/password | — | Login/logout funcional en dev y prod |
| T-004 | Layout base: sidebar + workspace shell + routing | — | Navegación entre `/dashboard` y `/trip/:id` |
| T-005 | Deploy Vercel + variables de entorno + health check | — | URL producción funcional |
| T-006 | Configurar Upstash Redis + rate limiter básico | — | Cache get/set funciona |

---

## Sprint 2 — Trip Workspace

| ID | Tarea | RICE | Criterio de Aceptación |
|----|-------|------|----------------------|
| T-007 | CRUD de trips (API + UI) | High | Crear/editar/eliminar/listar trips |
| T-008 | CRUD de bloques (API + UI) | High | ACTIVITY, STAY, SEGMENT con todos sus campos |
| T-009 | Vista Board (Kanban) | High | Columnas por estado, drag & drop entre columnas |
| T-010 | Vista Timeline básica | High | Bloques ordenados por día y hora |
| T-011 | Reorder de bloques (drag & drop) | Medium | PATCH /blocks/reorder persiste orden |
| T-012 | Páginas de destino (entrada manual) | Medium | Crear destino con nombre y fechas |

---

## Sprint 3 — Chat IA

| ID | Tarea | RICE | Criterio de Aceptación |
|----|-------|------|----------------------|
| T-013 | Endpoint /api/ai/chat con SSE | High | Streaming inicia en <2s |
| T-014 | ChatPanel con streaming display | High | Tokens aparecen incrementalmente |
| T-015 | Agente Orquestador (GPT-4o) | High | Entiende intención sobre viaje |
| T-016 | Tool propose_block | High | IA puede proponer bloques tipados |
| T-017 | ActionPreview cards [Aceptar/Rechazar] | High | Bloque persiste solo al aceptar |
| T-018 | Persistencia de conversación | Medium | Historial se carga al reabrir chat |
| T-019 | Status indicators del agente | Medium | "Verificando..." visible durante procesamiento |

---

## Sprint 4 — Capa de Inteligencia

| ID | Tarea | RICE | Criterio de Aceptación |
|----|-------|------|----------------------|
| T-020 | Info Agent + Amadeus (vuelos/destinos) | High | Datos de destino auto-poblados con fuente |
| T-021 | Info Agent + Google Maps Places | High | Coordenadas y POIs para destinos |
| T-022 | Validator: conflictos de horario | High | Detecta solapamientos, muestra alerta |
| T-023 | Validator: tiempos de tránsito | High | Google Maps Distance Matrix verifica traslados |
| T-024 | Subida de documentos a Vercel Blob | Medium | Upload PDF/imagen funciona |
| T-025 | Parsing de confirmaciones por IA | Medium | Extrae vuelo/hotel de PDF con 80% precisión |
| T-026 | Viator API — sugerir actividades | Medium | IA puede sugerir excursiones por destino |
| T-027 | Estimación de presupuesto por IA | Medium | Estimados por categoría con fuente explícita |

---

## Sprint 5 — Polish y Launch

| ID | Tarea | RICE | Criterio de Aceptación |
|----|-------|------|----------------------|
| T-028 | Vista Timeline completa con zonas horarias | High | Franjas horarias proporcionales, UTC correctas |
| T-029 | Vista Mapa con Google Maps | Medium | Pins por destino, líneas de ruta |
| T-030 | Mobile responsive | High | Funciona en 375px sin scroll horizontal |
| T-031 | Error handling global + empty states | High | No hay pantallas en blanco |
| T-032 | Landing page pública | Medium | Descripción + CTA + waitlist/registro |
| T-033 | PostHog analytics | Medium | Eventos: create_trip, send_message, accept_block |
| T-034 | Email de verificación (Resend) | Medium | Email llega en <30s |

---

## Backlog Fase 2 (Post-MVP)

| ID | Feature | RICE | Fase |
|----|---------|------|------|
| F2-001 | Exportar itinerario a PDF | 243 | Fase 2 |
| F2-002 | Planes de pago con Stripe | 225 | Fase 2 |
| F2-003 | Compartir viaje (read-only link) | 149 | Fase 2 |
| F2-004 | Búsqueda vuelos en tiempo real | 101 | Fase 2 |
| F2-005 | Búsqueda hoteles con precios reales | 101 | Fase 2 |
| F2-006 | Kiwi.com para low-cost airlines | 112 | Fase 2 |
| F2-007 | App PWA (instalable en mobile) | 112 | Fase 2 |
| F2-008 | Alertas de precio de vuelos | 29 | Fase 2 |
