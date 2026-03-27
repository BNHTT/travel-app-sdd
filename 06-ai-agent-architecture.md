# 06 — Arquitectura del Sistema de Agentes IA

> **Versión:** 0.1.0 | **Estado:** Borrador | **Fecha:** 2026-03-26

---

## 1. Principios de Diseño del Sistema Agéntico

### 1.1 La IA Nunca Escribe Directo a la Base de Datos
La regla más importante del sistema: **ningún agente persiste datos directamente**. El flujo siempre es:
```
Agente propone → Frontend muestra preview → Usuario confirma → API persiste
```

### 1.2 Autonomía Graduada
| Tier | Acciones | Permiso |
|------|---------|---------|
| 1 | Poblar info destino, calcular tiempos, detectar conflictos | Automático |
| 2 | Proponer nuevos bloques, sugerir reorganizaciones | Preview + confirmación usuario |
| 3 | Links a reservas externas, comparación de precios | Solo iniciado por usuario |

### 1.3 Grounding Sobre Generación
Para hechos verificables (horarios, visas, precios, distancias), los agentes **siempre** consultan APIs con datos reales antes de responder. Nunca se fía solo del conocimiento del LLM para información factual.

---

## 2. Agentes del Sistema

### 2.1 Agente Orquestador

**Responsabilidad:** Punto de entrada único. Recibe todos los mensajes del usuario, analiza la intención, coordina los agentes especialistas y gestiona el stream SSE de vuelta al cliente.

**System Prompt base:**
```
Eres el asistente de planificación de viajes del workspace. Tienes acceso
a herramientas especializadas para planificar itinerarios, validar logística
y obtener información actualizada de destinos.

Reglas inquebrantables:
1. NUNCA afirmes hechos sobre precios, horarios, visas o tiempos de viaje
   sin verificarlos primero con las herramientas disponibles.
2. SIEMPRE muestra las propuestas de cambios al workspace como bloques
   de preview - nunca indiques que ya se guardaron hasta que el usuario confirme.
3. SIEMPRE incluye la fuente y fecha de actualización al dar datos de destino.
4. CUANDO detectes un problema logístico, explícalo ANTES de proponer soluciones.
5. Responde en el idioma del usuario.

Contexto del workspace actual:
{workspaceContext}
```

**Herramientas disponibles:**
- `propose_block(type, data, preview_text)` — propone un bloque al usuario
- `update_block(blockId, changes, preview_text)` — propone modificar un bloque existente
- `validate_itinerary(tripId)` — solicita al Validator que revise el itinerario completo
- `get_destination_info(city, country)` — consulta al Info Agent
- `search_flights(...)` — consulta vuelos via Amadeus/SerpAPI
- `search_hotels(...)` — consulta hoteles via Amadeus/SerpAPI
- `search_activities(...)` — consulta actividades via Viator

---

### 2.2 Agente Planner

**Responsabilidad:** Generación y optimización de itinerarios. Crea planes de viaje lógicos, sugiere actividades apropiadas, organiza días y detecta solapamientos.

**Especialidades:**
- Distribución de actividades por día según ritmo preferido (relajado/intenso)
- Agrupación geográfica de actividades para minimizar desplazamientos
- Balance entre hitos turísticos y experiencias locales menos conocidas
- Consideración de fatiga de viaje (jet lag, madrugadas de vuelo)

**Inputs:** Destinos, fechas, preferencias del usuario, historial de chat
**Outputs:** Array de propuestas de bloques (ACTIVITY, STAY, SEGMENT)

---

### 2.3 Agente Validator

**Responsabilidad:** Auditor de viabilidad logística. Verifica que los planes sean físicamente posibles en el mundo real.

**Checks que realiza:**
1. **Tiempos de tránsito:** ¿Hay tiempo suficiente entre actividades dado su distancia? (Google Maps Distance Matrix)
2. **Conexiones de transporte:** ¿El vuelo/tren llega con tiempo para el check-in del hotel?
3. **Horarios de apertura:** ¿Las atracciones propuestas están abiertas en los días/horas planificadas?
4. **Temporadas:** ¿Hay alertas estacionales? (cierre por invierno, temporada de lluvias)
5. **Conflictos de fecha:** ¿Los bloques del itinerario se solapan?
6. **Tiempo de reserva:** ¿Algunas atracciones requieren reserva con semanas de antelación?

