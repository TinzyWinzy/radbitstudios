/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next';
import { Linkedin, Mail, Github, Twitter, Phone, MapPin, Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Founders — Radbit',
  description: 'Tinotenda Brandon Duma, founder and CEO of Radbit. Full-stack engineer, AI systems architect, and builder of operational infrastructure for SADC businesses.',
  alternates: { canonical: '/founders' },
  openGraph: {
    title: 'Tinotenda Brandon Duma — Founder of Radbit',
    description: 'Full-stack engineer with 5+ years building production systems. Founded Radbit to give SADC businesses the institutional records and systems they need to compete globally.',
    type: 'profile',
  },
};

export const revalidate = 3600;

const experience = [
  {
    role: 'Software Developer and AI Systems Engineer',
    company: 'Kumby Consulting',
    location: 'Harare, Zimbabwe',
    period: 'Oct 2024 - May 2026',
    highlights: [
      'Designed and deployed a Retrieval-Augmented Generation system (KumbyAI) using Google Genkit and Gemini AI on GCP, providing AI-powered biopharma intelligence with automated news analysis, risk identification, and compliance insights',
      'Built and maintained 5+ client platforms including a WordPress news site, a Shopify e-commerce store, a Squarespace jewelry boutique, a GCP-hosted RAG application, and a Squarespace company site',
      'Architected full-stack web platforms with React and Next.js frontends and Python and Django backends, deployed on Google Cloud Platform with Docker containers',
      'Led rapid prototyping cycles within CI/CD pipelines, reducing development-to-deployment time by 40%',
      'Developed cloud-based automation pipelines that reduced manual administrative processes by 60%',
      'Applied OWASP secure coding practices and integrated enterprise cybersecurity principles into system architecture',
    ],
  },
  {
    role: 'Technical Support Engineer (Systems and Automation)',
    company: 'Tampa Medical College',
    location: 'Remote',
    period: 'Feb 2022 - Mar 2024',
    highlights: [
      'Managed and optimized LMS cloud infrastructure supporting 10,000+ users across critical digital learning systems',
      'Automated administrative workflows using JavaScript and Node.js, reducing processing friction by 35%',
      'Enhanced end-user engagement through interactive learning integrations and technical system optimization',
      'Maintained 99.5% system uptime through proactive monitoring and incident response',
      'Collaborated with US-based stakeholders in a fully remote environment across time zones',
    ],
  },
  {
    role: 'Cybersecurity Analyst (Penetration Testing Intern)',
    company: 'Securetia',
    location: 'Remote',
    period: 'Feb 2021 - Mar 2021',
    highlights: [
      'Conducted penetration testing and vulnerability assessments on enterprise web applications',
      'Performed OSINT reconnaissance and identified critical network vulnerabilities',
      'Contributed to infrastructure hardening recommendations for client systems',
    ],
  },
  {
    role: 'Front-End Developer',
    company: 'Datalabs (formerly Z-Score)',
    location: 'Remote',
    period: 'Sep 2020 - Nov 2020',
    highlights: [
      'Developed SEO-optimized, responsive landing pages in React.js, increasing platform web traffic by 35%',
      'Built interactive monitoring dashboards using modern JavaScript and React.js',
      'Collaborated on front-end architecture decisions in a remote Agile team',
    ],
  },
];

