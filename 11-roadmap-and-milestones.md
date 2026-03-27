# 11 — Roadmap y Hitos de Desarrollo

> **Versión:** 0.1.0 | **Estado:** Borrador | **Fecha:** 2026-03-26

---

## Visión de Fases

```
Fase 1 (MVP)          Fase 2 (Crecimiento)      Fase 3 (Escala)
Sem 1-10              Meses 3-9                  Año 2+
─────────────         ────────────────           ────────────
Workspace + Chat IA → Precios reales + Monitor → Reservas directas
```

---

## Fase 1 — MVP (Semanas 1-10)

### Sprint 1: Fundación (Semanas 1-2)

**Objetivo:** Proyecto inicializado, deployado en Vercel, con auth funcional.

| Tarea | Criterio de Aceptación | RICE |
|-------|----------------------|------|
| Inicializar Next.js 15 + TypeScript + Tailwind + shadcn/ui | `npm run dev` funciona sin errores | — |
| Configurar Prisma + PostgreSQL (Neon) | `npx prisma migrate dev` exitoso, tablas creadas | — |
| Implementar NextAuth (Google OAuth + credentials) | Login/logout funcional, sesión persiste | — |
| Layout base: sidebar, workspace shell, routing | Navegación entre `/dashboard` y `/trip/:id` | — |
| Deploy en Vercel + variables de entorno | URL de producción funcional | — |
| Configurar Upstash Redis | Cache básico operativo | — |

**Entregable:** App vacía deployada en producción con auth.

---

### Sprint 2: Trip Workspace (Semanas 3-4)

**Objetivo:** Un usuario puede crear un viaje y organizar bloques manualmente.

| Tarea | Criterio de Aceptación | RICE |
|-------|----------------------|------|
| CRUD de trips | Crear/editar/eliminar viajes, listar en dashboard | High |
| CRUD de bloques | Crear/editar/eliminar bloques ACTIVITY, STAY, SEGMENT | High |
| Vista Board (kanban) | Columnas Idea/Planificado/Reservado/Hecho, drag & drop entre columnas | High |
| Vista Timeline básica | Bloques ordenados por día y hora, scroll horizontal | High |
| Páginas de destino (manual) | Crear destino con nombre, fechas de llegada/salida | Medium |
| Drag & drop reorder en Timeline | `PATCH /blocks/reorder` actualiza sortOrder | Medium |

**Entregable:** Workspace funcional sin IA — una Notion básica para viajes.

---

### Sprint 3: Chat IA + Preview de Intención (Semanas 5-6)

**Objetivo:** El chat con IA puede proponer bloques y el usuario puede aceptarlos.

| Tarea | Criterio de Aceptación | RICE |
|-------|----------------------|------|
| Endpoint `/api/ai/chat` con SSE streaming | Respuesta empieza en <2s, tokens streameados | High |
| ChatPanel component con streaming display | Texto aparece incrementalmente, sin parpadeo | High |
| Agente Orquestador básico (GPT-4o) | Entiende intención del usuario sobre el viaje | High |
| Tool `propose_block` implementado | IA puede proponer bloques tipados | High |
| ActionPreview cards en frontend | Cards de preview con [Aceptar/Rechazar] funcionales | High |
| Persistencia de conversación (ChatMessage) | Historial se carga al reabrir el chat | Medium |
| Indicadores de estado del agente | "Planificando itinerario...", "Verificando..." visibles | Medium |

**Entregable:** Chat IA funcional que puede poblar el workspace.

---

### Sprint 4: Capa de Inteligencia (Semanas 7-8)

**Objetivo:** Los agentes Info y Validator añaden valor real con datos verificados.

| Tarea | Criterio de Aceptación | RICE |
|-------|----------------------|------|
| Info Agent + Amadeus Self-Service | Auto-poblar destinos con zona horaria, moneda, visa | High |
| Info Agent + Google Maps Places | Coordenadas y puntos de interés para destinos | High |
| Validator Agent — conflictos de horario | Detecta y reporta solapamientos de bloques | High |
| Validator Agent — tiempos de tránsito | Google Maps Distance Matrix verifica traslados | High |
| Subida de documentos | Upload PDF/imagen a Vercel Blob | Medium |
| Parsing de documentos con IA | Extraer confirmación de vuelo/hotel de PDF | Medium |
| Viator API — sugerir actividades | IA puede sugerir excursiones para un destino | Medium |
| Estimación de presupuesto por IA | GPT-4o estima costos por destino y categoría | Medium |

