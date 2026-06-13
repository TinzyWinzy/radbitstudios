import type { Metadata } from 'next';
import { Shield, Zap, Swords, Target, Network, MapPin, Linkedin, Mail, Github, Twitter, Facebook, Phone, ScrollText, Eye, GanttChartSquare } from 'lucide-react';
import { AdBanner } from "@/components/ads/ad-banner";

export const metadata: Metadata = {
  title: 'About — Radbit',
  description: 'Applied intelligence firm arming SADC enterprises with structural armor: tender intelligence, executive multipliers, and global partner passports.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Radbit',
    description: 'Applied intelligence firm arming SADC enterprises with structural armor.',
    type: 'website',
  },
};

export const revalidate = 3600;

const pillars = [
  {
    icon: <Swords className="h-4 w-4" />,
    title: 'Tender Intelligence (The Compliance Shield)',
    body: 'An automated pre-flight abort engine that simulates the procurement officer\'s disqualification process, flags structural gaps, maps award histories, and seals your bid before evaluation.',
  },
  {
    icon: <Network className="h-4 w-4" />,
    title: 'The Executive Multiplier',
    body: 'Autonomous digital shadows that enforce the founder\'s exact business rules across inventory, invoices, and logistics. Exception-only alerts mean you delegate without losing micro-tactical control.',
  },
  {
    icon: <ScrollText className="h-4 w-4" />,
    title: 'The Global Partner Passport',
    body: 'Immutable, bank-grade transaction histories on blockchain. The institutional credibility that unlocks cross-border AfCFTA trade, diaspora investment, and international supply chains.',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-24 space-y-16">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-2">
          <Shield className="h-3 w-3" />
          Applied Intelligence — Not an Agency
        </div>
        <h1 className="font-headline text-fluid-4xl font-bold tracking-tighter">
          Radbit Is Not a
          <br />
          <span className="text-foreground/80">Software Studio.</span>
          <br />
          <span className="text-gradient">It Is Structural Armor.</span>
        </h1>
        <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed">
          We do not rent developer hours. We deploy intelligence pipelines that absorb market chaos — so SADC founders can delegate operations without forfeiting control.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">The Epistemology</h2>
        <div className="space-y-4 text-foreground/60 leading-relaxed text-[15px] max-w-3xl">
          <p>
            Zimbabwean enterprises operate under conditions that break conventional software. Currency regimes that rewrite margins twice a week. A regulatory surface area — PRAZ, ZIMRA, NSSA, RBZ, Labour Act — that expands faster than any compliance team can track. Infrastructure that punishes always-on architecture. And a low-trust environment where delegation feels like a liability, not leverage.
          </p>
          <p>
            The market assumption that &quot;better tools&quot; solve these problems is wrong. The problem is not a tool deficit. It is a <span className="text-foreground/80 font-medium">trust, compliance, and delegation architecture</span> problem.
          </p>
          <p>
            Radbit was built to absorb that complexity. Our platform replaces the need for the founder to personally verify every compliance filing, every tender submission, every operational handoff. The machine runs the protocols. The human directs tactical intent.
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
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">The Technical Foundation</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: <Zap className="h-4 w-4" />,
              title: 'Firestore-Centric Architecture',
              body: 'Every holon — hero, diagnostic, leverage menu — is a self-contained entity with localized state and execution rules. System state, diagnostic data, and CMS content live in Cloud Firestore for real-time, low-latency synchronization. No relational overhead. No disconnected backend.',
            },
            {
              icon: <Eye className="h-4 w-4" />,
              title: 'Vertex AI + RAG Pipelines',
              body: 'Interactivity driven by Google Cloud Vertex AI and Gemini models, grounded in local market parameters via tight RAG architecture. Every recommendation, every compliance flag, every tender simulation has a traceable chain of evidence.',
            },
            {
              icon: <GanttChartSquare className="h-4 w-4" />,
              title: 'Modular UI Holons',
              body: 'Every page component is a self-contained entity with its own state, presentation logic, and execution rules. Hot-swappable, recursively nestable, independently scalable. The polar opposite of monolithic spaghetti.',
            },
            {
              icon: <Target className="h-4 w-4" />,
              title: 'Holonic Protocol Architecture',
              body: 'The Vacili Protocol governs interaction between holons — ensuring that replacing a diagnostic engine, a compliance module, or a tender pipeline does not cascade architectural rot through the rest of the system.',
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
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Who It Serves</h2>
        <p className="text-foreground/60 leading-relaxed text-[15px] max-w-3xl">
          Manufacturing owners in Bulawayo who need to delegate inventory without bleeding margins. Logistics operators in Harare who lose tenders on compliance technicalities. Agri-tech cooperatives in Mashonaland whose paper records make them invisible to diaspora capital. Professional services firms whose regulatory surface area exceeds their headcount.
        </p>
        <p className="text-foreground/60 leading-relaxed text-[15px] max-w-3xl">
          If your enterprise navigates the SADC market volatility and needs to scale without multiplying your personal operational surface area — Radbit was built for you.
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
              Tinotenda is a Zimbabwean systems architect and software engineer who observed firsthand that the gap between African enterprises and their global competitors is not capability — it is institutional credibility.
            </p>
            <p className="text-sm text-foreground/60 leading-relaxed">
              He founded Radbit not to build another software agency, but to create an applied intelligence platform that arms local enterprises with the structural armor needed to compete with market giants. The platform encodes his thesis: that the machine must absorb the chaotic complexity of the market so the human founder needs only tactical intent.
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
