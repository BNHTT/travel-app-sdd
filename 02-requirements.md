# 02 — Requisitos Funcionales y No Funcionales
## Notación EARS (Easy Approach to Requirements Syntax)

> **Versión:** 0.1.0 | **Estado:** Borrador | **Fecha:** 2026-03-26

---

## Formato de Requisitos EARS

| Tipo | Sintaxis |
|------|---------|
| Ubiquitous | `El sistema SHALL [comportamiento]` |
| Event-driven | `WHEN [trigger] the system SHALL [comportamiento]` |
| Unwanted behavior | `IF [condición indeseable] THEN the system SHALL [comportamiento]` |
| State-driven | `WHILE [estado activo] the system SHALL [comportamiento]` |
| Optional feature | `WHERE [feature habilitada] the system SHALL [comportamiento]` |

---

## 1. Autenticación y Gestión de Usuarios

### RF-AUTH-001
`WHEN un usuario nuevo se registra con email y contraseña, the system SHALL crear una cuenta, enviar un email de verificación y redirigir al dashboard vacío.`

### RF-AUTH-002
`WHEN un usuario se autentica con Google OAuth, the system SHALL crear o recuperar su cuenta vinculada al email de Google y redirigir al dashboard.`

### RF-AUTH-003
`IF un usuario intenta acceder a cualquier ruta protegida sin sesión activa, THEN the system SHALL redirigir al login manteniendo la URL destino como parámetro de retorno.`

### RF-AUTH-004
`WHEN un usuario solicita restablecer contraseña, the system SHALL enviar un email con enlace de reset válido por 1 hora.`

---

## 2. Gestión de Viajes (Trips)

### RF-TRIP-001
`WHEN un usuario autenticado crea un nuevo viaje, the system SHALL generar un workspace vacío con título, y opcionales de fechas y descripción, redirigiendo al overview del nuevo viaje.`

### RF-TRIP-002
`El sistema SHALL mostrar en el dashboard todos los viajes del usuario ordenados por fecha de inicio más próxima, con indicadores de estado (Planificando, Próximo, En curso, Completado).`

### RF-TRIP-003
`WHEN un usuario elimina un viaje, the system SHALL solicitar confirmación explícita y, tras confirmarla, eliminar el viaje y todos sus bloques, documentos y mensajes asociados.`

### RF-TRIP-004
`WHEN un usuario modifica las fechas del viaje, the system SHALL actualizar automáticamente los indicadores de conflicto en todos los bloques del itinerario afectados.`

---

## 3. Bloques de Contenido

### RF-BLOCK-001
`WHEN el usuario crea un bloque de tipo ACTIVITY, the system SHALL capturar: título, fecha, hora de inicio, duración estimada en minutos, ubicación, costo estimado y estado (Idea/Planificado/Reservado).`

### RF-BLOCK-002
`WHEN el usuario crea un bloque de tipo STAY, the system SHALL capturar: nombre del alojamiento, dirección, fecha y hora de check-in, fecha y hora de check-out, costo por noche y número de confirmación (opcional).`

### RF-BLOCK-003
`WHEN el usuario crea un bloque de tipo SEGMENT, the system SHALL capturar: origen, destino, modo de transporte, operador, hora de salida, hora de llegada y referencia de reserva (opcional).`

### RF-BLOCK-004
`WHEN el usuario reordena bloques mediante drag & drop en el itinerario, the system SHALL persistir el nuevo orden inmediatamente y actualizar las validaciones logísticas afectadas.`

### RF-BLOCK-005
`IF un bloque de tipo SEGMENT tiene una hora de llegada posterior a la hora de inicio del siguiente bloque en el mismo día, THEN the system SHALL mostrar un indicador de conflicto visible en ambos bloques.`

---

## 4. Chat con IA

### RF-AI-001
`WHEN el usuario envía un mensaje al chat, the system SHALL iniciar una respuesta en streaming dentro de 2 segundos, mostrando tokens de texto incrementalmente.`

### RF-AI-002
`WHEN la IA genera una propuesta de bloque nuevo, the system SHALL renderizar una tarjeta de "vista previa de intención" con: tipo de bloque, datos propuestos, resumen legible y botones de Aceptar/Modificar/Rechazar.`

### RF-AI-003
`WHEN el usuario acepta una propuesta de bloque, the system SHALL persistir el bloque en la base de datos dentro de 500ms y actualizar la vista activa del workspace.`

### RF-AI-004
`WHEN el usuario rechaza una propuesta de bloque, the system SHALL descartar la propuesta y continuar la conversación sin crear ningún registro en la base de datos.`

### RF-AI-005
`WHILE la IA está procesando una consulta, the system SHALL mostrar indicadores de estado que identifiquen qué agente está activo ("Verificando tiempos de tránsito...", "Buscando info del destino...").`

### RF-AI-006
`IF el Agente Validator detecta un conflicto logístico en un plan propuesto, THEN the system SHALL incluir una explicación del conflicto en la respuesta antes de mostrar cualquier propuesta de bloque.`

