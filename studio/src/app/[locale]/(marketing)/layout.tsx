"use client";

import { useState, useEffect, useContext, useRef } from "react";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/magnetic-button";
import { UserNav } from "@/components/user-nav";
import { AuthContext } from "@/contexts/auth-context";
import { RollingShapes } from "@/components/rolling-shapes";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Menu,
  LayoutDashboard,
  ClipboardCheck,
  Sparkles,
  CreditCard,
  BookOpen,
  Briefcase,
  Users,
  Newspaper,
  Handshake,
  ArrowRight,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/solutions", label: "Solutions", icon: Sparkles },
  { href: "/assessment", label: "Assessment", icon: ClipboardCheck },
  { href: "/toolkit", label: "AI Toolkit", icon: LayoutDashboard },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/resources", label: "Resources", icon: BookOpen },
  { href: "/tenders", label: "Tenders", icon: Briefcase },
  { href: "/community", label: "Community", icon: Users },
  { href: "/blog", label: "Blog", icon: Newspaper },
  { href: "/consultancy", label: "Consultancy", icon: Handshake },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef<number>(0);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  useEffect(() => {
    const handleScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 80);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <RollingShapes />
      <header
        role="banner"
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "border-b border-border/50 bg-background/95 md:bg-background/80 md:backdrop-blur-xl shadow-sm"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-3 mr-8 group">
            <Icons.radbit className="size-8 shrink-0 transition-transform duration-300 group-hover:scale-110 text-foreground" />
            <span className="font-headline text-xl font-bold tracking-wide text-foreground">
              RADBIT
            </span>
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-0.5 text-sm font-medium"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3.5 py-2 rounded-lg transition-all duration-200 tracking-tight",
                    active
                      ? "text-foreground font-semibold bg-accent/40"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] sm:w-[340px] pt-12 overflow-y-auto"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex flex-col gap-0.5 mt-2">
                  <div className="px-4 pb-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                      Pages
                    </p>
                  </div>
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={cn(
                            "flex items-center gap-3 h-11 px-4 rounded-md text-sm font-medium transition-all duration-200",
                            active
                              ? "text-foreground bg-accent/50 border-l-2 border-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/30 border-l-2 border-transparent"
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          {link.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                  <div className="border-t border-border mt-4 pt-4 space-y-1">
                    <div className="px-4 pb-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                        Account
                      </p>
                    </div>
                    {loading ? null : user ? (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 h-11 px-4 rounded-md text-sm font-medium text-foreground hover:bg-accent/30 transition-colors"
                          >
                            <LayoutDashboard className="size-4 shrink-0" />
                            Dashboard
                          </Link>
                        </SheetClose>
                        <div className="px-4 pt-1">
                          <UserNav />
                        </div>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/sign-in"
                            className="flex items-center gap-3 h-11 px-4 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent/30 transition-colors"
                          >
                            <LogIn className="size-4 shrink-0" />
                            Sign In
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/sign-up"
                            className="flex items-center justify-center gap-2 h-11 mx-4 rounded-md text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                          >
                            Get Started
                            <ArrowRight className="size-4" />
                          </Link>
                        </SheetClose>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            {loading ? null : user ? (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <div className="hidden md:block">
                  <UserNav />
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <MagneticButton
                  asChild
                  className="hidden md:inline-flex bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                >
                  <Link href="/sign-up">
                    Get Started
                    <ArrowRight className="size-4 ml-1.5" />
                  </Link>
                </MagneticButton>
              </>
            )}
          </div>
        </div>
      </header>
      <main id="main-content" role="main" className="relative flex-1">
        {children}
      </main>
    </div>
  );
}
