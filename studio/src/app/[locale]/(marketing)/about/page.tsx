import type { Metadata } from 'next';
import Link from 'next/link';
import { AdBanner } from "@/components/ads/ad-banner";

export const metadata: Metadata = {
  title: 'About — Radbit SME Hub',
  description: 'Radbit SME Hub — digital sovereignty for Zimbabwean enterprises. AI-powered business tools, tender matching, and community for SMEs.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Radbit SME Hub',
    description: 'Empowering Zimbabwean entrepreneurs with AI, tenders, and community.',
    type: 'website',
  },
};

export const revalidate = 3600;

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-16 space-y-6 md:space-y-10">
      <div className="space-y-2">
        <h1 className="text-fluid-3xl font-bold tracking-tight">About Radbit SME Hub</h1>
        <p className="text-muted-foreground">Digital sovereignty for Zimbabwean enterprises.</p>
      </div>

      <section className="space-y-4 content-visibility-auto">
        <h2 className="text-xl font-semibold">Our Mission</h2>
        <p>
          Radbit SME Hub exists to level the playing field for Zimbabwean entrepreneurs. We believe
          that every small business owner deserves access to the same AI-powered tools, market
          intelligence, and professional networks that large corporations take for granted.
        </p>
        <p>
          Our platform combines AI, local market data, and community to help SMEs assess their
          digital readiness, find tenders, generate business content, and connect with other
          entrepreneurs — all in one place.
        </p>
      </section>

      <AdBanner slot="content-banner" className="mb-12" />

      <section className="space-y-4 content-visibility-auto">
        <h2 className="text-xl font-semibold">What We Do</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Digital Readiness Assessment:</strong> A 15-minute radar-chart analysis of your business&apos;s digital maturity across Payments, Finance, Marketing, Operations, Infrastructure, and Customer Service</li>
          <li><strong>AI Toolkit:</strong> Business plan generator, slogan generator, financial projector, and more — built for Zimbabwean SMEs</li>
          <li><strong>Tender Matching:</strong> AI scans government and corporate tenders across Zimbabwe and SADC to find opportunities that match your business profile</li>
          <li><strong>Community:</strong> A forum where Zimbabwean entrepreneurs share knowledge, ask questions, and grow together</li>
          <li><strong>AI Mentor:</strong> Get personalised business advice from our AI assistant</li>
        </ul>
      </section>

      <section className="space-y-4 content-visibility-auto">
        <h2 className="text-xl font-semibold">Our Values</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li><strong>Digital sovereignty:</strong> Zimbabwean data stays in Zimbabwean hands</li>
          <li><strong>Local first:</strong> Every feature is built with Zimbabwe&apos;s unique economy in mind — multi-currency, mobile money, load-shedding, and informal markets</li>
          <li><strong>Accessibility:</strong> Free tier available so anyone can start their digital transformation journey</li>
          <li><strong>Privacy:</strong> Your data belongs to you. We comply with POPIA, Zimbabwe Cyber Act, and GDPR</li>
        </ul>
      </section>

      <section className="space-y-4 content-visibility-auto">
        <h2 className="text-xl font-semibold">Who It&apos;s For</h2>
        <p>
          Radbit is built for Zimbabwean small and medium enterprises — from the sole trader in
          Mbare selling vegetables to the tech startup in Borrowdale. If you run a business in
          Zimbabwe (or anywhere in the SADC region), Radbit is for you.
        </p>
      </section>

      <section className="space-y-4 content-visibility-auto">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          Have questions or feedback? Reach out at{' '}
          <a href="mailto:hello@radbitsmehub.co.zw" className="text-primary hover:underline">hello@radbitsmehub.co.zw</a>
          {' '}or visit our <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
        </p>
      </section>
    </div>
  );
}
