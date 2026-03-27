import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import type { Trip } from "@/lib/db";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  const trips = await sql<Trip[]>`
    SELECT id, title, destination, start_date, end_date, status, cover_image, created_at
    FROM trips
    WHERE user_id = ${session!.user!.id}
    ORDER BY created_at DESC
  `;

  return <DashboardClient initialTrips={trips} userName={session!.user!.name ?? "Viajero"} />;
}
