"use client";

import Link from "next/link";
import { GyeNyame, Sankofa, Dwennimmen } from "@/components/adinkra-symbols";
import { ChevronPattern } from "@/components/chevron-pattern";
import { MapPin, Mail, Linkedin, Twitter, Facebook, Phone } from "lucide-react";

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
            <div className="space-y-2 text-xs text-foreground/40">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary/60" />
                <span>9 Salcombe, Chadcomber, Harare</span>
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
              <a href="https://x.com/RadbitStudios" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Twitter className="h-3.5 w-3.5 text-primary/60" />
                @RadbitStudios
              </a>
              <a href="https://facebook.com/RadbitStudioGlobal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Facebook className="h-3.5 w-3.5 text-primary/60" />
                Radbit Studio Global
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
              title: "Platform",
              links: [
                { href: "/assessment", label: "Stress-Tester" },
                { href: "/threats", label: "Threat Assessments" },
                { href: "/solutions", label: "Solutions" },
                { href: "/use-cases", label: "Use Cases" },
              ],
            },
            {
              title: "Compliance",
              links: [
                { href: "/zimra-fiscal-device-registration", label: "Register Fiscal Device" },
                { href: "/compliant-receipts", label: "Compliant Receipts" },
                { href: "/penalty-protection", label: "Penalty Protection" },
                { href: "/vat-threshold-alerts", label: "VAT Threshold Alerts" },
                { href: "/offline-mode", label: "Offline Mode" },
              ],
            },
            {
              title: "Company",
              links: [
                { href: "/pricing", label: "Pricing" },
                { href: "/about", label: "About" },
                { href: "/founders", label: "Founders" },
                { href: "/consultancy", label: "Consultancy" },
                { href: "/partners", label: "Partners" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
              ],
            },
            {
              title: "Resources",
              links: [
                { href: "/resources", label: "Guides & Tools" },
                { href: "/blog", label: "Blog" },
                { href: "/tender-compliance-bridge", label: "Tender Bridge" },
                { href: "/diaspora", label: "Diaspora" },
                { href: "/contact", label: "Contact" },
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
