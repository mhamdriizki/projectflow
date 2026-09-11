import { requireSession } from "@/lib/session";
import { Metadata } from "next";

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const session = await requireSession();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-muted-foreground">{session?.user?.name} - {session?.user?.email}</p>
    </main>
  )
}