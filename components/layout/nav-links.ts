import { LayoutDashboard, FolderKanban, ListTodo, UserRound } from "lucide-react";

export const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;
