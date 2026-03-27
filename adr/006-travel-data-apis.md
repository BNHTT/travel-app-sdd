# ADR-006: APIs Oficiales sobre Scraping para Datos de Viaje

**Estado:** Aceptado | **Fecha:** 2026-03-26

## Contexto
La app necesita datos de vuelos, hoteles y excursiones. Las opciones son: scraping directo de Booking/Google/Expedia, o uso de APIs oficiales/autorizadas.

## Decisión
**APIs oficiales y agregadores autorizados exclusivamente.** Cero scraping directo.

## Por qué el Scraping es Inviable

### Técnico
- Booking.com: Akamai Bot Manager + TLS fingerprinting (JA3/JA4) + canvas/WebGL fingerprinting
- Expedia: PerimeterX (HUMAN Security) con biometría conductual
- Airbnb: GraphQL obfuscado con schema cambiante semanalmente
- Google Flights: Payloads encriptados, reCAPTCHA v3 invisible
- Scrapers se rompen con cada actualización de defensas (frecuencia: semanal)

### Legal
- **CFAA (EE.UU.):** Riesgo de cargo criminal por acceso "no autorizado"
- **GDPR (UE):** Reviews con nombres de usuario = datos personales
- **ToS:** Todas las plataformas lo prohíben explícitamente — demandas civiles
- **Copyright:** Reviews y fotos son contenido protegido

## APIs Seleccionadas por Tipo de Dato

| Dato | API | Modelo | Costo MVP |
|------|-----|--------|----------|
| Vuelos | Amadeus Self-Service | Gratis (2K calls/mes) | $0 |
| Hoteles | Amadeus + SerpAPI | Comisión + $75/mes | $75 |
| Google Flights/Hotels | SerpAPI | $75/mes | (incluido) |
| Excursiones | Viator Partner API | 8% comisión | $0 |
| Info destinos | Google Maps Places | $200 crédito/mes | ~$0 |
| Low-cost airlines | Kiwi.com Tequila (Fase 2) | Comisión | $0 |

## Justificación de SerpAPI
SerpAPI es legalmente diferente a hacer scraping directo: es un servicio autorizado que asume la carga legal del compliance. Proporciona datos estructurados de Google Flights y Hotels que no tienen API oficial directa.

## Consecuencias
**Positivas:**
- Cero riesgo legal
- Datos estables y bien estructurados
- Modelo comisión hace los datos gratuitos mientras se escala
- Costo de ingeniería mínimo (no mantener scrapers)

**Negativas:**
- Dependencia de terceros para datos críticos
- Latencia adicional de APIs externas (mitigado con cache Redis)
- Cobertura limitada en el MVP (no todos los hoteles/vuelos del mundo)

## Mitigación de Dependencias
Cada tipo de dato tiene al menos 2 fuentes alternativas configuradas. Si Amadeus falla, SerpAPI cubre vuelos/hoteles. Si SerpAPI falla, la app funciona en modo degradado (sin precios en tiempo real) mostrando estimados basados en histórico.
