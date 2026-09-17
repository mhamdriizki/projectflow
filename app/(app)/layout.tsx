import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { requireSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen">
      {/* Update sidebar untuk tampilin si foto user */}
      <Sidebar
        user={{ name: session.user.name, image: session.user.image ?? null }}
      />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
