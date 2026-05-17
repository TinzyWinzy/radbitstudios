import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found — Radbit SME Hub",
  description:
    "The page you are looking for does not exist or has been moved. Start a free digital readiness assessment or explore our resources.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <Icons.logo className="size-16 shrink-0 opacity-60" />

        <div className="space-y-2">
          <h1 className="font-headline text-6xl font-bold tracking-tighter">
            404
          </h1>
          <h2 className="font-headline text-2xl font-bold">Page not found</h2>
          <p className="text-muted-foreground leading-relaxed">
            This URL doesn&apos;t exist or has been moved. Try one of the
            popular sections below.
          </p>
        </div>

        <nav className="flex flex-wrap gap-3 justify-center">
          {[
            { href: '/assessment',       label: 'Free Assessment' },
            { href: '/ai-toolkit',       label: 'AI Toolkit' },
            { href: '/resources',        label: 'Resources' },
            { href: '/blog',             label: 'Blog' },
            { href: '/tenders',          label: 'Tenders' },
            { href: '/community',        label: 'Community' },
          ].map(link => (
            <Button key={link.href} asChild variant="outline" size="sm">
              <Link href={link.href}>{link.label}</Link>
            </Button>
          ))}
        </nav>

        <Button asChild variant="ghost">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
