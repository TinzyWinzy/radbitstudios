import Link from "next/link";
import { BookOpen, Calculator, ArrowRight, Wrench, HelpCircle, Sparkles, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const guides = [
  {
    slug: "zimra-tax-guide-smes",
    title: "Tax in Zimbabwe for SMEs",
    excerpt: "Everything you need to know about ZIMRA — taxes, filing deadlines, and common pitfalls every Zimbabwean SME owner should know.",
    icon: <FileText className="h-5 w-5 text-primary" />,
    readTime: "15 min read",
  },
  {
    slug: "ecocash-business-vs-personal",
    title: "EcoCash Business vs Personal",
    excerpt: "What the EcoCash Business upgrade actually changes — transaction limits, fees, compliance, and whether it's worth it for your SME.",
    icon: <FileText className="h-5 w-5 text-primary" />,
    readTime: "10 min read",
  },
  {
    slug: "sadc-export-guide",
    title: "Exporting from Zimbabwe to SADC",
    excerpt: "A practical walkthrough of exporting goods from Zimbabwe to SADC countries — documentation, duties, transport corridors, and common mistakes.",
    icon: <FileText className="h-5 w-5 text-primary" />,
    readTime: "20 min read",
  },
  {
    slug: "zim-business-planning",
    title: "Business Planning in Zimbabwe",
    excerpt: "How to build a business plan that works in Zimbabwe's unique economy — practical templates and local market insights.",
    icon: <FileText className="h-5 w-5 text-primary" />,
    readTime: "12 min read",
  },
];

const tools = [
  {
    slug: "vat-calculator",
    title: "VAT Calculator Zimbabwe",
    excerpt: "Calculate VAT-inclusive and VAT-exclusive prices for any transaction using the current ZIMRA 15% rate.",
    icon: <Calculator className="h-5 w-5 text-secondary" />,
  },
  {
    slug: "business-name-generator",
    title: "Business Name Generator",
    excerpt: "Get Shona, English, and bilingual business name suggestions tailored to your industry and values.",
    icon: <Wrench className="h-5 w-5 text-secondary" />,
  },
];

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground mt-2">
          Guides, tools, and answers designed for the realities of running a business in Zimbabwe.
        </p>
      </div>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="font-headline text-xl font-bold">Pillar Guides</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/resources/guides/${guide.slug}`}
              className="group rounded-xl border border-border/50 bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {guide.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-base font-semibold mb-1 group-hover:text-primary transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {guide.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      Read guide <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="h-5 w-5 text-primary" />
          <h2 className="font-headline text-xl font-bold">Free Tools</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/resources/tools/${tool.slug}`}
              className="group rounded-xl border border-dashed border-border/50 bg-card/30 p-6 hover:border-primary/40 hover:bg-card/60 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 size-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-base font-semibold mb-1 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{tool.excerpt}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <HelpCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="font-headline text-lg font-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Got questions? Our FAQ covers the most common questions about registering, taxes, payments,
                and using Radbit.
              </p>
              <Link
                href="/resources/faq"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                View all questions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-8 border-t border-border/50">
        <p className="text-sm text-muted-foreground mb-4">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <Link
          href="/mentor"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          <Sparkles className="h-4 w-4" />
          Ask the AI Mentor
        </Link>
      </div>
    </div>
  );
}