### RF-AI-007
`El sistema SHALL conservar el historial completo de la conversación de cada viaje y cargarlo al abrir el chat del viaje.`

### RF-AI-008
`WHEN la IA hace una afirmación factual sobre visas, clima o requisitos de destino, the system SHALL incluir la fuente de datos y la fecha de actualización junto a la información.`

---

## 5. Destinos

### RF-DEST-001
`WHEN la IA agrega un destino al viaje y el usuario lo acepta, the system SHALL automáticamente poblar la página del destino con: zona horaria, moneda local, idioma oficial, y estado de visa para el usuario (si el país de origen está configurado).`

### RF-DEST-002
`WHEN se agrega un nuevo destino, the system SHALL llamar a la Google Maps Places API para obtener coordenadas geográficas y categorizar el destino en la vista de mapa.`

### RF-DEST-003
`El sistema SHALL mostrar una advertencia visible si las fechas de dos destinos consecutivos no dejan tiempo suficiente para el traslado entre ellos (basado en cálculo de Google Maps Distance Matrix).`

---

## 6. Presupuesto

### RF-BUDGET-001
`WHEN la IA agrega un bloque con costo estimado, the system SHALL automáticamente crear o actualizar la fila correspondiente en el tracker de presupuesto.`

### RF-BUDGET-002
`El sistema SHALL mostrar el total estimado del viaje en la cabecera del tracker, desglosado por categoría (Vuelos, Alojamiento, Transporte, Comida, Actividades, Otros).`

### RF-BUDGET-003
`WHEN el usuario actualiza el costo real de un ítem, the system SHALL recalcular los totales y mostrar la diferencia entre estimado y real (positiva en verde, negativa en rojo).`

### RF-BUDGET-004
`El sistema SHALL soportar múltiples monedas por viaje y mostrar conversiones a la moneda base del viaje usando tasas de cambio con fecha de actualización visible.`

---

## 7. Documentos

### RF-DOC-001
`WHEN el usuario sube un archivo (PDF, imagen), the system SHALL almacenarlo en cloud storage, crear un registro Document y intentar extraer automáticamente información estructurada (fechas, confirmaciones, números de reserva).`

### RF-DOC-002
`IF la extracción automática de un documento identifica una confirmación de vuelo o hotel, THEN the system SHALL proponer al usuario vincularla con el bloque correspondiente del itinerario.`

### RF-DOC-003
`El sistema SHALL aceptar archivos de hasta 10MB en formatos PDF, JPG, PNG, WEBP y HEIC.`

---

## 8. Vistas del Workspace

### RF-VIEW-001
`WHEN el usuario selecciona la Vista Timeline, the system SHALL renderizar todos los bloques del viaje organizados por día, con franjas horarias proporcionales a la duración estimada.`

### RF-VIEW-002
`WHEN el usuario selecciona la Vista Board, the system SHALL renderizar columnas Kanban con los estados: Investigación | Planificado | Reservado | Hecho.`

### RF-VIEW-003
`WHEN el usuario selecciona la Vista Mapa, the system SHALL renderizar pins georreferenciados para todos los bloques con ubicación, conectados por líneas que representan el orden del itinerario.`

---

## 9. Requisitos No Funcionales

### RNF-PERF-001 — Rendimiento
`El sistema SHALL responder a interacciones de UI (navegación, creación de bloques) en menos de 200ms bajo condiciones normales de red.`

### RNF-PERF-002 — Streaming IA
`El sistema SHALL iniciar la transmisión de tokens de respuesta IA en menos de 2 segundos desde el envío del mensaje.`

### RNF-PERF-003 — Carga inicial
`El sistema SHALL cargar la vista principal de un viaje (incluyendo todos los bloques) en menos de 3 segundos en conexiones de 10Mbps.`

### RNF-SEC-001 — Autenticación
`El sistema SHALL usar sesiones JWT con expiración de 30 días, con refresh automático en uso activo.`

### RNF-SEC-002 — Datos en tránsito
`El sistema SHALL usar HTTPS/TLS 1.3 para todas las comunicaciones entre cliente y servidor.`

### RNF-SEC-003 — Datos en reposo
`El sistema SHALL encriptar datos sensibles del usuario (tokens OAuth, números de confirmación de reserva) en la base de datos.`

### RNF-SEC-004 — Aislamiento de datos
`El sistema SHALL garantizar que ningún usuario puede acceder a datos de viajes que no le pertenecen. Toda query a la DB SHALL incluir verificación de userId.`

### RNF-ACC-001 — Accesibilidad
`El sistema SHALL cumplir con WCAG 2.1 nivel AA para todas las pantallas principales: contraste mínimo 4.5:1, navegación completa por teclado, compatibilidad con lectores de pantalla.`

### RNF-DIS-001 — Disponibilidad
`El sistema SHALL tener una disponibilidad objetivo del 99.5% mensual (máximo 3.6 horas de downtime/mes).`

### RNF-PRIV-001 — Privacidad
`El sistema SHALL ofrecer a los usuarios la capacidad de exportar todos sus datos en formato JSON y eliminar permanentemente su cuenta y todos sus datos asociados.`
