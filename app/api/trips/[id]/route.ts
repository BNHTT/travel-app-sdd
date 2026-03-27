import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const [trip] = await sql`
    SELECT * FROM trips
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;

  if (!trip) {
    return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
  }

  const blocks = await sql`
    SELECT * FROM blocks
    WHERE trip_id = ${id}
    ORDER BY position ASC
  `;

  return NextResponse.json({ trip, blocks });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const updates = await req.json();

  const [trip] = await sql`
    UPDATE trips
    SET
      title = COALESCE(${updates.title ?? null}, title),
      destination = COALESCE(${updates.destination ?? null}, destination),
      start_date = COALESCE(${updates.start_date ?? null}, start_date),
      end_date = COALESCE(${updates.end_date ?? null}, end_date),
      status = COALESCE(${updates.status ?? null}, status),
      updated_at = NOW()
    WHERE id = ${id} AND user_id = ${session.user.id}
    RETURNING *
  `;

  if (!trip) {
    return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ trip });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  await sql`
    DELETE FROM trips
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;

  return NextResponse.json({ success: true });
}
