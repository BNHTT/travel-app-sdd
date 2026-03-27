# 09 — Infraestructura y Deploy

> **Versión:** 0.1.0 | **Estado:** Borrador | **Fecha:** 2026-03-26

---

## 1. Topología de Infraestructura (MVP)

```
GitHub Repository
        │
        │ Push / PR
        ▼
    Vercel CI/CD
        │
        ├── Preview Deployments (branches/PRs)
        │     └── Neon DB branching (DB aislada por preview)
        │
        └── Production Deploy (main branch)
              ├── Vercel Edge Network (CDN + Assets)
              ├── Next.js Serverless Functions (API Routes)
              ├── Vercel AI Gateway (opcional, para logging)
              │
              ├── Neon PostgreSQL (producción)
              ├── Upstash Redis (cache + rate limiting)
              ├── Vercel Blob (storage de documentos)
              └── Resend (email transaccional)
```

---

## 2. Configuración de Vercel

```json
// vercel.json
{
  "functions": {
    "app/api/ai/chat/route.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

**Timeout del endpoint de chat:** 60 segundos (respuestas largas de IA con múltiples tool calls).

---

## 3. Base de Datos: Neon PostgreSQL

- **Plan:** Neon Free tier (512MB, 1 compute unit) para MVP
- **Branching:** Crear una branch de DB por cada preview deployment de Vercel
- **Connection pooling:** Neon Serverless Driver con `@neondatabase/serverless` para funciones serverless (evita agotamiento de conexiones)
- **Backups:** Automáticos en Neon (point-in-time recovery hasta 7 días en plan free)

```typescript
// lib/db.ts
import { neon } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

const sql = neon(process.env.DATABASE_URL!);
const adapter = new PrismaNeon(sql);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

---

## 4. Cache: Upstash Redis

- **Plan:** Upstash Free (10,000 requests/día) para MVP
- **Usos:**
  - Cache de respuestas de APIs de viaje (TTL variable por tipo)
  - Rate limiting para chat IA (20 msgs/min/usuario)
  - Deduplicación de requests simultáneos al mismo endpoint de IA

---

## 5. CI/CD Pipeline

```yaml
# Workflow implícito de Vercel
On PR create:
  1. Build Next.js
  2. Run: npx prisma validate (schema validation)
  3. Create Neon DB branch
  4. Run: npx prisma migrate deploy (aplica migrations en branch)
  5. Deploy preview en Vercel
  6. Run E2E tests con Playwright (si configurados)
  7. Publicar URL de preview en comentario del PR

On merge to main:
  1. Build Next.js
  2. Run: npx prisma migrate deploy (producción)
  3. Deploy en producción
  4. Health check automático
```

---

## 6. Monitoring y Observabilidad (Fase 2)

| Herramienta | Propósito |
|------------|-----------|
| **Vercel Analytics** | Web Vitals, performance de páginas |
| **PostHog** | Product analytics, funnels, feature flags |
| **Sentry** | Error tracking en frontend y backend |
| **Upstash Redis** dashboard | Monitoreo de cache hit rate y costos |

---

## 7. Estimación de Costos de Infraestructura

### MVP (primeros 500 usuarios)

| Servicio | Plan | Costo/mes |
|---------|------|----------|
| Vercel | Pro | $20 |
| Neon PostgreSQL | Free | $0 |
| Upstash Redis | Free | $0 |
| Vercel Blob | Pay-as-you-go | ~$5 |
| Resend | Free (3,000 emails/mes) | $0 |
| **OpenAI GPT-4o** | Pay-as-you-go | ~$30-100 |
| SerpAPI | Developer | $75 |
| **Total** | | **~$130-200/mes** |

### Crecimiento (10,000 usuarios activos)

| Servicio | Plan | Costo/mes |
|---------|------|----------|
| Vercel | Pro | $20 |
| Neon PostgreSQL | Launch ($19) | $19 |
| Upstash Redis | Pay-as-you-go | ~$20 |
| Vercel Blob | Pay-as-you-go | ~$30 |
| OpenAI GPT-4o | Pay-as-you-go | ~$500-1000 |
| SerpAPI | Production | $150 |
| Amadeus | Pay-as-you-go | ~$50 |
| **Total** | | **~$800-1,300/mes** |
