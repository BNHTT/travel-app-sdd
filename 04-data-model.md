# 04 — Modelo de Datos

> **Versión:** 0.1.0 | **Estado:** Borrador | **Fecha:** 2026-03-26

---

## 1. Schema Prisma Completo

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── USUARIOS ───────────────────────────────────────────────────

model User {
  id           String       @id @default(cuid())
  email        String       @unique
  name         String?
  avatarUrl    String?
  authProvider AuthProvider @default(EMAIL)
  homeCountry  String?      // Para calcular requisitos de visa
  currency     String       @default("USD")
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  trips        Trip[]
  accounts     Account[]    // NextAuth
  sessions     Session[]    // NextAuth

  @@index([email])
}

enum AuthProvider {
  EMAIL
  GOOGLE
}

// NextAuth models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ─── VIAJES ─────────────────────────────────────────────────────

model Trip {
  id             String     @id @default(cuid())
  userId         String
  title          String
  description    String?
  startDate      DateTime?
  endDate        DateTime?
  status         TripStatus @default(PLANNING)
  coverImageUrl  String?
  currency       String     @default("USD")
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  destinations   Destination[]
  blocks         Block[]
  chatMessages   ChatMessage[]
  documents      Document[]
  budgetItems    BudgetItem[]

  @@index([userId])
  @@index([userId, status])
}

enum TripStatus {
  PLANNING
  UPCOMING
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}

// ─── DESTINOS ───────────────────────────────────────────────────

model Destination {
  id            String    @id @default(cuid())
  tripId        String
  name          String
  country       String
  lat           Float?
  lng           Float?
  arrivalDate   DateTime?
  departureDate DateTime?
  timezone      String?
  sortOrder     Int       @default(0)
  // Cache de datos del destino (clima, visa, moneda, etc.)
  // Se refresca cada 24h desde APIs externas
  metadata      Json?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  trip          Trip    @relation(fields: [tripId], references: [id], onDelete: Cascade)
  blocks        Block[]

  @@index([tripId])
}

// ─── BLOQUES ────────────────────────────────────────────────────

model Block {
  id                      String      @id @default(cuid())
  tripId                  String
  destinationId           String?
  parentBlockId           String?
  type                    BlockType
  title                   String
  // Datos específicos por tipo de bloque (ver sección 2)
  content                 Json
  sortOrder               Int         @default(0)
  date                    DateTime?
  startTime               String?     // HH:mm
  endTime                 String?     // HH:mm
  estimatedDurationMinutes Int?
  estimatedCost           Decimal?    @db.Decimal(10, 2)
  actualCost              Decimal?    @db.Decimal(10, 2)
  costCurrency            String?
  status                  BlockStatus @default(IDEA)
  sourceUrl               String?     // URL de reserva o referencia
  aiGenerated             Boolean     @default(false)
  notes                   String?     // Notas libres del usuario
  createdAt               DateTime    @default(now())
  updatedAt               DateTime    @updatedAt

  trip          Trip         @relation(fields: [tripId], references: [id], onDelete: Cascade)
  destination   Destination? @relation(fields: [destinationId], references: [id])
  parent        Block?       @relation("BlockChildren", fields: [parentBlockId], references: [id])
  children      Block[]      @relation("BlockChildren")
  documents     Document[]
  budgetItem    BudgetItem?

  @@index([tripId])
  @@index([tripId, date])
  @@index([tripId, type])
}

enum BlockType {
  SEGMENT     // Tramo de viaje (vuelo, tren, coche)
  STAY        // Alojamiento
  ACTIVITY    // Actividad, excursión, visita
  NOTE        // Nota de texto libre
  LINK        // URL guardada
  DOCUMENT    // Archivo adjunto
  BUDGET_ITEM // Línea de presupuesto
  CHECKLIST   // Lista de tareas/empaque
}

enum BlockStatus {
  IDEA        // Solo una idea, no comprometida
  PLANNED     // Planificada pero no reservada
  BOOKED      // Reservada y confirmada
  DONE        // Realizada
  CANCELLED   // Cancelada
}

// ─── CHAT ───────────────────────────────────────────────────────

model ChatMessage {
  id            String          @id @default(cuid())
  tripId        String
  role          ChatMessageRole
  content       String          @db.Text
  // Acciones propuestas/ejecutadas en este mensaje
  actions       Json?
  // Metadata de qué agentes se invocaron y con qué resultado
  agentMetadata Json?
  createdAt     DateTime        @default(now())

  trip Trip @relation(fields: [tripId], references: [id], onDelete: Cascade)

  @@index([tripId])
  @@index([tripId, createdAt])
}

enum ChatMessageRole {
  USER
  ASSISTANT
  SYSTEM
}

// ─── DOCUMENTOS ─────────────────────────────────────────────────

model Document {
  id             String    @id @default(cuid())
  tripId         String
  blockId        String?
  fileName       String
  fileUrl        String    // URL en Vercel Blob
  fileType       String    // MIME type
  fileSizeBytes  Int
  // Datos extraídos por IA (fechas, confirmaciones, etc.)
  parsedContent  Json?
  uploadedAt     DateTime  @default(now())

  trip  Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)
  block Block? @relation(fields: [blockId], references: [id])

  @@index([tripId])
}

