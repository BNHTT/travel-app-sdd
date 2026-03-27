# ADR-003: OpenAI GPT-4o via Vercel AI SDK

**Estado:** Aceptado | **Fecha:** 2026-03-26

## Contexto
Se necesita un LLM para el sistema de agentes con capacidades de tool use robusto, streaming, y buen rendimiento en tareas de planificación y razonamiento.

## Decisión
**OpenAI GPT-4o** como LLM primario, usando el **Vercel AI SDK** como capa de abstracción.

## Razonamiento
GPT-4o tiene ecosistema maduro, tool use sólido y bien documentado, y es el modelo más ampliamente testado para aplicaciones de producción con function calling. El Vercel AI SDK abstrae el proveedor, haciendo posible cambiar a otro modelo (Claude, Gemini) sin reescribir la integración.

## Estrategia de costos
- Usar **GPT-4o-mini** para Validator Agent e Info Agent (tareas más estructuradas y baratas)
- Reservar **GPT-4o** para el Orquestador y Planner (razonamiento complejo)
- Cache agresivo en Redis para reducir llamadas repetidas

## Consecuencias
**Positivas:**
- Tool use bien probado y estable
- Vercel AI SDK permite cambiar de proveedor si cambian precios/calidad
- Amplia comunidad y documentación

**Negativas:**
- Dependencia de servicio externo de pago
- Costos variables según uso (mitigado con cache y rate limiting)

## Alternativas Consideradas
- **Anthropic Claude Sonnet:** Excelente razonamiento y contexto largo, pero el usuario prefirió OpenAI
- **Gemini Pro:** Buena opción, menos ecosistema en el espacio de tools en 2026
