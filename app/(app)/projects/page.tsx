import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Projects</h1>
      <p className="text-muted-foreground">CRUD dibahas di Bab 5.</p>
    </main>
  );
}