// ─── PRESUPUESTO ────────────────────────────────────────────────

model BudgetItem {
  id              String          @id @default(cuid())
  tripId          String
  blockId         String?         @unique // Vinculado a un bloque específico (opcional)
  category        BudgetCategory
  description     String
  estimatedAmount Decimal         @db.Decimal(10, 2)
  actualAmount    Decimal?        @db.Decimal(10, 2)
  currency        String          @default("USD")
  isPaid          Boolean         @default(false)
  paidAt          DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  trip  Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)
  block Block? @relation(fields: [blockId], references: [id])

  @@index([tripId])
  @@index([tripId, category])
}

enum BudgetCategory {
  FLIGHTS
  ACCOMMODATION
  TRANSPORT       // Transporte local, taxis, trenes
  FOOD
  ACTIVITIES      // Entradas, tours, excursiones
  SHOPPING
  INSURANCE
  VISA
  OTHER
}
```

---

## 2. Estructura del Campo `content` (JSONB) por Tipo de Bloque

### SEGMENT (Tramo de viaje)
```json
{
  "origin": "Madrid (MAD)",
  "destination": "Barcelona (BCN)",
  "mode": "flight | train | bus | car | ferry | other",
  "operator": "Vueling",
  "flightNumber": "VY1234",
  "bookingReference": "ABC123",
  "terminal": "T1",
  "platform": null,
  "baggageAllowance": "23kg + 10kg cabina",
  "seatNumbers": ["12A", "12B"]
}
```

### STAY (Alojamiento)
```json
{
  "property": "Hotel Arts Barcelona",
  "address": "Carrer de la Marina, 19-21, 08005 Barcelona",
  "lat": 41.3868,
  "lng": 2.1975,
  "checkInTime": "15:00",
  "checkOutTime": "11:00",
  "roomType": "Habitación doble estándar",
  "bedType": "King",
  "guests": 2,
  "confirmationNumber": "HTL-789456",
  "loyaltyPoints": "Marriott Bonvoy",
  "breakfastIncluded": false,
  "amenities": ["WiFi", "Piscina", "Gimnasio"]
}
```

### ACTIVITY (Actividad)
```json
{
  "venue": "Sagrada Família",
  "address": "Carrer de Mallorca, 401, 08013 Barcelona",
  "lat": 41.4036,
  "lng": 2.1744,
  "category": "museo | tour | excursion | restaurante | entretenimiento | otro",
  "reservationRequired": true,
  "confirmationNumber": "SF-2026-45678",
  "ticketUrl": "https://...",
  "dressCode": null,
  "accessibilityNotes": "Silla de ruedas disponible",
  "viatorProductCode": null,
  "difficulty": "easy | moderate | hard"
}
```

### NOTE (Nota)
```json
{
  "markdown": "## Ideas para restaurantes\n\n- Bar del Pla (cocina catalana)\n- Bodega Sepúlveda\n\n**Recordatorio:** Reservar con 2 semanas de antelación.",
  "pinned": false,
  "color": "#FFF3CD"
}
```

### CHECKLIST (Lista de tareas)
```json
{
  "items": [
    { "id": "1", "text": "Renovar pasaporte", "checked": true, "dueDate": "2026-08-01" },
    { "id": "2", "text": "Contratar seguro de viaje", "checked": false },
    { "id": "3", "text": "Descargar mapas offline", "checked": false }
  ]
}
```

---

## 3. Índices de Base de Datos

```sql
-- Queries frecuentes optimizadas con índices compuestos

-- Obtener todos los bloques de un viaje ordenados por fecha
CREATE INDEX idx_blocks_trip_date ON "Block"("tripId", "date");

-- Obtener bloques por tipo dentro de un viaje
CREATE INDEX idx_blocks_trip_type ON "Block"("tripId", "type");

-- Obtener mensajes de chat de un viaje en orden cronológico
CREATE INDEX idx_chat_trip_created ON "ChatMessage"("tripId", "createdAt");

-- Obtener viajes de un usuario por estado
CREATE INDEX idx_trips_user_status ON "Trip"("userId", "status");

-- Presupuesto por categoría
CREATE INDEX idx_budget_trip_category ON "BudgetItem"("tripId", "category");
```

---

## 4. Estrategia de Migraciones

- Usar `prisma migrate dev` en desarrollo (con Neon branching)
- Usar `prisma migrate deploy` en producción (integrado en CI/CD de Vercel)
- Las migraciones son irreversibles por defecto — para rollback, crear nueva migración de reversión
- Campos nullable por defecto para nuevas columnas en tablas existentes
- Nunca eliminar columnas directamente — deprecar con `@deprecated` en el schema primero

---

## 5. Política de Retención de Datos

| Tipo de Dato | Retención | Justificación |
|-------------|-----------|---------------|
| Viajes activos | Indefinido mientras cuenta activa | Datos de usuario |
| Viajes archivados | 2 años tras último acceso | Espacio de almacenamiento |
| Mensajes de chat | 1 año | Historial de conversación |
| Documentos subidos | Igual que el viaje al que pertenecen | Coherencia |
| Datos de sesión | 30 días (expiración automática) | Seguridad |
| Logs del sistema | 90 días | Debugging y compliance |
