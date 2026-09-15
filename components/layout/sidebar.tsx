"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navLinks } from "@/components/layout/nav-links";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

type SidebarUser = { name: string; image: string | null };

export function Sidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 p-4">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name} className="size-8 rounded-full object-cover" />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-lg font-bold">ProjectFlow</span>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <form action={signOutAction} className="p-2">
        <Button type="submit" variant="ghost" className="w-full justify-start gap-2">
          <LogOut className="size-4" />
          Sign out
        </Button>
      </form>
    </aside>
  );
}
