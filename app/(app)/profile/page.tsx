import type { Metadata } from "next";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await requireSession();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-muted-foreground">{session.user.name} — {session.user.email}</p>
    </main>
  );
}
