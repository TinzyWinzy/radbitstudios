import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/magnetic-button";
import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="fixed top-0 z-50 w-full border-b border-primary/10 bg-background/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-3 mr-8 group">
            <Icons.radbit className="size-8 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className="font-headline text-xl font-bold tracking-wide text-foreground">
              RADBIT
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/assessment" className="text-muted-foreground hover:text-foreground transition-colors">
              Assessment
            </Link>
            <Link href="/toolkit" className="text-muted-foreground hover:text-foreground transition-colors">
              AI Toolkit
            </Link>
            <Link href="/community" className="text-muted-foreground hover:text-foreground transition-colors">
              Community
            </Link>
            <Link href="/tenders" className="text-muted-foreground hover:text-foreground transition-colors">
              Tenders
            </Link>
          </nav>
          <div className="flex flex-1 items-center justify-end space-x-3">
            <ThemeToggle />
            <Button variant="ghost" asChild className="text-sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <MagneticButton asChild>
              <Link href="/sign-up">Get Started</Link>
            </MagneticButton>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}
