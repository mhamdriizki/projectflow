import { Sidebar } from "@/components/layout/sidebar";
import { requireSession } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();

  return (
    <div className="flex min-h-screen">
      <Sidebar/>

      <div className="flex flex-1 flex-col">
        {/* <Header/> */}

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
