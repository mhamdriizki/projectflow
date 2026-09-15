import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { AvatarUpload } from "@/components/uploads/avatar-upload";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await requireSession();
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <AvatarUpload initialUrl={session.user.image ?? null} name={session.user.name} />
      <p className="text-muted-foreground">{session.user.name} — {session.user.email}</p>
    </main>
  );
}
