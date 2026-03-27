# 07 — Arquitectura Frontend

> **Versión:** 0.1.0 | **Estado:** Borrador | **Fecha:** 2026-03-26

---

## 1. Estructura de Rutas (Next.js App Router)

```
app/
├── (auth)/                          # Route group sin workspace layout
│   ├── login/page.tsx               # /login
│   ├── register/page.tsx            # /register
│   ├── reset-password/page.tsx      # /reset-password
│   └── layout.tsx                   # Layout centrado, sin sidebar
│
├── (workspace)/                     # Route group con workspace layout
│   ├── layout.tsx                   # Sidebar global + header
│   ├── dashboard/page.tsx           # /dashboard — lista de viajes
│   ├── trip/[tripId]/
│   │   ├── layout.tsx               # Trip sidebar + chat panel toggle
│   │   ├── page.tsx                 # /trip/:id — Board view (default)
│   │   ├── itinerary/page.tsx       # /trip/:id/itinerary — Timeline
│   │   ├── budget/page.tsx          # /trip/:id/budget — Budget tracker
│   │   ├── documents/page.tsx       # /trip/:id/documents — Document vault
│   │   ├── map/page.tsx             # /trip/:id/map — Vista mapa
│   │   └── destination/[destId]/page.tsx  # Página de destino individual
│   └── settings/page.tsx            # /settings — Preferencias usuario
│
├── api/                             # API Routes
├── layout.tsx                       # Root layout (providers globales)
└── page.tsx                         # / — Landing page (público)
```

---

## 2. Árbol de Componentes Principales

```
<RootLayout>                         # Providers: SessionProvider, QueryClientProvider
  <WorkspaceLayout>
    ├── <GlobalSidebar>              # Lista de viajes + nav global
    └── <TripLayout>
          ├── <TripHeader>           # Nombre viaje + ViewSwitcher + acciones
          ├── <ViewSwitcher>         # Board | Timeline | Budget | Map | Docs
          ├── <MainContent>
          │     ├── <BoardView>      # Kanban de bloques por estado
          │     ├── <TimelineView>   # Itinerario día a día
          │     ├── <BudgetView>     # Tabla de presupuesto
          │     ├── <MapView>        # Google Maps con pins
          │     └── <DocumentsView> # Vault de archivos
          └── <ChatPanel>            # Panel lateral de chat IA
                ├── <ChatHeader>
                ├── <ChatMessageList>
                │     └── <ChatMessage>
                │           └── <ActionPreviewCard> # Propuesta de bloque IA
                └── <ChatInput>
```

---

## 3. Gestión de Estado

### Estado del Servidor (TanStack Query)
```typescript
// hooks/useTrip.ts
export function useTrip(tripId: string) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => fetch(`/api/trips/${tripId}`).then(r => r.json()),
    staleTime: 30_000, // 30 segundos
  });
}

// hooks/useBlocks.ts
export function useBlocks(tripId: string, filters?: BlockFilters) {
  return useQuery({
    queryKey: ['blocks', tripId, filters],
    queryFn: () => fetchBlocks(tripId, filters),
  });
}

// Mutación con optimistic update
export function useCreateBlock(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlockDto) => createBlock(tripId, data),
    onMutate: async (newBlock) => {
      // Optimistic update: muestra el bloque antes de confirmación
      await queryClient.cancelQueries({ queryKey: ['blocks', tripId] });
      const previous = queryClient.getQueryData(['blocks', tripId]);
      queryClient.setQueryData(['blocks', tripId], (old: Block[]) => [
        ...old, { ...newBlock, id: 'optimistic', createdAt: new Date() }
      ]);
      return { previous };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['blocks', tripId], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks', tripId] });
    },
  });
}
```

### Estado de UI (Zustand)
```typescript
// stores/workspace.ts
interface WorkspaceStore {
  chatOpen: boolean;
  activeView: 'board' | 'timeline' | 'budget' | 'map' | 'documents';
  selectedBlockId: string | null;
  pendingActions: ProposedAction[]; // Propuestas IA pendientes de confirmar

  toggleChat: () => void;
  setView: (view: ActiveView) => void;
  addPendingAction: (action: ProposedAction) => void;
  acceptAction: (actionId: string) => void;
  rejectAction: (actionId: string) => void;
}
```

---

## 4. Componente ChatPanel (Streaming)

```typescript
// components/chat/ChatPanel.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { ActionPreviewCard } from './ActionPreviewCard';

export function ChatPanel({ tripId }: { tripId: string }) {
  const { messages, input, handleSubmit, handleInputChange, status } = useChat({
    api: '/api/ai/chat',
    body: { tripId },
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === 'propose_block') {
        // Agrega la propuesta a pendingActions en el store de Zustand
        addPendingAction(toolCall.args);
      }
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <p>{m.content}</p>
            {/* Renderizar ActionPreviewCards adjuntas al mensaje */}
            {m.toolInvocations?.map((t) =>
              t.toolName === 'propose_block' && t.state === 'result' ? (
                <ActionPreviewCard key={t.toolCallId} action={t.args} />
              ) : null
            )}
          </div>
        ))}
        {status === 'streaming' && <TypingIndicator />}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="¿Qué quieres planificar?"
          className="w-full..."
        />
      </form>
    </div>
  );
}
```

---

## 5. Reglas de Rendimiento Aplicadas

De la skill `vercel-react-best-practices`:

- **Server Components por defecto** — solo añadir `'use client'` cuando se necesite interactividad
- **Streaming con Suspense boundaries** en cada sección del workspace que cargue datos independientes
- **Lazy loading** para vistas pesadas (MapView carga Google Maps solo cuando se activa)
- **Memoización** en listas largas de bloques con `React.memo`
- **Optimistic updates** para todas las mutaciones de bloques
- **Dynamic imports** para el editor de markdown (Nota blocks)
- **Prefetch** de datos de trip al hover en el dashboard

---

## 6. Design System

**Colores del brand:**
- Primary: `#2563EB` (Azul viajero)
- Accent: `#F59E0B` (Ambar/aventura)
- Surface: `#F8FAFC` / `#0F172A` (light/dark)

**Tipografía:**
- Display: `Sora` (headings, trip titles)
- Body: `Inter` (UI text)
- Mono: `JetBrains Mono` (códigos de reserva, timestamps)

**Principio de diseño (de la skill `frontend-design`):**
Evitar la "estética genérica de IA". La UI debe sentirse como un producto de diseño profesional: uso audaz de espacio, jerarquía tipográfica clara, transiciones sutiles pero con carácter.
