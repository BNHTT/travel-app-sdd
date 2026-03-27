# ADR-001: Next.js App Router como Framework Principal

**Estado:** Aceptado | **Fecha:** 2026-03-26

## Contexto
Se necesita un framework para construir una aplicación web con SSR, API routes integradas, streaming de IA y buen rendimiento mobile.

## Decisión
Usar **Next.js 15 con App Router** como único framework (frontend + backend).

## Consecuencias
**Positivas:**
- API Routes integradas eliminan la necesidad de un servidor separado en el MVP
- React Server Components reducen JavaScript enviado al cliente
- Streaming nativo compatible con Vercel AI SDK
- Deploy trivial en Vercel con zero-config
- Neon DB branching integrado con previews de Vercel

**Negativas:**
- Si se necesita escalar el backend independientemente, habría que migrar las API routes
- El App Router tiene una curva de aprendizaje mayor que Pages Router

## Alternativas Rechazadas
- **Express + React separados:** Más infraestructura, más configuración, innecesario para MVP
- **Remix:** Menos ecosistema, menos integración con Vercel AI SDK
- **T3 Stack (tRPC):** Overhead de tRPC no justificado para este tamaño de proyecto