**Inputs:** Estado actual del itinerario + contexto de destino
**Outputs:** Lista de conflictos con severidad (ERROR/ADVERTENCIA/INFO) y sugerencias de resolución

**Ejemplo de output del Validator:**
```json
{
  "conflicts": [
    {
      "severity": "ERROR",
      "type": "INSUFFICIENT_TRANSIT_TIME",
      "description": "El traslado del Museo del Prado al aeropuerto T4 requiere 45 minutos por Google Maps, pero hay solo 20 minutos entre el bloque del museo y el vuelo de salida.",
      "affectedBlocks": ["block_123", "block_456"],
      "suggestion": "Terminar la visita al museo 30 minutos antes o reservar el siguiente vuelo disponible (20:30)."
    }
  ]
}
```

---

### 2.4 Agente Info

**Responsabilidad:** Recuperación de información factual sobre destinos. **Siempre** usa APIs externas para hechos verificables — nunca confía solo en el conocimiento del LLM.

**Fuentes de datos:**
- **Visas:** Amadeus Safety Rated Places + fuentes gubernamentales verificadas
- **Clima:** OpenWeatherMap / WeatherAPI
- **Moneda:** Exchange rates API
- **Zona horaria:** Timezone database
- **Puntos de interés:** Google Maps Places API
- **Seguridad:** Amadeus Safe Place API

**Formato de respuesta estándar:**
```json
{
  "city": "Tokio",
  "country": "Japón",
  "timezone": "Asia/Tokyo (UTC+9)",
  "currency": { "code": "JPY", "name": "Yen japonés", "exchangeRate": "0.006 USD" },
  "visa": {
    "required": false,
    "notes": "Pasaportes EU/ES: visa waiver hasta 90 días",
    "source": "Embajada de Japón",
    "updatedAt": "2025-12-01"
  },
  "climate": {
    "month": "October",
    "description": "Otoño templado, momiji (hojas rojas), temperatura media 18°C",
    "alerts": ["Alta afluencia turística — reservar con antelación"]
  }
}
```

---

## 3. Tool Definitions (Vercel AI SDK)

### 3.1 `propose_block`
```typescript
const proposeBlockTool = tool({
  description: 'Propone añadir un nuevo bloque al workspace del viaje. El usuario debe confirmar antes de que se persista.',
  parameters: z.object({
    type: z.enum(['SEGMENT', 'STAY', 'ACTIVITY', 'NOTE', 'BUDGET_ITEM']),
    data: z.record(z.unknown()),
    previewText: z.string().describe('Descripción legible de la propuesta para mostrar al usuario'),
    date: z.string().optional().describe('Fecha ISO del bloque si aplica'),
    startTime: z.string().optional().describe('Hora de inicio HH:mm'),
    estimatedDurationMinutes: z.number().optional(),
    estimatedCost: z.number().optional(),
  }),
  execute: async (params) => {
    // No persiste nada — solo retorna la propuesta estructurada
    // El stream SSE emitirá un evento 'action' con estos datos
    return { proposed: true, ...params };
  }
});
```

### 3.2 `calculate_travel_time`
```typescript
const calculateTravelTimeTool = tool({
  description: 'Calcula el tiempo de viaje real entre dos ubicaciones usando Google Maps.',
  parameters: z.object({
    origin: z.string(),
    destination: z.string(),
    mode: z.enum(['driving', 'transit', 'walking', 'bicycling']),
    departureTime: z.string().optional().describe('ISO datetime para considerar tráfico en hora específica'),
  }),
  execute: async ({ origin, destination, mode, departureTime }) => {
    const cached = await redis.get(`travel:${origin}:${destination}:${mode}`);
    if (cached) return JSON.parse(cached);

    const result = await googleMapsClient.distancematrix({
      origins: [origin],
      destinations: [destination],
      mode,
      departure_time: departureTime ? new Date(departureTime) : undefined,
    });

    const data = {
      durationMinutes: result.rows[0].elements[0].duration.value / 60,
      distanceKm: result.rows[0].elements[0].distance.value / 1000,
      source: 'Google Maps',
    };

    await redis.setex(`travel:${origin}:${destination}:${mode}`, 3600, JSON.stringify(data));
    return data;
  }
});
```

