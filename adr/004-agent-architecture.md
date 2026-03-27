# ADR-004: Separación Lógica de Agentes (no Microservicios)

**Estado:** Aceptado | **Fecha:** 2026-03-26

## Contexto
El sistema necesita agentes especializados (Planner, Validator, Info). Se puede implementar como microservicios independientes o como módulos TypeScript dentro del mismo proceso Next.js.

## Decisión
**Separación lógica de agentes como módulos TypeScript** dentro del proceso Next.js, no como microservicios físicamente separados.

## Razonamiento
Microservicios independientes para el MVP añaden overhead injustificado: message queues, service discovery, coordinación de deployments, networking entre servicios, latencia adicional. Los agentes son módulos TypeScript que se pueden extraer a Vercel Functions independientes cuando sea necesario, sin cambiar sus interfaces.

## Consecuencias
**Positivas:**
- Deploy simple: todo en Vercel como funciones serverless
- Latencia mínima entre agentes (mismo proceso, sin red)
- Refactorización a microservicios posible sin cambiar las interfaces de los agentes

**Negativas:**
- Si un agente consume muchos recursos, afecta a todos los demás en el mismo proceso
- Cold starts de Vercel afectan a todo el sistema

## Punto de migración a microservicios
Cuando el Validator Agent necesite >10 segundos de procesamiento (por ejemplo, validar itinerarios complejos en background), se extrae a una Vercel Queue Function sin cambiar su interfaz pública.
