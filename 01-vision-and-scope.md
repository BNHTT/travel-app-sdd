# 01 — Visión y Alcance
## App de Viajes con IA — Workspace Inteligente

> **Versión:** 0.1.0 | **Estado:** Borrador | **Fecha:** 2026-03-26

---

## 1. Declaración de Visión

**"Ser el workspace de inteligencia de viajes que transforma 18 horas de caos de planificación en un plan organizado, validado y listo para ejecutar."**

Este producto no es una OTA (Online Travel Agency). No compite con Booking.com o Expedia en inventario o precio. Es una herramienta de organización y planificación asistida por IA, más cercana en metáfora a Notion o Linear que a Expedia.

---

## 2. Problema que Resuelve

### 2.1 El Problema Central
El viajero moderno usa simultáneamente Google Docs, hojas de cálculo, Pinterest, capturas de pantalla y 3-5 aplicaciones de reserva distintas. Esta fragmentación genera:
- **18 horas** promedio de investigación y planificación por viaje
- **Fragmentación cognitiva** al saltar entre herramientas
- **Ansiedad post-decisión** — el 71% duda si tomó la mejor decisión tras reservar
- **Errores logísticos** no detectados (museos cerrados en lunes, tiempos de tránsito irreales)
- **Parálisis por análisis** — el 58% se siente abrumado por el volumen de opciones

### 2.2 Por Qué las Soluciones Actuales No Resuelven Esto
- **Google Docs/Notion:** Sin estructura específica para viajes, sin IA, sin validación
- **ChatGPT/Claude:** Sin memoria persistente de viaje, sin workspace organizado, sin integración de datos reales
- **Booking/Expedia:** Herramientas de transacción, no de planificación; abandonan al usuario tras la reserva
- **TripIt/Roadtrippers:** Organización pasiva de confirmaciones, sin IA colaborativa

---

## 3. Propuesta de Valor

| Para... | Quien... | El producto es... | Que... | A diferencia de... |
|---------|---------|------------------|--------|-------------------|
| Viajeros de 25-40 años | Planifican 2-5 viajes/año y se sienten abrumados por la fase de investigación | Un workspace de planificación inteligente | Organiza toda la información del viaje en una estructura tipo Notion y usa IA para validar la lógica, estimar costos y detectar problemas logísticos | ChatGPT (sin persistencia ni workspace) y Notion (sin IA especializada en viajes ni datos en tiempo real) |

---

## 4. Personas de Usuario

### Persona Primaria: "El Explorador Organizado"
- **Demografía:** 25-40 años, profesional, ingresos medios-altos, digitalmente nativo
- **Frecuencia de viaje:** 2-5 viajes/año (mix fines de semana + vacaciones de 1-2 semanas)
- **Stack actual:** Google Docs + Excel/Sheets + Pinterest + capturas de pantalla + 3-5 apps
- **Frustración principal:** La fase de investigación y organización (no la reserva)
- **Deseo principal:** Una "fuente única de verdad" por viaje, actualizable y compartible
- **Relación con IA:** Usa ChatGPT regularmente, está cómodo con sugerencias de IA
- **Disposición a pagar:** $8-15/mes por ahorrar tiempo significativo

### Persona Secundaria: "El Planificador Ansioso"
- **Perfil:** Misma demografía, pero con mayor ansiedad sobre la logística del viaje
- **Frustración específica:** Miedo a cometer errores (conectar vuelos con poco tiempo, llegar a lugar cerrado, exceder presupuesto)
- **Valor buscado:** Validación externa de que sus planes son logísticamente correctos
- **Segmento:** El 71% con "ansiedad post-reserva" y el 37% que reporta que las apps no ayudaron en crisis

---

## 5. Alcance del Producto

### 5.1 EN Scope — MVP (Semanas 1-10)

| Función | Descripción |
|---------|-------------|
| Trip Workspace | Crear y gestionar viajes como workspaces estructurados con múltiples vistas |
| Chat IA | Panel de conversación con IA que genera bloques estructurados en el workspace |
| Itinerary Builder | Vista timeline día-a-día con drag & drop y estimación de tiempos |
| Páginas de Destino | Info auto-generada (clima, visa, moneda, seguridad, zona horaria) |
| Budget Tracker | Tabla de presupuesto por categoría con estimados de IA |
| Document Vault | Almacenamiento de confirmaciones, PDFs y capturas de pantalla |
| Autenticación | Email/password + Google OAuth |
| Validación Logística Básica | Detección de conflictos de horario y tiempos de tránsito imposibles |

### 5.2 FUERA de Scope — MVP

- Reservas y pagos dentro de la app
- Comparación de precios en tiempo real integrada (solo links a OTAs)
- App nativa móvil (web responsive es suficiente para MVP)
- Colaboración multi-usuario en tiempo real
- Monitoreo de vuelos y alertas automatizadas
- Features sociales (compartir viajes públicamente, reviews)
- Acceso a precios de hotel/vuelo en tiempo real (Fase 2)

### 5.3 En Scope — Fase 2 (Post-MVP)

- Búsqueda de vuelos y hoteles con precios reales (Amadeus + SerpAPI)
- Sugerencias de excursiones y actividades (Viator API)
- Monitoreo de vuelos reservados
- Colaboración: compartir workspace con acompañantes de viaje
- App PWA mejorada para mobile
- Alertas de variaciones de precio

### 5.4 En Scope — Fase 3 (Año 2+)

- Reservas directas de vuelos y hoteles dentro de la app
- Motor de comparación de precios multi-fuente
- Versión nativa mobile (React Native)
- Integraciones con programas de fidelidad de aerolíneas
- Modo offline para uso durante el viaje

---

## 6. Modelo de Negocio

### 6.1 Monetización MVP

| Tier | Precio | Incluye |
|------|--------|---------|
| **Free** | $0/mes | 2 viajes activos, funciones básicas de workspace, 10 mensajes IA/día |
| **Explorer** | $9/mes | Viajes ilimitados, mensajes IA ilimitados, document vault (1GB), exportar a PDF |
| **Pro** | $15/mes | Todo Explorer + búsqueda de vuelos/hoteles en tiempo real, alertas de precio, compartir viajes |

### 6.2 Ingresos Adicionales (Fase 2+)

- Comisiones de afiliado en reservas via Viator, Kiwi.com, Booking.com Affiliate API
- Planes para agencias de viajes (B2B)

---

## 7. Métricas de Éxito

| Métrica | Objetivo MVP | Objetivo Año 1 |
|---------|-------------|----------------|
| Usuarios registrados | 500 (beta) | 10,000 |
| Viajes activos creados | 1,000 | 50,000 |
| Tiempo medio de creación de itinerario (5 días) | < 15 min | < 10 min |
| NPS tras primera sesión | > 40 | > 50 |
| Tasa de conversión Free → Paid | — | > 8% |
| Retención a 30 días | > 40% | > 55% |

---

## 8. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Alucinaciones de IA arruinan planes del usuario | Media | Alto | Agente Validator + grounding en APIs reales + indicadores de confianza |
| Competidores grandes replican la funcionalidad | Alta | Medio | Velocidad de ejecución + foco en nicho de organización vs. transacción |
| Costos de API de IA escalan rápido | Media | Medio | Cache agresivo, modelos más baratos para tareas simples, límites en plan Free |
| Dependencia de APIs de terceros (Amadeus, etc.) | Baja | Medio | Proveedores alternativos para cada tipo de dato, arquitectura con fallbacks |
| Adopción lenta por desconfianza en IA para viajes | Media | Alto | Tier 1 autonomía siempre (sin permiso), User-in-the-loop para acciones con consecuencias |
