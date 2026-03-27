import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { Trip, ChatMessage } from "@/lib/db";
import TripWorkspace from "@/components/trip/TripWorkspace";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TripPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const [trip] = await sql<Trip[]>`
    SELECT * FROM trips
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;

  if (!trip) {
    notFound();
  }

  const chatHistory = await sql<ChatMessage[]>`
    SELECT * FROM chat_messages
    WHERE trip_id = ${id}
    ORDER BY created_at ASC
    LIMIT 50
  `;

  return <TripWorkspace trip={trip} initialChatHistory={chatHistory} />;
}
