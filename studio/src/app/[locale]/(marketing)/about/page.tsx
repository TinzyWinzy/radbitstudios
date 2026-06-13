import type { Metadata } from 'next';
import { Shield, Zap, Swords, Target, Network, MapPin, Linkedin, Mail, Github, Twitter, Facebook, Phone, ScrollText, Eye, GanttChartSquare } from 'lucide-react';
import { AdBanner } from "@/components/ads/ad-banner";

export const metadata: Metadata = {
  title: 'About — Radbit',
  description: 'We build operational systems for SADC businesses — compliance automation, tender intelligence, and verified records that unlock growth.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Radbit',
    description: 'We build operational systems for SADC businesses — compliance automation, tender intelligence, and verified records.',
    type: 'website',
  },
};

export const revalidate = 3600;

const pillars = [
  {
    icon: <Swords className="h-4 w-4" />,
    title: 'Tender Intelligence',
    body: 'Automated compliance checks that catch what a procurement officer would flag — before you submit. No more losing bids on technicalities you could have fixed.',
  },
  {
    icon: <Network className="h-4 w-4" />,
    title: 'The Executive Multiplier',
    body: 'Your business rules run automatically across inventory, invoices, and daily operations. You only hear about it when something doesn\'t match. You delegate without losing sleep.',
  },
  {
    icon: <ScrollText className="h-4 w-4" />,
    title: 'The Global Partner Passport',
    body: 'Your transaction records become verified, tamper-proof histories on blockchain. The credibility international partners and diaspora investors need before they write a cheque.',
  },
];

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-24 space-y-16 max-w-5xl">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-2">
          <Shield className="h-3 w-3" />
          We Build Systems — Not Just Websites
        </div>
        <h1 className="font-headline text-fluid-4xl font-bold tracking-tighter">
          Radbit Is Not a
          <br />
          <span className="text-foreground/80">Software Studio.</span>
          <br />
          <span className="text-gradient">It Is Operational Infrastructure.</span>
        </h1>
        <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed">
          We don't rent out developers by the hour. We build systems that handle the chaos of running a business in Zimbabwe — so you can delegate operations without losing control.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Why Radbit Exists</h2>
        <div className="space-y-4 text-foreground/60 leading-relaxed text-[15px] max-w-3xl">
          <p>
            Running a business in Zimbabwe means dealing with things off-the-shelf software wasn't built for. The dollar changes value twice a week. New compliance rules keep showing up — PRAZ, ZIMRA, NSSA, the Labour Act — and they all demand different things. The internet is unreliable. And trusting someone else with critical operations feels like a risk most days.
          </p>
          <p>
            The usual answer is "buy better software." That's wrong. The problem isn't the tools. It's that no single system was designed for this reality — currency instability, expanding regulation, and the constant fear that one mistake costs you a tender or an audit.
          </p>
          <p>
            Radbit was built for that reality. It handles the compliance checks, the tender filings, the operational handoffs — so you don't have to personally verify every single thing. You set the rules. The system runs them.
          </p>
        </div>
      </section>

      <AdBanner slot="content-banner" />

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Three Pillars of Leverage</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-6 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary mb-4">
                {item.icon}
              </div>
              <h3 className="font-headline font-bold text-foreground mb-2 text-sm">{item.title}</h3>
              <p className="text-sm text-foreground/50 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 py-10 px-6 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/[0.03] via-transparent to-secondary/[0.03]">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: <Zap className="h-4 w-4" />,
              title: 'Everything Lives in One Place',
              body: 'Your business data, compliance status, and system settings all live in a single real-time database. No spreadsheets. No sync issues. No guessing which version of a document is current.',
            },
            {
              icon: <Eye className="h-4 w-4" />,
              title: 'Smart Recommendations',
              body: 'The system uses Google Vertex AI to analyze your specific situation — your industry, your compliance burden, your operational gaps. Every suggestion comes with a clear explanation of why it matters.',
            },
            {
              icon: <GanttChartSquare className="h-4 w-4" />,
              title: 'Modular by Design',
              body: 'Each feature works independently. You only use what you need. Add more later without rebuilding anything. No unused features cluttering your dashboard.',
            },
            {
              icon: <Target className="h-4 w-4" />,
              title: 'Built to Last',
              body: 'The system is designed so that adding new features or swapping out old ones doesn\'t break everything else. You grow without accumulating technical debt.',
            },
          ].map((item) => (
            <div key={item.title} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {item.icon}
                </div>
                <h3 className="font-headline font-bold text-foreground text-sm">{item.title}</h3>
              </div>
              <p className="text-sm text-foreground/50 leading-relaxed pl-9">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Who This Is For</h2>
        <p className="text-foreground/60 leading-relaxed text-[15px] max-w-3xl">
          Manufacturing owners in Bulawayo who need to delegate inventory without waking up to losses. Logistics operators in Harare who keep losing tenders on small compliance mistakes. Agri-tech cooperatives in Mashonaland whose paper records don't qualify for diaspora investment. Professional services firms dealing with more regulations than they have staff.
        </p>
        <p className="text-foreground/60 leading-relaxed text-[15px] max-w-3xl">
          If you run a business in the SADC region and you're stuck between wanting to grow and not being able to trust anyone else with the critical stuff — Radbit was built for you.
        </p>
      </section>

      <section className="space-y-6 pt-8 border-t border-foreground/10">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Founded By</h2>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 text-2xl font-bold text-white">
            TD
          </div>
          <div className="space-y-3">
            <div>
              <h3 className="font-headline font-bold text-foreground text-lg">Tinotenda Brandon Duma</h3>
              <p className="text-sm text-foreground/50">Founder &amp; Chief Executive Officer — Radbit Inc.</p>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Tinotenda is a Zimbabwean software engineer who noticed something: African businesses don't lack talent or ambition. They lack the institutional records and systems that global competitors take for granted.
            </p>
            <p className="text-sm text-foreground/60 leading-relaxed">
              He started Radbit because he was tired of seeing capable local enterprises lose tenders, miss opportunities, and stay invisible to capital — not because they weren't good enough, but because they didn't have the systems to prove it. The platform does the paperwork, the compliance, and the record-keeping so the founder can focus on actually building.
            </p>
            <div className="flex gap-4 pt-1">
              <a
                href="https://www.linkedin.com/in/tinotenda-duma-735a9797/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-primary transition-colors"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
              <a
                href="https://github.com/TinzyWinzy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-primary transition-colors"
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 pt-8 border-t border-foreground/10">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Contact &amp; Presence</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 text-sm text-foreground/60">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>9 Salcombe, Chadcomber<br />Harare, Zimbabwe</span>
          </div>
          <a href="tel:+263781334474" className="flex items-start gap-3 text-sm text-foreground/60 hover:text-primary transition-colors">
            <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>+263 78 133 4474</span>
          </a>
          <a href="mailto:hanzohanic@gmail.com" className="flex items-start gap-3 text-sm text-foreground/60 hover:text-primary transition-colors">
            <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>hanzohanic@gmail.com</span>
          </a>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground/60">
          <a href="https://x.com/RadbitStudios" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Twitter className="h-4 w-4 text-primary shrink-0" />
            @RadbitStudios
          </a>
          <a href="https://facebook.com/RadbitStudioGlobal" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Facebook className="h-4 w-4 text-primary shrink-0" />
            Radbit Studio Global
          </a>
          <a href="https://www.linkedin.com/company/radbitstudios" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
            <Linkedin className="h-4 w-4 text-primary shrink-0" />
            linkedin.com/company/radbitstudios
          </a>
        </div>
      </section>
    </div>
  );
}
