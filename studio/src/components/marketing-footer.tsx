"use client";

import Link from "next/link";
import { GyeNyame, Sankofa, Dwennimmen } from "@/components/adinkra-symbols";
import { ChevronPattern } from "@/components/chevron-pattern";

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-foreground/10 bg-background/60">
      <ChevronPattern variant="divider" direction="down" className="absolute -top-16 opacity-30" />
      <div className="container pt-20 pb-12">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="font-headline text-xl font-bold tracking-wide text-foreground">RADBIT</span>
            </Link>
            <p className="text-sm text-foreground/50 leading-relaxed">
              Digital sovereignty for Zimbabwean enterprises.
            </p>
            <div className="flex gap-3">
              <GyeNyame className="h-5 w-5 text-primary/40" />
              <Dwennimmen className="h-5 w-5 text-primary/40" />
              <Sankofa className="h-5 w-5 text-primary/40" />
            </div>
          </div>
          {[
            {
              title: "Platform",
              links: [
                { href: "/assessment", label: "Assessment" },
                { href: "/toolkit", label: "AI Toolkit" },
                { href: "/community", label: "Community" },
                { href: "/tenders", label: "Tenders" },
              ],
            },
            {
              title: "Company",
              links: [
                { href: "/pricing", label: "Pricing" },
                { href: "/about", label: "About" },
                { href: "/consultancy", label: "Consultancy" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
              ],
            },
            {
              title: "Resources",
              links: [
                { href: "/resources", label: "Guides & Tools" },
              ],
            },
          ].map(group => (
            <div key={group.title}>
              <h3 className="font-headline text-sm font-bold tracking-wider mb-5 text-foreground/80">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-foreground/50 hover:text-foreground/90 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-foreground/10 text-center text-sm text-foreground/40">
          <p>&copy; {new Date().getFullYear()} Radbit. All rights reserved.</p>
          <p className="mt-2 text-xs text-foreground/30">Your data is encrypted and stored in Southern Africa. We never share or sell your information.</p>
        </div>
      </div>
    </footer>
  );
}
