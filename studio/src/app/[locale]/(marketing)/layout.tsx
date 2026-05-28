"use client";

import { useState, useEffect, useContext } from "react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/magnetic-button";
import { UserNav } from "@/components/user-nav";
import { AuthContext } from "@/contexts/auth-context";
import { RollingShapes } from "@/components/rolling-shapes";
import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <RollingShapes />
      <header role="banner" className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? "border-b border-border/50 bg-background/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
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
            {loading ? null : user ? (
              <>
                <Button variant="ghost" asChild className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <UserNav />
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-sm text-muted-foreground hover:text-foreground hover:bg-accent">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <MagneticButton asChild className="bg-foreground text-background hover:bg-foreground/90">
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
