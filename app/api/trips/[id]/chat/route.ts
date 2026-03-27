import { streamText, convertToModelMessages, UIMessage } from "ai";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("No autorizado", { status: 401 });
  }

  const { id } = await params;

  const [trip] = await sql`
    SELECT * FROM trips
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;

  if (!trip) {
    return new Response("Viaje no encontrado", { status: 404 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  // Persist the last user message
  const lastMessage = messages[messages.length - 1];
  if (lastMessage?.role === "user") {
    const textContent = lastMessage.parts
      ?.filter((p: { type: string }) => p.type === "text")
      .map((p: { type: string; text?: string }) => (p as { type: "text"; text: string }).text)
      .join("") || "";

    if (textContent) {
      await sql`
        INSERT INTO chat_messages (id, trip_id, role, content)
        VALUES (${crypto.randomUUID()}, ${id}, 'user', ${textContent})
      `;
    }
  }

  const systemPrompt = `Eres un asistente experto en planificación de viajes para la app Wandr.
El usuario está planificando el siguiente viaje:
- Destino: ${trip.destination}
- Título: ${trip.title}
- Fechas: ${trip.start_date ? new Date(trip.start_date).toLocaleDateString("es-ES") : "por definir"} - ${trip.end_date ? new Date(trip.end_date).toLocaleDateString("es-ES") : "por definir"}
- Estado: ${trip.status}

Tu rol es ayudar a:
1. Proponer actividades, alojamientos y transporte concretos y reales.
2. Detectar conflictos logísticos (horarios imposibles, lugares cerrados, tiempos de tránsito).
3. Optimizar el itinerario día a día.
4. Responder preguntas específicas sobre el destino (visa, clima, moneda, cultura).

Responde siempre en español, de forma concisa y práctica. Cuando propongas actividades, incluye horarios sugeridos, duraciones estimadas y consejos prácticos.`;

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    onFinish: async ({ text }) => {
      if (text) {
        await sql`
          INSERT INTO chat_messages (id, trip_id, role, content)
          VALUES (${crypto.randomUUID()}, ${id}, 'assistant', ${text})
        `;
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
