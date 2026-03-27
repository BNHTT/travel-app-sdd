# 08 — Seguridad y Privacidad

> **Versión:** 0.1.0 | **Estado:** Borrador | **Fecha:** 2026-03-26

---

## 1. Autenticación y Autorización

### 1.1 Flujo de Autenticación
- **NextAuth.js** gestiona sesiones. Providers: Google OAuth 2.0 + email/password (con hashing bcrypt)
- Sesiones via cookies HttpOnly + Secure + SameSite=Lax
- JWT con expiración 30 días. Refresh automático si el usuario está activo.
- CSRF protection integrada en NextAuth

### 1.2 Autorización (Row-Level Security)
```typescript
// Patrón obligatorio en TODOS los endpoints
export async function GET(req: Request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const trip = await db.trip.findUnique({
    where: { id: params.tripId }
  });

  // Verificar propiedad SIEMPRE
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // ...
}
```

**Regla:** Nunca confiar en parámetros de URL sin verificar que el recurso pertenece al usuario autenticado.

---

## 2. Seguridad de APIs Externas

- **API keys** almacenadas solo en variables de entorno de Vercel (nunca en código ni cliente)
- Las llamadas a Amadeus, SerpAPI, Viator y Google Maps se hacen EXCLUSIVAMENTE desde el servidor (API routes), nunca desde el cliente
- Rate limiting en el endpoint `/api/ai/chat`: 20 mensajes/minuto por usuario (Upstash Redis)

---

## 3. Validación de Inputs

- **Zod** para validar todos los inputs en API routes antes de tocar la base de datos
- **Prisma** usa queries parametrizadas — no hay riesgo de SQL injection
- Sanitización de contenido Markdown antes de renderizar (DOMPurify en cliente)
- Tamaño máximo de uploads: 10MB, tipos permitidos: PDF, JPG, PNG, WEBP, HEIC

---

## 4. Privacidad de Datos

### Datos recopilados
| Dato | Propósito | Base legal |
|------|-----------|-----------|
| Email | Identificación, notificaciones | Contrato |
| Nombre | Personalización | Contrato |
| Datos de viajes | Funcionalidad del servicio | Contrato |
| Documentos subidos | Organización del viaje | Contrato |
| Historial de chat | Contexto del asistente IA | Interés legítimo |
| Analíticas de uso | Mejora del producto | Interés legítimo |

### Derechos GDPR
- **Acceso:** Endpoint `GET /api/user/export` genera JSON con todos los datos del usuario
- **Eliminación:** Endpoint `DELETE /api/user` elimina cascada todos los datos
- **Portabilidad:** Exportación en JSON estándar
- **Corrección:** Perfil editable en `/settings`

### Datos enviados a OpenAI
- Los mensajes del chat y el contexto del workspace se envían a OpenAI para generar respuestas
- Se evita enviar información identificable innecesaria (números de pasaporte, tarjetas de crédito)
- Indicar claramente en ToS y Privacy Policy que OpenAI procesa los datos del chat

---

## 5. Seguridad de la Infraestructura

- **Vercel**: Headers de seguridad configurados en `next.config.ts`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Content-Security-Policy`: configurado para permitir solo fuentes conocidas
- **Neon PostgreSQL**: Acceso solo desde IP de Vercel Functions, no expuesto públicamente
- **Vercel Blob**: URLs pre-firmadas con expiración para documentos sensibles
