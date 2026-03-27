import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const sql = neon(process.env.DATABASE_URL);

export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Trip = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  destination: string;
  start_date: Date | null;
  end_date: Date | null;
  cover_image: string | null;
  status: "planning" | "confirmed" | "in_progress" | "completed" | "cancelled";
  created_at: Date;
  updated_at: Date;
};

export type Block = {
  id: string;
  trip_id: string;
  type: "text" | "heading" | "checklist" | "place" | "transport" | "accommodation" | "note";
  content: Record<string, unknown>;
  position: number;
  parent_id: string | null;
  created_at: Date;
  updated_at: Date;
};

export type ChatMessage = {
  id: string;
  trip_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: Date;
};
