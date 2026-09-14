"use client";

import { usePathname } from "next/navigation";
import { navLinks } from "./nav-llinks";
import Link from "next/link";
import { signOutAction } from "@/actions/auth";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="p-4 text-lg font-bold">ProjectFlow</div>
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
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Form */}
      <form action={signOutAction} className="p-2">
        <Button
          type="submit"
          variant="ghost"
          className="w-full justify-start gap-2"
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </form>
    </aside>
  );
}
