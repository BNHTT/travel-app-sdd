# 05 — Diseño de API REST

> **Versión:** 0.1.0 | **Estado:** Borrador | **Fecha:** 2026-03-26

---

## 1. Convenciones Generales

- **Base URL:** `/api/`
- **Autenticación:** JWT via cookie de sesión (NextAuth). Todos los endpoints requieren sesión excepto los de auth.
- **Content-Type:** `application/json` para requests/responses
- **Errores:** Siempre retornan `{ error: string, code: string, details?: unknown }`
- **Paginación:** `?page=1&pageSize=20` donde aplica
- **Versionado:** Sin versión en MVP. Cuando sea necesario: `/api/v2/...`

### Códigos de Error Estándar

| HTTP | `code` | Situación |
|------|--------|-----------|
| 400 | `VALIDATION_ERROR` | Parámetros inválidos (Zod) |
| 401 | `UNAUTHORIZED` | Sin sesión activa |
| 403 | `FORBIDDEN` | El recurso no pertenece al usuario |
| 404 | `NOT_FOUND` | Recurso no existe |
| 429 | `RATE_LIMITED` | Demasiadas requests |
| 500 | `INTERNAL_ERROR` | Error no controlado |

---

## 2. Endpoints de Autenticación (NextAuth)

```
POST   /api/auth/signin          # Iniciar sesión (email/password o OAuth)
POST   /api/auth/signout         # Cerrar sesión
GET    /api/auth/session         # Obtener sesión actual
POST   /api/auth/register        # Registro con email (custom endpoint)
POST   /api/auth/reset-password  # Solicitar reset de contraseña
```

---

## 3. Viajes (Trips)

### `GET /api/trips`
Lista todos los viajes del usuario autenticado.

**Query params:** `?status=PLANNING&page=1&pageSize=10`

**Response 200:**
```json
{
  "trips": [
    {
      "id": "clx...",
      "title": "Japón Octubre 2026",
      "startDate": "2026-10-01T00:00:00Z",
      "endDate": "2026-10-11T00:00:00Z",
      "status": "PLANNING",
      "coverImageUrl": null,
      "currency": "EUR",
      "_count": { "blocks": 12, "destinations": 3 }
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 10
}
```

---

### `POST /api/trips`
Crear un nuevo viaje.

**Request:**
```json
{
  "title": "Japón Octubre 2026",
  "description": "Viaje de 10 días: Tokio, Kyoto, Osaka",
  "startDate": "2026-10-01",
  "endDate": "2026-10-11",
  "currency": "EUR"
}
```

**Response 201:** El objeto Trip completo creado.

---

### `GET /api/trips/:tripId`
Obtener un viaje completo con todos sus bloques, destinos y presupuesto.

**Response 200:**
```json
{
  "id": "clx...",
  "title": "...",
  "destinations": [...],
  "blocks": [...],
  "budgetSummary": {
    "totalEstimated": 2340.00,
    "totalActual": 890.00,
    "currency": "EUR",
    "byCategory": { "FLIGHTS": 650, "ACCOMMODATION": 980, ... }
  }
}
```

---

### `PATCH /api/trips/:tripId`
Actualizar metadata del viaje (título, fechas, estado, etc).

### `DELETE /api/trips/:tripId`
Eliminar viaje y todos sus datos asociados. Requiere confirmación (`body: { confirm: true }`).

---

## 4. Bloques (Blocks)

### `GET /api/trips/:tripId/blocks`
Lista bloques del viaje. Query params: `?type=ACTIVITY&date=2026-10-03&destinationId=...`

### `POST /api/trips/:tripId/blocks`
Crear un bloque nuevo.

**Request:**
```json
{
  "type": "ACTIVITY",
  "title": "Visita Sagrada Família",
  "date": "2026-10-05",
  "startTime": "10:00",
  "estimatedDurationMinutes": 120,
  "estimatedCost": 26,
  "costCurrency": "EUR",
  "destinationId": "clx...",
  "status": "PLANNED",
  "content": {
    "venue": "Sagrada Família",
    "address": "Carrer de Mallorca, 401",
    "reservationRequired": true
  }
}
```

**Response 201:** Bloque creado completo.

---

### `PATCH /api/trips/:tripId/blocks/:blockId`
Actualizar un bloque. Solo se envían los campos a modificar (PATCH parcial).

