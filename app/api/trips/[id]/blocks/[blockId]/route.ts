import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, blockId } = await params;

  const [trip] = await sql`
    SELECT id FROM trips WHERE id = ${id} AND user_id = ${session.user.id}
  `;
  if (!trip) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const { content } = await req.json();

  const [block] = await sql`
    UPDATE blocks
    SET content = ${JSON.stringify(content)}, updated_at = NOW()
    WHERE id = ${blockId} AND trip_id = ${id}
    RETURNING *
  `;

  return NextResponse.json({ block });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id, blockId } = await params;

  const [trip] = await sql`
    SELECT id FROM trips WHERE id = ${id} AND user_id = ${session.user.id}
  `;
  if (!trip) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await sql`DELETE FROM blocks WHERE id = ${blockId} AND trip_id = ${id}`;

  return NextResponse.json({ success: true });
}
