"use client";

import { useState, useEffect, useContext, useRef } from "react";
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
import { Menu } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { href: "/assessment", label: "Assessment" },
  { href: "/toolkit", label: "AI Toolkit" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
  { href: "/tenders", label: "Tenders" },
  { href: "/community", label: "Community" },
  { href: "/blog", label: "Blog" },
  { href: "/consultancy", label: "Consultancy" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef<number>(0);

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
      <header role="banner" className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "border-b border-border/50 bg-background/95 md:bg-background/80 md:backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-3 mr-8 group">
            <Icons.radbit className="size-8 shrink-0 transition-transform duration-300 group-hover:scale-110 text-foreground" />
            <span className="font-headline text-xl font-bold tracking-wide text-foreground">
              RADBIT
            </span>
          </Link>
            <nav aria-label="Main navigation" className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/assessment" className="text-muted-foreground hover:text-foreground transition-colors">
                Assessment
              </Link>
              <Link href="/toolkit" className="text-muted-foreground hover:text-foreground transition-colors">
                AI Toolkit
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                Resources
              </Link>
              <Link href="/tenders" className="text-muted-foreground hover:text-foreground transition-colors">
                Tenders
              </Link>
              <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
                Community
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/consultancy" className="text-muted-foreground hover:text-foreground transition-colors text-primary">
                Consultancy
              </Link>
            </nav>
          <div className="flex flex-1 items-center justify-end space-x-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[340px] pt-12">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex flex-col gap-2 mt-6">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center h-12 px-4 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="border-t border-border mt-4 pt-4 space-y-2">
                    {loading ? null : user ? (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/dashboard"
                            className="flex items-center h-12 px-4 rounded-md text-base font-medium text-foreground hover:bg-accent transition-colors"
                          >
                            Dashboard
                          </Link>
                        </SheetClose>
                        <div className="px-4">
                          <UserNav />
                        </div>
                      </>
                    ) : (
                      <>
                        <SheetClose asChild>
                          <Link
                            href="/sign-in"
                            className="flex items-center h-12 px-4 rounded-md text-base font-medium text-muted-foreground hover:bg-accent transition-colors"
                          >
                            Sign In
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link
                            href="/sign-up"
                            className="flex items-center justify-center h-12 mx-4 rounded-md text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
                          >
                            Get Started
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
                <Button variant="ghost" asChild className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <div className="hidden md:block">
                  <UserNav />
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden md:inline-flex text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <MagneticButton asChild className="hidden md:inline-flex bg-foreground text-background hover:bg-foreground/90">
                  <Link href="/sign-up">Get Started</Link>
                </MagneticButton>
              </>
            )}
          </div>
        </div>
      </header>
      <main id="main-content" role="main" className="relative flex-1">{children}</main>
    </div>
  );
}