**Entregable:** IA que valida lógica del viaje y sugiere con datos reales.

---

### Sprint 5: Polish y Beta Launch (Semanas 9-10)

**Objetivo:** App lista para primeros usuarios reales.

| Tarea | Criterio de Aceptación | RICE |
|-------|----------------------|------|
| Vista Timeline completa | Franjas horarias proporcionales, zonas horarias correctas | High |
| Vista Mapa | Pins en Google Maps, líneas de ruta entre destinos | Medium |
| Layout mobile-responsive | Funciona correctamente en 375px de ancho | High |
| Manejo de errores y loading states | No hay pantallas en blanco ni errores no controlados | High |
| Landing page pública | Descripción del producto, CTA de registro | Medium |
| Analytics básico (PostHog) | Tracking de eventos clave: crear trip, usar chat, aceptar bloque | Medium |
| Email de verificación (Resend) | Usuarios reciben email al registrarse | Medium |
| Beta access flow | Lista de espera o código de invitación para primeros 500 usuarios | Low |

**Entregable:** MVP en producción con usuarios beta.

---

## Fase 2 — Crecimiento (Meses 3-9)

### Prioridades por RICE Score

| Feature | Reach | Impact | Confidence | Effort | RICE |
|---------|-------|--------|------------|--------|------|
| Búsqueda de vuelos en tiempo real (Amadeus+SerpAPI) | 8 | 9 | 7 | 5 | **101** |
| Búsqueda de hoteles con precios reales | 8 | 9 | 7 | 5 | **101** |
| Compartir viaje con acompañantes (read-only) | 7 | 8 | 8 | 3 | **149** |
| Exportar itinerario a PDF | 9 | 6 | 9 | 2 | **243** |
| Alertas de precio de vuelos monitoreados | 5 | 8 | 5 | 7 | **29** |
| Kiwi.com para low-cost airlines | 6 | 7 | 8 | 3 | **112** |
| App PWA para mobile | 8 | 7 | 8 | 4 | **112** |
| Planes de pago (Stripe) | 10 | 10 | 9 | 4 | **225** |

**Prioridades Fase 2 (orden recomendado):**
1. Exportar PDF (RICE: 243, bajo esfuerzo, alto impacto)
2. Planes de pago con Stripe (RICE: 225, necesario para monetizar)
3. Compartir viaje con acompañantes (RICE: 149)
4. Búsqueda de vuelos y hoteles en tiempo real (RICE: 101)
5. Kiwi.com + PWA mobile (RICE: 112)

---

## Fase 3 — Escala (Año 2+)

### Roadmap de Alto Nivel

| Trimestre | Foco |
|-----------|------|
| Q1 Año 2 | Reservas directas de vuelos (Duffel API), modelo comisión |
| Q2 Año 2 | App nativa mobile (React Native), modo offline |
| Q3 Año 2 | B2B: planes para agencias de viajes, API pública |
| Q4 Año 2 | Integraciones con programas de fidelidad (Marriott, etc.) |
| Q1 Año 3 | Modo colaborativo real-time (múltiples editores simultáneos) |

---

## Criterios de Lanzamiento del MVP

El MVP puede lanzarse a beta cuando:
- [ ] Login/registro funciona sin errores en 3 dispositivos distintos
- [ ] CRUD de trips y bloques sin bugs críticos
- [ ] Chat IA responde en <3 segundos y propone bloques coherentes
- [ ] Agente Validator detecta al menos 3 tipos de conflictos logísticos
- [ ] Vista Timeline y Board son usables en desktop
- [ ] No hay errores 500 sin controlar en producción
- [ ] WCAG AA en pantallas principales verificado con Axe
- [ ] Al menos 5 usuarios beta han completado un itinerario completo
