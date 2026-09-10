import type { Metadata } from "next";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireSession();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Signed in as {session.user.email}</p>
    </main>
  );
}
