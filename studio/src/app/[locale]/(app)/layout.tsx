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
  "/news": "Business News — Radbit",
  "/community": "Community — Radbit",
  "/messages": "Messages — Radbit",
  "/mentor": "AI Mentor — Radbit",
  "/settings": "Settings — Radbit",
  "/notifications": "Notifications — Radbit",
  "/export-assessment": "Export Assessment — Radbit",
  "/praz-compliance": "PRAZ Compliance — Radbit",
  "/tax-copilot": "Tax Co-Pilot — Radbit",
  "/bid-writer": "Bid Writer — Radbit",
  "/investor-portal": "Investor Portal — Radbit",
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
  LifeBuoy,
  MessageCircle,
  Calculator,
  Send,
  Loader2,
  Wand2,
  PenSquare,
  BookOpen,
  Newspaper,
  FileCheck,
  Scale,
  Bot,
  FileSignature,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { GyeNyame } from "@/components/adinkra-symbols";
import { NotificationBell } from "@/components/notification-bell";
import { PushNotificationManager } from "@/components/push-notification-manager";
import type { AppUser } from "@/types/user";
import { motion } from 'framer-motion';
import { UserNav } from "@/components/user-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, role } = useContext(AuthContext);
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

    const userPlan = (user as AppUser)?.plan || 'Free';
    const TIER_ORDER = ['Free', 'Growth', 'Pro', 'Enterprise'] as const;
    const userTierIndex = TIER_ORDER.indexOf(userPlan as any);

    const canViewMessages = role !== 'sme_staff';
    const canViewBlog = role === 'admin' || role === 'super_admin';
    const minTierForMessages = TIER_ORDER.indexOf('Growth');
    const showMessages = canViewMessages && userTierIndex >= minTierForMessages;

    const menuItems = [
      { href: "/dashboard", label: "Dashboard", icon: <Home /> },
      { href: "/assessment", label: "Assessment", icon: <FileText /> },
      { href: "/toolkit", label: "AI Toolkit", icon: <Wand2 /> },
      { href: "/bid-writer", label: "Bid Writer", icon: <FileSignature /> },
      { href: "/tax-copilot", label: "Tax Co-Pilot", icon: <Bot /> },
      { href: "/budget-calculator", label: "Budget Calculator", icon: <Calculator /> },
      { href: "/news", label: "Business News", icon: <Newspaper /> },
      { href: "/tenders", label: "Tenders", icon: <Briefcase /> },
      { href: "/praz-compliance", label: "PRAZ Compliance", icon: <Scale /> },
      { href: "/community", label: "Community", icon: <Users /> },
      ...(showMessages ? [{ href: "/messages", label: "Messages", icon: <Send /> }] : []),
      { href: "/mentor", label: "AI Mentor", icon: <MessageCircle /> },
      { href: "/resources", label: "Resources", icon: <BookOpen /> },
      { href: "/export-assessment", label: "Export Assessment", icon: <FileCheck /> },
      { href: "/investor-portal", label: "Investor Portal", icon: <TrendingUp /> },
      ...(canViewBlog ? [{ href: "/dashboard/blog", label: "Blog", icon: <PenSquare /> }] : []),
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
              {user && <NotificationBell userId={user.uid} />}
              <PushNotificationManager />
              <UserNav />
            </div>
          </div>
        </header>
        <motion.main 
            id="main-content"
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
