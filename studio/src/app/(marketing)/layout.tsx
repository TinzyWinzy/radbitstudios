
import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Radbit SME Hub - Empowering Zimbabwean Small Businesses",
  description:
    "A digital platform supporting Zimbabwean small businesses with AI tools, digital readiness assessments, and community engagement.",
  openGraph: {
    title: "Radbit SME Hub",
    description:
      "Empowering Zimbabwean small businesses with AI tools and community.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 border-border/50 backdrop-blur-lg">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <Icons.logo className="size-6 shrink-0" />
            <span className="font-semibold text-foreground">Radbit SME Hub</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
             <ThemeToggle />
              <Button variant="ghost" asChild>
                  <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
