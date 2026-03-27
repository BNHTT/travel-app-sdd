import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const [trip] = await sql`
    SELECT id FROM trips WHERE id = ${id} AND user_id = ${session.user.id}
  `;
  if (!trip) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const { type, content, position } = await req.json();

  const blockId = crypto.randomUUID();
  const [block] = await sql`
    INSERT INTO blocks (id, trip_id, type, content, position)
    VALUES (${blockId}, ${id}, ${type}, ${JSON.stringify(content)}, ${position})
    RETURNING *
  `;

  return NextResponse.json({ block }, { status: 201 });
}
