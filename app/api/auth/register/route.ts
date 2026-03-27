import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();

    await sql`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (${id}, ${email}, ${name}, ${passwordHash})
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
