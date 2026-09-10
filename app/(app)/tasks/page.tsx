import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <p className="text-muted-foreground">CRUD dibahas di bab selanjutnya.</p>
    </main>
  );
}
