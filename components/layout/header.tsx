import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b px-4">
      <MobileNav />
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
