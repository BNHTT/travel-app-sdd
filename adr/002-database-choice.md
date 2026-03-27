# ADR-002: PostgreSQL + JSONB sobre Base de Datos NoSQL

**Estado:** Aceptado | **Fecha:** 2026-03-26

## Contexto
Los bloques de viaje tienen tipos diferentes (SEGMENT, STAY, ACTIVITY...) con estructuras de datos distintas. Necesitamos flexibilidad de esquema pero también queries relacionales eficientes.

## Decisión
**PostgreSQL con campo `content: JSONB`** en la tabla Block.

## Razonamiento
Los datos de viaje son inherentemente relacionales: un bloque pertenece a un trip, que pertenece a un usuario. Queries como "todos los bloques de este viaje del 3 de octubre" son relacionales y se benefician de índices SQL. El campo JSONB da la flexibilidad de MongoDB para el contenido específico de cada tipo de bloque sin sacrificar la integridad relacional.

## Consecuencias
**Positivas:**
- Queries relacionales eficientes con índices en `tripId`, `date`, `type`
- El JSONB `content` es indexable y queryable cuando se necesite
- Prisma ORM mantiene type safety en TypeScript
- Neon PostgreSQL ofrece branching de DB para previews de Vercel

**Negativas:**
- Los datos dentro del campo JSONB no tienen validación de esquema a nivel de BD (se delega a Zod en la aplicación)

## Alternativas Rechazadas
- **MongoDB:** Sin garantías relacionales, más difícil de hacer queries complejas, no necesario para este caso
- **Tablas separadas por tipo de bloque (SegmentBlock, StayBlock...):** Explosión de tablas, queries complejas con JOINs, difícil de extender con nuevos tipos
