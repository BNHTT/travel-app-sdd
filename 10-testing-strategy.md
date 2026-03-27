# 10 — Estrategia de Testing

> **Versión:** 0.1.0 | **Estado:** Borrador | **Fecha:** 2026-03-26

---

## 1. Pirámide de Testing

```
          E2E Tests (Playwright)
         /─────────────────────\       ← Flujos críticos de usuario
        /    Integration Tests   \     ← API routes + DB real
       /──────────────────────────\
      /        Unit Tests          \   ← Lógica pura, validators, utils
     /────────────────────────────  \
```

**Distribución objetivo:**
- Unit: 60% de cobertura en `lib/` y `utils/`
- Integration: Todos los API endpoints críticos
- E2E: 5-10 flujos principales de usuario

---

## 2. Tests Unitarios (Jest/Vitest)

### Qué testear
- Validadores Zod (schemas de API)
- Lógica del Agente Validator (detección de conflictos)
- Utilidades de fecha y zona horaria
- Cálculos de presupuesto y conversión de moneda
- Guardrails del sistema de agentes

### Ejemplos
```typescript
// __tests__/validator-agent.test.ts
describe('ValidatorAgent - detectConflicts', () => {
  it('detecta solapamiento de bloques en el mismo día', () => {
    const blocks = [
      { startTime: '09:00', estimatedDurationMinutes: 120, title: 'Museo A' },
      { startTime: '10:30', estimatedDurationMinutes: 60, title: 'Museo B' },
    ];
    const conflicts = detectTimeConflicts(blocks);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].type).toBe('TIME_OVERLAP');
  });

  it('no reporta conflicto cuando hay margen suficiente', () => {
    const blocks = [
      { startTime: '09:00', estimatedDurationMinutes: 120 },
      { startTime: '11:30', estimatedDurationMinutes: 60 },
    ];
    expect(detectTimeConflicts(blocks)).toHaveLength(0);
  });
});
```

---

## 3. Tests de Integración

**Herramienta:** Vitest + base de datos de test real (Neon branch)

### Qué testear
- Todos los endpoints de API CRUD (trips, blocks, budget)
- Autorización: verificar que usuarios no acceden a recursos ajenos
- Subida de documentos y parsing
- Validación de inputs con Zod

```typescript
// __tests__/api/trips.test.ts
describe('POST /api/trips', () => {
  it('crea un viaje para usuario autenticado', async () => {
    const response = await testClient.post('/api/trips')
      .withSession(testUser)
      .json({ title: 'Test Trip', currency: 'EUR' });

    expect(response.status).toBe(201);
    expect(response.body.userId).toBe(testUser.id);
  });

  it('rechaza request sin sesión con 401', async () => {
    const response = await testClient.post('/api/trips')
      .json({ title: 'Test Trip' });
    expect(response.status).toBe(401);
  });

  it('rechaza acceso a trip de otro usuario con 403', async () => {
    const otherUserTrip = await createTrip(otherUser);
    const response = await testClient.get(`/api/trips/${otherUserTrip.id}`)
      .withSession(testUser);
    expect(response.status).toBe(403);
  });
});
```

---

## 4. Tests E2E con Playwright (skill webapp-testing)

### Flujos críticos a testear

1. **Registro y onboarding:** Crear cuenta → verificar email → llegar al dashboard vacío
2. **Crear viaje y bloques manualmente:** Dashboard → crear trip → añadir destino → añadir bloque ACTIVITY
3. **Chat IA básico:** Abrir chat → enviar mensaje → recibir respuesta streaming → aceptar bloque propuesto
4. **Vista Timeline:** Navegar a Timeline → verificar bloques ordenados por día/hora
5. **Subida de documento:** Subir PDF de confirmación → verificar parsing → vincular a bloque

### Patrón de tests E2E (de la skill webapp-testing)
```typescript
// e2e/create-trip.spec.ts
import { test, expect } from '@playwright/test';

test('usuario puede crear un viaje y añadir un bloque', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'testpassword123');
  await page.click('[type=submit]');

  await page.waitForURL('/dashboard');

  // Crear viaje
  await page.click('[data-testid="create-trip-btn"]');
  await page.fill('[name=title]', 'Viaje a Roma 2026');
  await page.click('[data-testid="confirm-create"]');

  await page.waitForURL(/\/trip\/.+/);

  // Añadir bloque manualmente
  await page.click('[data-testid="add-block-btn"]');
  await page.click('[data-testid="block-type-ACTIVITY"]');
  await page.fill('[name=title]', 'Visita al Coliseo');
  await page.fill('[name=estimatedDurationMinutes]', '120');
  await page.click('[data-testid="save-block"]');

  // Verificar que el bloque aparece
  await expect(page.locator('[data-testid="block-Visita al Coliseo"]')).toBeVisible();
});
```

---

## 5. Validación de Output de IA

Los outputs de los agentes deben ser testeados con casos de regresión:

```typescript
// __tests__/ai/planner-agent.test.ts
describe('PlannerAgent - propose_block tool', () => {
  it('genera un bloque ACTIVITY con campos requeridos', async () => {
    const result = await plannerAgent.run(
      'Sugiere una actividad para la mañana del 3 de octubre en Tokio'
    );
    const proposedBlock = result.toolCalls.find(t => t.toolName === 'propose_block');

    expect(proposedBlock).toBeDefined();
    expect(proposedBlock.args.type).toBe('ACTIVITY');
    expect(proposedBlock.args.data.venue).toBeDefined();
    expect(proposedBlock.args.previewText).toBeTruthy();
  });
});
```

---

## 6. Comandos de Testing

```bash
# Tests unitarios e integración
npm run test

# Tests con cobertura
npm run test:coverage

# Tests E2E (requiere servidor corriendo)
npm run test:e2e

# E2E en modo UI (debug visual)
npm run test:e2e:ui

# Solo E2E de flujo crítico de chat
npm run test:e2e -- --grep "chat"
```