const projects = [
  {
    name: 'Cultural Coder',
    stack: 'Next.js, Genkit + Gemini AI, Firebase',
    description: 'AI-powered coding education platform teaching programming in English, Shona, and Ndebele with Zimbabwean cultural analogies. Includes 25+ curriculum lessons, interactive code playground, AI text/image/video generation (Imagen 4.0, Veo 2.0), placement quizzes, classroom management, and certificates. PWA-enabled with 11 Genkit AI flows.',
  },
  {
    name: 'Nexus Agronomics',
    stack: 'Next.js, Solidity/Hardhat, wagmi, Genkit',
    description: 'Blockchain-powered agricultural investment platform with ERC-20 token (NIT), DAO governance (Governor + Timelock), smart contracts with milestone-based funding, AI-assisted KYC verification, IPFS document storage, and multi-role access (Investor/Initiator/Partner/Admin).',
  },
  {
    name: 'AltarRand',
    stack: 'Python, PyTorch/LSTM, XGBoost, WebSockets',
    description: 'Holonic algorithmic trading engine for Kraken Futures. Three-tier architecture with order book analysis (OFI/liquidity), LSTM volatility prediction (TAO/PEPE), and XGBoost momentum signals (BTC/ZEC). Real-time WebSocket data ingestion with PPO reinforcement learning optimizer and trailing-stop position management.',
  },
  {
    name: 'Radbit SME Hub',
    stack: 'Next.js, Genkit, Firebase',
    description: 'Full-featured SME platform with 6 AI flows: AI mentor chatbot, tender matching, skills assessment, business toolkit, dashboard analytics, and content moderation. Supports i18n, dark/light/system theming, and offline support.',
  },
  {
    name: 'Simudza Africa / InvestorBoard',
    stack: 'Next.js, Genkit, Firebase, Upstash Redis',
    description: 'Multi-role investment platform with AI-powered document processing and KYC verification. Features wallet balance system, project CRUD, admin management, PayNow payment integration, Redis rate limiting, and Recharts analytics dashboards.',
  },
  {
    name: 'Age-Cheat-Zim',
    stack: 'React, Solidity/Hardhat, Flutter, DID/VC',
    description: 'Blockchain-based digital identity system preventing age fraud in Zimbabwean youth sports. Uses Decentralized Identifiers (DIDs) with verifiable credentials, biometric verification, tamper-proof records on Polygon, and QR code identity cards.',
  },
];

const skillGroups = [
  {
    category: 'Frontend',
    skills: 'React, Next.js, TypeScript, JavaScript, Tailwind CSS, shadcn/ui, Framer Motion, Three.js, PWA',
  },
  {
    category: 'Backend',
    skills: 'Node.js, Python (Flask, FastAPI), Express.js, RESTful APIs, GraphQL, WebSockets, Django',
  },
  {
    category: 'AI and ML',
    skills: 'Google Genkit, Gemini AI (text/image/video), RAG Systems, NLP Pipelines, LSTM (PyTorch), XGBoost, LLM Integration',
  },
  {
    category: 'Cloud and DevOps',
    skills: 'Google Cloud Platform (Compute Engine, AI Studio, Vertex AI), Firebase (Auth, Firestore, Hosting), Docker, CI/CD, Vercel, Supabase',
  },
  {
    category: 'Blockchain',
    skills: 'Solidity, Hardhat, OpenZeppelin, wagmi/viem/RainbowKit, ERC-20, IPFS (Pinata), Polygon, Celo',
  },
  {
    category: 'Security',
    skills: 'OWASP Best Practices, JWT/DID/VC, Penetration Testing, Rate Limiting',
  },
];