---

## 4. Protocolo SSE de Streaming

El endpoint `/api/ai/chat` es una route handler de Next.js que usa `streamText` del Vercel AI SDK:

```typescript
// app/api/ai/chat/route.ts
export async function POST(req: Request) {
  const { tripId, message, history } = await req.json();
  const workspaceContext = await getTripContext(tripId);

  const result = streamText({
    model: openai('gpt-4o'),
    system: buildOrchestratorPrompt(workspaceContext),
    messages: history,
    tools: {
      propose_block: proposeBlockTool,
      calculate_travel_time: calculateTravelTimeTool,
      get_destination_info: getDestinationInfoTool,
      validate_itinerary: validateItineraryTool,
      search_flights: searchFlightsTool,
      search_activities: searchActivitiesTool,
    },
    onFinish: async ({ text, toolCalls }) => {
      // Persistir el mensaje del asistente con metadatos de herramientas usadas
      await saveChatMessage(tripId, 'assistant', text, toolCalls);
    },
  });

  return result.toDataStreamResponse();
}
```

### Eventos SSE emitidos al cliente:

| Evento | Payload | Propósito |
|--------|---------|-----------|
| `text` | `{ delta: string }` | Token incremental de texto |
| `tool_call` | `{ toolName, args }` | IA está usando una herramienta |
| `tool_result` | `{ toolName, result }` | Resultado de la herramienta |
| `finish` | `{ finishReason }` | Stream completado |

El frontend interpreta `tool_result` con `toolName === 'propose_block'` para renderizar las **ActionPreview cards**.

---

## 5. Guardrails y Seguridad

### 5.1 Rate Limiting
```typescript
// middleware.ts
const rateLimiter = new Ratelimit({
  redis: upstashRedis,
  limiter: Ratelimit.slidingWindow(20, '1m'), // 20 mensajes/minuto por usuario
});
```

### 5.2 Límites de Tokens por Mensaje
- Contexto máximo enviado al LLM: 8,000 tokens (workspace context comprimido si necesario)
- Respuesta máxima por mensaje: 2,000 tokens
- Si el workspace tiene >50 bloques, comprimir el contexto enviando solo bloques de los próximos 7 días

### 5.3 Validación de Tool Use
Antes de ejecutar cualquier tool call del LLM, validar con Zod que los parámetros son correctos. Si la validación falla, retornar error al LLM para que reformule.

### 5.4 Prevención de Acciones No Autorizadas
El Orquestador tiene prohibido explícito en su system prompt:
- Mencionar precios específicos sin verificar con API
- Confirmar reservas (no tiene esa capacidad)
- Acceder a datos de otros usuarios
- Ejecutar código arbitrario

---

## 6. Estimación de Costos de IA (MVP)

| Escenario | Tokens/sesión | Costo OpenAI (GPT-4o) |
|----------|--------------|----------------------|
| Planificación básica (5 mensajes) | ~3,000 | ~$0.015 |
| Planificación compleja (20 mensajes) | ~12,000 | ~$0.06 |
| Sesión con múltiples tool calls | ~20,000 | ~$0.10 |
| **100 usuarios activos/día** | — | **~$3-10/día** |

*Precios basados en GPT-4o: $2.50/1M tokens input, $10/1M tokens output (marzo 2026)*

**Estrategias de control de costos:**
1. Usar GPT-4o-mini para el Validator y el Info Agent (más baratos, tarea más estructurada)
2. Cache agresivo de contexto de workspace — no re-enviar bloques que no cambiaron
3. Limitar a 50 mensajes/día en plan Free, ilimitados en planes de pago