### `DELETE /api/trips/:tripId/blocks/:blockId`
Eliminar un bloque.

### `PATCH /api/trips/:tripId/blocks/reorder`
Reordenar bloques (drag & drop).

**Request:**
```json
{
  "orderedIds": ["block_3", "block_1", "block_4", "block_2"]
}
```

---

## 5. Presupuesto (Budget)

### `GET /api/trips/:tripId/budget`
Obtener resumen completo de presupuesto del viaje.

**Response 200:**
```json
{
  "items": [...],
  "summary": {
    "totalEstimated": 2340.00,
    "totalActual": 890.00,
    "difference": -1450.00,
    "currency": "EUR",
    "byCategory": {
      "FLIGHTS": { "estimated": 650, "actual": 650, "isPaid": true },
      "ACCOMMODATION": { "estimated": 980, "actual": 0, "isPaid": false },
      ...
    }
  }
}
```

### `POST /api/trips/:tripId/budget`
Añadir ítem de presupuesto manual.

### `PATCH /api/trips/:tripId/budget/:itemId`
Actualizar ítem (marcar como pagado, actualizar costo real).

---

## 6. Documentos (Documents)

### `POST /api/trips/:tripId/documents`
Upload de documento. Usa `multipart/form-data`.

**Response 201:**
```json
{
  "id": "doc_...",
  "fileName": "confirmacion-vuelo.pdf",
  "fileUrl": "https://...",
  "parsedContent": {
    "type": "flight_confirmation",
    "flightNumber": "VY1234",
    "origin": "MAD",
    "destination": "BCN",
    "departureDate": "2026-10-01",
    "confirmationCode": "ABC123"
  },
  "suggestedBlock": "block_567"
}
```

### `DELETE /api/trips/:tripId/documents/:docId`
Eliminar documento del storage y de la base de datos.

---

## 7. Chat IA (AI)

### `POST /api/ai/chat`
Endpoint de streaming SSE para el chat con IA.

**Request:**
```json
{
  "tripId": "clx...",
  "message": "Quiero planificar 3 días en Tokio empezando el 1 de octubre",
  "conversationHistory": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:** `text/event-stream` (SSE)

```
data: {"type":"status","message":"Analizando tu solicitud..."}

data: {"type":"text","delta":"He preparado un itinerario base"}

data: {"type":"text","delta":" para tus 3 días en Tokio."}

data: {"type":"action","action":{"type":"CREATE_BLOCK","blockType":"ACTIVITY","previewText":"Día 1 mañana: Mercado de Tsukiji (2h)","data":{...}}}

data: {"type":"action","action":{"type":"CREATE_BLOCK","blockType":"ACTIVITY","previewText":"Día 1 tarde: Templo Senso-ji en Asakusa (1.5h)","data":{...}}}

data: {"type":"finish","finishReason":"stop"}
```

---

### `POST /api/ai/validate`
Validar viabilidad logística del itinerario actual (sin chat, solo validación).

**Request:** `{ "tripId": "clx..." }`

**Response 200:**
```json
{
  "valid": false,
  "conflicts": [
    {
      "severity": "ERROR",
      "type": "INSUFFICIENT_TRANSIT_TIME",
      "description": "Vuelo de salida a las 08:00 desde Narita (NRT). El traslado desde Shinjuku requiere 90 minutos. El check-out del hotel está planificado a las 07:00.",
      "affectedBlocks": ["block_12", "block_13"],
      "suggestion": "Hacer check-out a las 05:30 o reservar vuelo de las 10:00."
    }
  ],
  "warnings": [
    {
      "severity": "WARNING",
      "type": "HIGH_SEASON_ALERT",
      "description": "Octubre es temporada alta de momiji en Kyoto. Los templos pueden requerir reserva con semanas de antelación.",
      "affectedBlocks": ["block_20", "block_21"]
    }
  ]
}
```

---

## 8. Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# IA
OPENAI_API_KEY=

# APIs de viaje
AMADEUS_CLIENT_ID=
AMADEUS_CLIENT_SECRET=
SERPAPI_KEY=
VIATOR_API_KEY=
GOOGLE_MAPS_API_KEY=

# Storage
BLOB_READ_WRITE_TOKEN=

# Cache
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email
RESEND_API_KEY=
```
