"use client";

import { useContext, useEffect, useRef } from "react";
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
  BadgeCheck,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { GyeNyame } from "@/components/adinkra-symbols";
import { NotificationBell } from "@/components/notification-bell";
import { PushNotificationManager } from "@/components/push-notification-manager";
import type { AppUser } from "@/types/user";
import { UserNav } from "@/components/user-nav";
import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, role } = useContext(AuthContext);
    const router = useRouter();
    const pathname = usePathname();
    const wasAuthenticated = useRef(false);
    const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (user) {
            wasAuthenticated.current = true;
            if (redirectTimer.current) {
                clearTimeout(redirectTimer.current);
                redirectTimer.current = null;
            }
            return;
        }

        if (!loading && !user) {
            if (wasAuthenticated.current) {
                redirectTimer.current = setTimeout(() => {
                    router.push('/sign-in');
                }, 1500);
            } else if (!wasAuthenticated.current) {
                redirectTimer.current = setTimeout(() => {
                    router.push('/sign-in');
                }, 500);
            }
        }

        return () => {
            if (redirectTimer.current) {
                clearTimeout(redirectTimer.current);
            }
        };
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
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar aria-label="Navigation menu">
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
        <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 md:bg-background/80 md:backdrop-blur-xl md:supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 max-w-7xl items-center">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1 flex items-center gap-2">
              {user && (
                <>
                  <Link
                    href="/settings?tab=account"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                      (user as AppUser).plan === 'Free'
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/60"
                        : (user as AppUser).plan === 'Growth'
                        ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/60"
                        : (user as AppUser).plan === 'Tender Starter'
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/60"
                        : (user as AppUser).plan === 'Pro'
                        ? "border-purple-500/40 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/60"
                        : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/60"
                    )}
                  >
                    {(user as AppUser).plan === 'Free' ? (
                      <Sparkles className="size-3" />
                    ) : (
                      <BadgeCheck className="size-3" />
                    )}
                    {(user as AppUser).plan === 'Free' ? 'Upgrade' : (user as AppUser).plan}
                  </Link>
                  {(user as AppUser).plan === 'Free' && (() => {
                    const usage = (user as AppUser).usage || {};
                    const lowFeatures = Object.entries(usage)
                      .filter(([, v]: [string, any]) => v?.remaining <= 2 && v?.remaining > 0)
                      .sort(([, a]: [string, any], [, b]: [string, any]) => a.remaining - b.remaining);
                    if (lowFeatures.length === 0) return null;
                    const lowest = lowFeatures[0];
                    return (
                      <Link
                        href="/settings?tab=account"
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <AlertTriangle className="size-2.5" />
                        Only {lowest[1].remaining} {lowest[0].replace(/([A-Z])/g, ' $1').trim().toLowerCase()} {lowest[1].remaining === 1 ? 'credit' : 'credits'} left
                      </Link>
                    );
                  })()}
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {user && <NotificationBell userId={user.uid} />}
              <PushNotificationManager />
              <UserNav />
            </div>
          </div>
        </header>
        <main 
            id="main-content"
            key={pathname}
            className="flex-1 p-4 md:p-8 pb-20 md:pb-8 animate-[fadeSlideIn_0.3s_ease-out]"
        >
          <div className="container max-w-7xl">
            {children}
          </div>
        </main>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
