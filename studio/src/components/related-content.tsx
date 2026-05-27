"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface RelatedLink {
  title: string;
  href: string;
  description: string;
  type: "guide" | "tool" | "use-case" | "blog";
}

interface RelatedContentProps {
  currentPath: string;
  maxItems?: number;
}

const ALL_LINKS: RelatedLink[] = [
  { title: "Register a Business in Zimbabwe", href: "/resources/guides/register-business-zimbabwe", description: "Step-by-step PACRA registration, costs, and timelines.", type: "guide" },
  { title: "ZIMRA Tax Guide for SMEs", href: "/resources/guides/zimra-tax-guide-smes", description: "QPD, VAT, PAYE, and corporate tax explained.", type: "guide" },
  { title: "SADC Export Guide", href: "/resources/guides/sadc-export-guide", description: "Documentation, duties, and transport corridors for SADC exports.", type: "guide" },
  { title: "EcoCash Business vs Personal", href: "/resources/guides/ecocash-business-vs-personal", description: "Limits, fees, and when to upgrade your EcoCash wallet.", type: "guide" },
  { title: "Load-Shedding Solutions", href: "/resources/guides/load-shedding-solutions-smes", description: "Solar, inverters, generators — cost-benefit for SMEs.", type: "guide" },
  { title: "Business Planning in Zimbabwe", href: "/resources/guides/zim-business-planning", description: "Templates and local market insights for your business plan.", type: "guide" },
  { title: "VAT Calculator", href: "/resources/tools/vat-calculator", description: "Calculate VAT-inclusive and VAT-exclusive prices at 15%.", type: "tool" },
  { title: "Business Name Generator", href: "/resources/tools/business-name-generator", description: "Shona, English, and bilingual name suggestions.", type: "tool" },
  { title: "AI Tender Matching", href: "/use-cases/tender-matching", description: "Find government tenders automatically with AI.", type: "use-case" },
  { title: "Digital Readiness Assessment", href: "/use-cases/business-assessment", description: "Score your business digital maturity in 15 minutes.", type: "use-case" },
  { title: "PRAZ Compliance", href: "/use-cases/praz-compliance", description: "Track registrations, renewals, and compliance documents.", type: "use-case" },
  { title: "AI Business Tools", href: "/use-cases/ai-business-tools", description: "Business plan generator, bid writer, tax copilot.", type: "use-case" },
  { title: "Retail & E-commerce", href: "/solutions/retail-ecommerce", description: "POS, inventory, and WhatsApp ordering for retailers.", type: "use-case" },
  { title: "Construction & Contracting", href: "/solutions/construction", description: "Tender tracking and PRAZ compliance for builders.", type: "use-case" },
  { title: "Healthcare & Clinics", href: "/solutions/healthcare", description: "Patient records, pharmacy inventory, and billing.", type: "use-case" },
  { title: "Professional Services", href: "/solutions/professional-services", description: "Invoicing, client portal, and compliance calendar.", type: "use-case" },
];

const CONTENT_GRAPH: Record<string, string[]> = {
  "/resources/guides/register-business-zimbabwe": ["/resources/guides/zimra-tax-guide-smes", "/resources/guides/zim-business-planning", "/use-cases/praz-compliance", "/resources/tools/business-name-generator"],
  "/resources/guides/zimra-tax-guide-smes": ["/resources/guides/register-business-zimbabwe", "/resources/tools/vat-calculator", "/resources/guides/ecocash-business-vs-personal", "/use-cases/ai-business-tools"],
  "/resources/guides/sadc-export-guide": ["/resources/guides/register-business-zimbabwe", "/resources/guides/zimra-tax-guide-smes", "/solutions/logistics-pharmacies", "/use-cases/tender-matching"],
  "/resources/guides/ecocash-business-vs-personal": ["/resources/guides/zimra-tax-guide-smes", "/resources/tools/vat-calculator", "/solutions/retail-ecommerce", "/resources/guides/register-business-zimbabwe"],
  "/resources/guides/load-shedding-solutions-smes": ["/resources/guides/zim-business-planning", "/solutions/retail-ecommerce", "/solutions/healthcare", "/resources/guides/register-business-zimbabwe"],
  "/resources/guides/zim-business-planning": ["/resources/guides/register-business-zimbabwe", "/use-cases/business-assessment", "/resources/guides/zimra-tax-guide-smes", "/use-cases/ai-business-tools"],
  "/resources/tools/vat-calculator": ["/resources/guides/zimra-tax-guide-smes", "/resources/guides/ecocash-business-vs-personal", "/resources/guides/register-business-zimbabwe", "/use-cases/ai-business-tools"],
  "/resources/tools/business-name-generator": ["/resources/guides/register-business-zimbabwe", "/resources/guides/zim-business-planning", "/use-cases/business-assessment", "/resources/guides/zimra-tax-guide-smes"],
  "/use-cases/tender-matching": ["/use-cases/praz-compliance", "/solutions/construction", "/use-cases/ai-business-tools", "/resources/guides/register-business-zimbabwe"],
  "/use-cases/business-assessment": ["/use-cases/ai-business-tools", "/resources/guides/zim-business-planning", "/use-cases/tender-matching", "/resources/guides/register-business-zimbabwe"],
  "/use-cases/praz-compliance": ["/use-cases/tender-matching", "/resources/guides/register-business-zimbabwe", "/solutions/construction", "/use-cases/ai-business-tools"],
  "/use-cases/ai-business-tools": ["/use-cases/business-assessment", "/use-cases/tender-matching", "/resources/guides/zim-business-planning", "/resources/guides/register-business-zimbabwe"],
};

export function RelatedContent({ currentPath, maxItems = 4 }: RelatedContentProps) {
  const relatedPaths = CONTENT_GRAPH[currentPath] || [];
  const relatedLinks = relatedPaths
    .map((path) => ALL_LINKS.find((link) => link.href === path))
    .filter(Boolean) as RelatedLink[];

  const displayed = relatedLinks.slice(0, maxItems);
  if (displayed.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t border-border/50">
      <h2 className="font-headline text-xl font-bold mb-6">Related Resources</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {displayed.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-border/50 bg-card/50 p-4 hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-headline text-sm font-semibold mb-1 group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {link.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