export default function FoundersPage() {
  return (
    <div className="container py-12 md:py-24 space-y-16 max-w-5xl">
      {/* Hero */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 text-3xl font-bold text-white">
            TD
          </div>
          <div className="space-y-3">
            <div>
              <h1 className="font-headline text-fluid-3xl font-bold tracking-tighter">
                Tinotenda Brandon Duma
              </h1>
              <p className="text-lg text-foreground/50">
                Founder and Chief Executive Officer, Radbit Inc.
              </p>
            </div>
            <p className="text-foreground/60 leading-relaxed max-w-2xl">
              Full-stack software engineer with 5+ years of experience building production-grade web applications,
              AI-powered platforms, and blockchain systems. He started Radbit to give SADC businesses the
              institutional records and systems they need to compete globally.
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
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
              <a
                href="https://x.com/RadbitStudios"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-primary transition-colors"
              >
                <Twitter className="h-3.5 w-3.5" /> @RadbitStudios
              </a>
              <a
                href="mailto:brandontinoz@gmail.com"
                className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-primary transition-colors"
              >
                <Mail className="h-3.5 w-3.5" /> brandontinoz@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Professional Summary</h2>
        <p className="text-foreground/60 leading-relaxed text-[15px] max-w-3xl">
          Full-stack software engineer with 5+ years of experience building production-grade web applications,
          AI-powered platforms, and blockchain systems. Expert in Next.js, TypeScript, React/Node.js, Python,
          and Google Cloud Platform with deep experience integrating Google Genkit and Gemini AI across multiple
          production applications. Shipped 15+ full-stack projects including RAG systems, AI-driven education
          platforms, DeFi protocols, and real-time trading engines. Proven track record of rapid prototyping,
          CI/CD acceleration, and delivering AI-augmented solutions that solve real business problems.
        </p>
      </section>

      {/* Experience */}
      <section className="space-y-8">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Experience</h2>
        <div className="space-y-8">
          {experience.map((job) => (
            <div key={job.role} className="border-l-2 border-foreground/10 pl-5 space-y-3">
              <div>
                <h3 className="font-headline font-bold text-foreground">{job.role}</h3>
                <p className="text-sm text-foreground/50">
                  {job.company} &mdash; {job.location} | {job.period}
                </p>
              </div>
              <ul className="space-y-2">
                {job.highlights.map((h, i) => (
                  <li key={i} className="text-sm text-foreground/60 leading-relaxed flex gap-2">
                    <span className="text-primary mt-1.5 shrink-0">-</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Education</h2>
        <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-5">
          <h3 className="font-headline font-bold text-foreground">Bachelor of Science in Applied Computer Technology</h3>
          <p className="text-sm text-foreground/50">United States International University (USIU), Nairobi, Kenya (2018 - 2021)</p>
        </div>
      </section>

      {/* Key Projects */}
      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Key Projects</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <div
              key={project.name}
              className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-5 hover:border-primary/30 transition-colors"
            >
              <h3 className="font-headline font-bold text-foreground text-sm mb-1">{project.name}</h3>
              <p className="text-[11px] text-foreground/40 font-mono mb-2">{project.stack}</p>
              <p className="text-sm text-foreground/60 leading-relaxed">{project.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Skills */}
      <section className="space-y-6">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Technical Skills</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {skillGroups.map((group) => (
            <div key={group.category} className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-4">
              <h3 className="font-headline font-bold text-foreground text-xs uppercase tracking-wider mb-2">
                {group.category}
              </h3>
              <p className="text-sm text-foreground/60 leading-relaxed">{group.skills}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="space-y-4">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Certifications</h2>
        <ul className="space-y-2 text-sm text-foreground/60 max-w-2xl">
          <li className="flex gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>Google Cybersecurity Professional Certificate</span>
          </li>
          <li className="flex gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>Google Cloud AI and Machine Learning Fundamentals</span>
          </li>
          <li className="flex gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>Artificial Intelligence Analyst - IBM</span>
          </li>
          <li className="flex gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>ALX-T Cloud Developer - Udacity</span>
          </li>
          <li className="flex gap-2">
            <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>Introduction to Cybersecurity and Cyber Attacks - Cisco Networking Academy / IBM</span>
          </li>
        </ul>
      </section>

      {/* Contact */}
      <section className="space-y-6 pt-8 border-t border-foreground/10">
        <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground">Contact</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 text-sm text-foreground/60">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>Harare, Zimbabwe (Remote-Ready Worldwide)</span>
          </div>
          <a href="tel:+2637813344474" className="flex items-start gap-3 text-sm text-foreground/60 hover:text-primary transition-colors">
            <Phone className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>+263 781 334 4474</span>
          </a>
          <a href="mailto:brandontinoz@gmail.com" className="flex items-start gap-3 text-sm text-foreground/60 hover:text-primary transition-colors">
            <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>brandontinoz@gmail.com</span>
          </a>
        </div>
        <div className="pt-2">
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            About Radbit
          </Link>
        </div>
      </section>
    </div>
  );
}
