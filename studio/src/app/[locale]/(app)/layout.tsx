"use client";

import { useContext, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/auth-context";
import { auth } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Home,
  FileText,
  Briefcase,
  Users,
  Settings,
  LifeBuoy,
  Calculator,
  Send,
  Loader2,
  Wand2,
  PenSquare,
  BookOpen,
  Newspaper,
  FileCheck,
  Scale,
  TrendingUp,
  BadgeCheck,
  Sparkles,
  AlertTriangle,
  Shield,
  ClipboardList,
  Kanban,
  ChevronDown,
  HelpCircle,
  Image as ImageIcon,
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

function CloseMobileNavigationOnRouteChange({ pathname }: { pathname: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, pathname, setOpenMobile]);
  return null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, role } = useContext(AuthContext);
    const router = useRouter();
    const pathname = usePathname();
    const wasAuthenticated = useRef(false);
    const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reAuthAttempted = useRef(false);

    /**
     * When user becomes available, mark as authenticated.
     * When user is null after loading, attempt silent re-auth via Firebase
     * before redirecting to sign-in. This handles the case where the middleware
     * rejected a stale __session cookie but Firebase SDK still has the user.
     */
    useEffect(() => {
        if (user) {
            wasAuthenticated.current = true;
            reAuthAttempted.current = false;
            if (redirectTimer.current) {
                clearTimeout(redirectTimer.current);
                redirectTimer.current = null;
            }
            return;
        }

        if (!loading && !user) {
            if (wasAuthenticated.current && !reAuthAttempted.current) {
                // User was authenticated but context lost them — attempt silent re-auth
                reAuthAttempted.current = true;
                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    unsubscribe();
                    if (firebaseUser) {
                        // Firebase still has the user — force token refresh
                        try {
                            const token = await firebaseUser.getIdToken(true);
                            const res = await fetch('/api/auth/refresh-session', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ idToken: token }),
                            });
                            if (res.ok) {
                                // Cookie refreshed — reload to re-trigger middleware check
                                window.location.reload();
                                return;
                            }
                        } catch {
                            // Silent re-auth failed — fall through to redirect
                        }
                    }
                    // No Firebase user or refresh failed — redirect to sign-in
                    redirectTimer.current = setTimeout(() => {
                        router.push('/sign-in');
                    }, 500);
                });
                return () => { unsubscribe(); };
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
    const isAdmin = role === 'admin' || role === 'super_admin';
    const isStaff = role === 'sme_staff';
    const minTierForMessages = TIER_ORDER.indexOf('Growth');
    const showMessages = canViewMessages && userTierIndex >= minTierForMessages;

    const showAiTools = true;
    const canUsePraz = !isStaff;
    const canUseExport = !isStaff;
    const canUseInvestor = !isStaff;

    const menuItems = [
      { href: "/dashboard", label: "Today", icon: <Home />, domain: "Command", show: true },
      { href: "/dashboard/actions", label: "Action Centre", icon: <ClipboardList />, domain: "Command", show: true },
      { href: "/dashboard/checklist", label: "Onboarding", icon: <ClipboardList />, domain: "Command", show: true },
      { href: "/dashboard/projects", label: "Projects", icon: <Kanban />, domain: "Operations", show: true },
      { href: "/assessment", label: "Business Health", icon: <FileText />, domain: "Operations", show: true },
      { href: "/budget-calculator", label: "Budget", icon: <Calculator />, domain: "Operations", show: true },
      { href: "/news", label: "Business News", icon: <Newspaper />, domain: "Intelligence", show: true },
      { href: "/tenders", label: "Tenders", icon: <Briefcase />, domain: "Intelligence", show: true },
      { href: "/praz-compliance", label: "PRAZ Compliance", icon: <Scale />, domain: "Intelligence", show: canUsePraz },
      { href: "/community", label: "Community", icon: <Users />, domain: "Network", show: true },
      ...(showMessages ? [{ href: "/messages", label: "Messages", icon: <Send />, domain: "Network", show: true }] : []),
      { href: "/resources", label: "Resources", icon: <BookOpen />, domain: "Network", show: true },
      { href: "/export-assessment", label: "Export Readiness", icon: <FileCheck />, domain: "Intelligence", show: canUseExport },
      { href: "/investor-portal", label: "Investor Portal", icon: <TrendingUp />, domain: "Intelligence", show: canUseInvestor },
      ...(canViewBlog ? [{ href: "/dashboard/blog", label: "Publishing", icon: <PenSquare />, domain: "Administration", show: true }] : []),
      ...(isAdmin ? [
        { href: "/dashboard/faq", label: "FAQ", icon: <HelpCircle />, domain: "Administration", show: true },
        { href: "/dashboard/guides", label: "Guides", icon: <BookOpen />, domain: "Administration", show: true },
        { href: "/dashboard/seo-pages", label: "SEO Pages", icon: <FileText />, domain: "Administration", show: true },
        { href: "/dashboard/media", label: "Media", icon: <ImageIcon aria-hidden="true" />, domain: "Administration", show: true },
        { href: "/dashboard/admin", label: "Admin", icon: <Shield />, domain: "Administration", show: true },
      ] : []),
    ].filter(item => item.show);

  if (loading || !user) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <CloseMobileNavigationOnRouteChange pathname={pathname} />
      <Sidebar aria-label="Navigation menu" className="border-r border-border/60">
        <SidebarHeader className="border-b border-border/60 px-3 py-4 pr-14 md:pr-3">
          <div className="flex items-center gap-3 px-2">
            <Icons.radbit className="size-7 shrink-0" />
            <span><span className="block font-headline text-base font-semibold tracking-[0.08em]">RADBIT</span><span className="block text-[0.62rem] uppercase tracking-[0.17em] text-muted-foreground">Business system</span></span>
          </div>
        </SidebarHeader>
        <SidebarContent className="overscroll-contain py-3">
          {["Command", "Operations", "Intelligence", "Network", "Administration"].map(domain => {
            const items = menuItems.filter(item => item.domain === domain);
            if (!items.length) return null;
            return <SidebarGroup key={domain} className="py-1">
              <SidebarGroupLabel className="px-3 text-[0.62rem] uppercase tracking-[0.16em] text-muted-foreground/70">{domain}</SidebarGroupLabel>
              <SidebarGroupContent><SidebarMenu>
            {items.map((item) => (
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
              </SidebarMenu></SidebarGroupContent>
            </SidebarGroup>;
          })}
          <SidebarMenu className="px-2">
            {showAiTools && (
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={{ children: "AI Tools", side: "right" }}>
                      <Wand2 />
                      <span>AI Tools</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === "/toolkit"}>
                          <Link href="/toolkit">AI Toolkit</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      {!isStaff && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={pathname === "/bid-writer"}>
                            <Link href="/bid-writer">Bid Writer</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                      {!isStaff && (
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={pathname === "/tax-copilot"}>
                            <Link href="/tax-copilot">Tax Co-Pilot</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={pathname === "/mentor"}>
                          <Link href="/mentor">AI Mentor</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}
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
              <SidebarMenuButton asChild tooltip={{ children: "Support", side: "right" }}>
                <a href="mailto:hello@radbitstudios.co.zw">
                  <LifeBuoy />
                  <span>Support</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="frost-surface sticky top-0 z-40 w-full rounded-none border-x-0 border-t-0 shadow-none">
          <div className="container flex h-14 max-w-7xl min-w-0 items-center gap-1 px-2 sm:gap-2 sm:px-4">
            <SidebarTrigger className="mr-1 size-10 shrink-0 sm:mr-2" />
            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              {user && (
                <>
                  <Link
                    href="/settings?tab=account"
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2 text-xs font-medium transition-colors sm:px-3",
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
                    <span className="hidden min-[380px]:inline">{(user as AppUser).plan === 'Free' ? 'Upgrade' : (user as AppUser).plan}</span>
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
                        className="hidden items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/20 sm:inline-flex"
                      >
                        <AlertTriangle className="size-2.5" />
                        Only {lowest[1].remaining} {lowest[0].replace(/([A-Z])/g, ' $1').trim().toLowerCase()} {lowest[1].remaining === 1 ? 'credit' : 'credits'} left
                      </Link>
                    );
                  })()}
                </>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {user && <NotificationBell userId={user.uid} />}
              <PushNotificationManager />
              <UserNav />
            </div>
          </div>
        </header>
        <main 
            id="main-content"
            key={pathname}
            className="flex min-w-0 flex-1 flex-col overflow-x-clip px-3 pb-24 pt-4 sm:px-5 md:p-8 lg:p-10 md:pb-8 motion-safe:animate-[fadeSlideIn_0.3s_ease-out]"
        >
          <div className="container mx-auto flex min-h-0 w-full min-w-0 max-w-7xl flex-1 flex-col px-0">
            {children}
          </div>
        </main>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  );
}
