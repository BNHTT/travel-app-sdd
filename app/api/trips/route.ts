import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const trips = await sql`
    SELECT id, title, destination, start_date, end_date, status, cover_image, created_at
    FROM trips
    WHERE user_id = ${session.user.id}
    ORDER BY created_at DESC
  `;

  return NextResponse.json({ trips });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { title, destination, start_date, end_date } = await req.json();

  if (!title || !destination) {
    return NextResponse.json({ error: "Título y destino son requeridos." }, { status: 400 });
  }

  const id = crypto.randomUUID();

  const [trip] = await sql`
    INSERT INTO trips (id, user_id, title, destination, start_date, end_date, status)
    VALUES (
      ${id},
      ${session.user.id},
      ${title},
      ${destination},
      ${start_date || null},
      ${end_date || null},
      'planning'
    )
    RETURNING *
  `;

  return NextResponse.json({ trip }, { status: 201 });
}
