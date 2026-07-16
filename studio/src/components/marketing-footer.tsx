"use client";

import Link from "next/link";
import { GyeNyame, Sankofa, Dwennimmen } from "@/components/adinkra-symbols";
import { ChevronPattern } from "@/components/chevron-pattern";
import { MapPin, Mail, Linkedin, Phone } from "lucide-react";

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
              Systems architecture and AI integration for African businesses.
            </p>
            <div className="space-y-2 text-xs text-foreground/40">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary/60" />
                <span>Harare, Zimbabwe</span>
              </div>
              <a href="tel:+263781334474" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-3.5 w-3.5 text-primary/60" />
                +263 78 133 4474
              </a>
              <a href="mailto:hanzohanic@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-3.5 w-3.5 text-primary/60" />
                hanzohanic@gmail.com
              </a>
              <a href="https://www.linkedin.com/company/radbitstudios" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Linkedin className="h-3.5 w-3.5 text-primary/60" />
                /company/radbitstudios
              </a>
            </div>
            <div className="flex gap-3 pt-1">
              <GyeNyame className="h-5 w-5 text-primary/40" />
              <Dwennimmen className="h-5 w-5 text-primary/40" />
              <Sankofa className="h-5 w-5 text-primary/40" />
            </div>
          </div>
          {[
            {
              title: "Services",
              links: [
                { href: "/services", label: "Systems Architecture" },
                { href: "/services", label: "AI Integration" },
                { href: "/services", label: "SaaS Development" },
                { href: "/services", label: "Security Audits" },
              ],
            },
            {
              title: "Work",
              links: [
                { href: "/work", label: "Portfolio" },
                { href: "/pilot", label: "Radbit Ops Pilot" },
                { href: "/solutions", label: "Solutions" },
                { href: "/use-cases", label: "Use Cases" },
              ],
            },
            {
              title: "Company",
              links: [
                { href: "/about", label: "About" },
                { href: "/founders", label: "Founders" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
              ],
            },
            {
              title: "Resources",
              links: [
                { href: "/resources", label: "Guides & Tools" },
                { href: "/pricing", label: "Pricing" },
                { href: "/guides/zimra-tax-calendar-2026", label: "Tax Calendar 2026" },
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
          <p>&copy; {new Date().getFullYear()} Radbit Studios. All rights reserved.</p>
          <p className="mt-2 text-xs text-foreground/30">Your data is encrypted and stored securely. We never share or sell your information.</p>
        </div>
      </div>
    </footer>
  );
}
