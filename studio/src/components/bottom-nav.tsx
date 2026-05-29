"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Briefcase, Wand2, Users, Handshake, PanelLeft } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const bottomNavItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: <Home className="size-5" /> },
  { href: "/tenders", label: "Tenders", icon: <Briefcase className="size-5" /> },
  { href: "/toolkit", label: "Toolkit", icon: <Wand2 className="size-5" /> },
  { href: "/investor-portal", label: "Invest", icon: <Handshake className="size-5" /> },
  { href: "/community", label: "Community", icon: <Users className="size-5" /> },
];

export function BottomNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-14 items-center justify-around px-2">
        {bottomNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full transition-colors",
              isActive(item.href)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon}
            <span className="text-[10px] font-medium leading-none">
              {item.label}
            </span>
          </Link>
        ))}
        <button
          onClick={toggleSidebar}
          className="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 h-full transition-colors text-muted-foreground hover:text-foreground"
        >
          <PanelLeft className="size-5 shrink-0" />
          <span className="text-[10px] font-medium leading-none">Menu</span>
        </button>
      </div>
    </nav>
  );
}
