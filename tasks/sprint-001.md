# Sprint 001 — Fundación

> **Período:** Semanas 1-2
> **Objetivo:** Proyecto inicializado, deployado en Vercel, con auth funcional y base de datos conectada.
> **Estado:** Pendiente de inicio

---

## Tareas del Sprint

### T-001: Inicializar Proyecto Next.js
**Criterio de Aceptación:** `npm run dev` corre sin errores. ESLint y TypeScript configurados sin errores.

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Configuraciones adicionales:
- Instalar shadcn/ui: `npx shadcn@latest init`
- Instalar Zustand: `npm install zustand`
- Instalar TanStack Query: `npm install @tanstack/react-query`

---

### T-002: Configurar Base de Datos
**Criterio de Aceptación:** `npx prisma migrate dev` exitoso. `npx prisma studio` muestra las tablas.

```bash
npm install prisma @prisma/client @neondatabase/serverless @prisma/adapter-neon
npx prisma init
```

Pasos:
1. Crear base de datos en Neon (`neon.tech`)
2. Copiar `DATABASE_URL` a `.env.local`
3. Pegar schema de `04-data-model.md` en `prisma/schema.prisma`
4. Ejecutar `npx prisma migrate dev --name init`

---

### T-003: Implementar NextAuth
**Criterio de Aceptación:** Login con Google funciona. Login con email/password funciona. Sesión persiste tras reload.

```bash
npm install next-auth@beta @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs
```

Variables de entorno necesarias:
```env
NEXTAUTH_SECRET=        # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

### T-004: Layout Base
**Criterio de Aceptación:** Navegación entre `/dashboard` y `/trip/:id` funciona. Sidebar muestra lista de viajes del usuario.

Componentes a crear:
- `components/workspace/GlobalSidebar.tsx`
- `app/(workspace)/layout.tsx`
- `app/(auth)/layout.tsx`
- `app/dashboard/page.tsx` (placeholder)

---

### T-005: Deploy en Vercel
**Criterio de Aceptación:** URL de producción funcional. Variables de entorno configuradas. Preview deployments funcionan en PRs.

Pasos:
1. Crear repo en GitHub y hacer push
2. Conectar repo en Vercel
3. Configurar variables de entorno en Vercel
4. Configurar Neon integration en Vercel (para DB branching automático)
5. Hacer push a `main` y verificar deploy exitoso

---

### T-006: Configurar Upstash Redis
**Criterio de Aceptación:** `redis.set('test', 'ok')` y `redis.get('test')` funcionan desde API route.

```bash
npm install @upstash/redis @upstash/ratelimit
```

Variables de entorno:
```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Definition of Done (Sprint 1)

- [ ] `npm run dev` sin errores ni warnings de TypeScript
- [ ] `npm run build` exitoso
- [ ] Login con Google funcional en localhost y producción
- [ ] Login con email/password funcional
- [ ] Base de datos conectada y migraciones aplicadas
- [ ] Deploy en producción accesible por URL pública
- [ ] Variables de entorno configuradas en Vercel (no en código)
- [ ] Primer commit con estructura base pusheado a GitHub

---

## Notas Técnicas

**Orden de implementación recomendado:**
1. Next.js init → 2. Prisma + DB → 3. NextAuth → 4. Layout → 5. Vercel deploy → 6. Redis

**Trampas a evitar:**
- En Vercel, las funciones serverless no mantienen conexiones de DB persistentes. Usar el Neon serverless driver (`@neondatabase/serverless`) con el adapter de Prisma.
- El `NEXTAUTH_URL` en producción debe ser la URL real de Vercel, sin trailing slash.
- NextAuth v5 (Auth.js) tiene API diferente a v4. Seguir la documentación de v5.
