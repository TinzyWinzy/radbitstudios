"use client";

import { useContext, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/auth-context";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard — Radbit",
  "/assessment": "Assessment — Radbit",
  "/toolkit": "AI Toolkit — Radbit",
  "/budget-calculator": "Budget Calculator — Radbit",
  "/tenders": "Tenders — Radbit",
  "/community": "Community — Radbit",
  "/messages": "Messages — Radbit",
  "/mentor": "AI Mentor — Radbit",
  "/settings": "Settings — Radbit",
};
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Home,
  FileText,
  Briefcase,
  Users,
  Settings,
  Bell,
  LifeBuoy,
  MessageCircle,
  Calculator,
  Send,
  Loader2,
  Wand2,
} from "lucide-react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { GyeNyame } from "@/components/adinkra-symbols";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { UserNav } from "@/components/user-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useContext(AuthContext);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/sign-in');
        }
    }, [user, loading, router]);

    useEffect(() => {
      const title = PAGE_TITLES[pathname];
      if (title) {
        document.title = title;
      }
    }, [pathname]);

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home /> },
    { href: "/assessment", label: "Assessment", icon: <FileText /> },
    { href: "/toolkit", label: "AI Toolkit", icon: <Wand2 /> },
    { href: "/budget-calculator", label: "Budget Calculator", icon: <Calculator /> },
    { href: "/tenders", label: "Tenders & News", icon: <Briefcase /> },
    { href: "/community", label: "Community", icon: <Users /> },
    { href: "/messages", label: "Messages", icon: <Send /> },
    { href: "/mentor", label: "AI Mentor", icon: <MessageCircle /> },
  ];

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2">
            <Icons.radbit className="size-7 shrink-0" />
            <span className="font-headline text-lg font-bold tracking-wide">RADBIT</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    tooltip={{ children: item.label, side: "right" }}
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="relative">
          <GyeNyame className="absolute bottom-2 right-2 h-8 w-8 text-primary/[0.04] pointer-events-none" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={{ children: "Settings", side: "right" }}
                isActive={pathname === '/settings'}
              >
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip={{ children: "Support", side: "right" }}>
                <LifeBuoy />
                <span>Support</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-7xl items-center">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1" />
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>
        <motion.main 
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 p-4 md:p-8"
        >
          <div className="container max-w-7xl">
            {children}
          </div>
        </motion.main>
      </SidebarInset>
    </SidebarProvider>
  );
}
