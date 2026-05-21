"use client";

import { useState, useEffect, useContext } from "react";
import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/magnetic-button";
import { UserNav } from "@/components/user-nav";
import { AuthContext } from "@/contexts/auth-context";
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
    <div className="flex min-h-screen flex-col bg-black text-white dark:text-white">
      <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? "border-b border-white/5 bg-black/80 backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-3 mr-8 group">
            <Icons.radbit className="size-8 shrink-0 transition-transform duration-300 group-hover:scale-110 text-white" />
            <span className="font-headline text-xl font-bold tracking-wide text-white">
              RADBIT
            </span>
          </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/assessment" className="text-white/50 hover:text-white transition-colors">
                Assessment
              </Link>
              <Link href="/toolkit" className="text-white/50 hover:text-white transition-colors">
                AI Toolkit
              </Link>
              <Link href="/resources" className="text-white/50 hover:text-white transition-colors">
                Resources
              </Link>
              <Link href="/tenders" className="text-white/50 hover:text-white transition-colors">
                Tenders
              </Link>
              <Link href="/community" className="text-white/50 hover:text-white transition-colors">
                Community
              </Link>
              <Link href="/blog" className="text-white/50 hover:text-white transition-colors">
                Blog
              </Link>
            </nav>
          <div className="flex flex-1 items-center justify-end space-x-3">
            <ThemeToggle />
            {loading ? null : user ? (
              <>
                <Button variant="ghost" asChild className="text-sm text-white/60 hover:text-white hover:bg-white/5">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <UserNav />
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-sm text-white/60 hover:text-white hover:bg-white/5">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <MagneticButton asChild className="bg-white text-black hover:bg-white/90">
                  <Link href="/sign-up">Get Started</Link>
                </MagneticButton>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="relative flex-1">{children}</main>
    </div>
  );
}
