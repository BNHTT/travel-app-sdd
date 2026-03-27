# SDD — Índice de Documentación de Diseño de Software
## App de Viajes con IA — Workspace Inteligente

> **Versión:** 0.1.0 (Pre-desarrollo)
> **Última actualización:** 2026-03-26
> **Estado:** Borrador inicial

---

## Mapa de Documentos

| Archivo | Título | Estado | Prioridad |
|---------|--------|--------|-----------|
| [01-vision-and-scope.md](./01-vision-and-scope.md) | Visión y Alcance | Borrador | Alta |
| [02-requirements.md](./02-requirements.md) | Requisitos (EARS) | Borrador | Alta |
| [03-architecture-overview.md](./03-architecture-overview.md) | Arquitectura General | Borrador | Alta |
| [04-data-model.md](./04-data-model.md) | Modelo de Datos | Borrador | Alta |
| [05-api-design.md](./05-api-design.md) | Diseño de API | Borrador | Alta |
| [06-ai-agent-architecture.md](./06-ai-agent-architecture.md) | Arquitectura de Agentes IA | Borrador | Alta |
| [07-frontend-architecture.md](./07-frontend-architecture.md) | Arquitectura Frontend | Borrador | Media |
| [08-security-and-privacy.md](./08-security-and-privacy.md) | Seguridad y Privacidad | Borrador | Alta |
| [09-infrastructure.md](./09-infrastructure.md) | Infraestructura | Borrador | Media |
| [10-testing-strategy.md](./10-testing-strategy.md) | Estrategia de Testing | Borrador | Media |
| [11-roadmap-and-milestones.md](./11-roadmap-and-milestones.md) | Roadmap y Hitos | Borrador | Alta |

## Architecture Decision Records (ADRs)

| Archivo | Decisión | Estado |
|---------|---------|--------|
| [adr/001-nextjs-app-router.md](./adr/001-nextjs-app-router.md) | Next.js App Router como framework | Aceptado |
| [adr/002-database-choice.md](./adr/002-database-choice.md) | PostgreSQL + JSONB sobre NoSQL | Aceptado |
| [adr/003-ai-provider-selection.md](./adr/003-ai-provider-selection.md) | OpenAI GPT-4o via Vercel AI SDK | Aceptado |
| [adr/004-agent-architecture.md](./adr/004-agent-architecture.md) | Agentes lógicos (no microservicios) | Aceptado |
| [adr/005-auth-strategy.md](./adr/005-auth-strategy.md) | NextAuth.js con Google OAuth | Aceptado |
| [adr/006-travel-data-apis.md](./adr/006-travel-data-apis.md) | APIs oficiales sobre scraping | Aceptado |

## Tareas

| Archivo | Descripción |
|---------|-------------|
| [tasks/backlog.md](./tasks/backlog.md) | Backlog priorizado con RICE scores |
| [tasks/sprint-001.md](./tasks/sprint-001.md) | Sprint 1 — Fundación |

---

## Convenciones de Este SDD

### Notación EARS para Requisitos

Todos los requisitos funcionales siguen la notación EARS:
- **Ubiquitous:** `El sistema SHALL [comportamiento]`
- **Event-driven:** `WHEN [trigger] the system SHALL [comportamiento]`
- **Unwanted:** `IF [condición] THEN the system SHALL [comportamiento]`
- **State-driven:** `WHILE [estado] the system SHALL [comportamiento]`

### Estados de Documentos

- **Borrador:** Primera versión, pendiente de revisión
- **En revisión:** Siendo revisado activamente
- **Aceptado:** Aprobado y listo para implementar
- **Obsoleto:** Reemplazado por versión más reciente

### Versionado

Los documentos siguen el versionado del proyecto. Cambios mayores en la arquitectura requieren actualizar los documentos afectados antes de implementar.
