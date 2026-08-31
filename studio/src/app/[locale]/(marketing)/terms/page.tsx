import type { Metadata } from 'next';
import Link from 'next/link';
import { RADBIT_BRAND, RADBIT_POSITIONING } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Terms of Service — Radbit',
  description: 'Terms for Radbit Studios website, accounts and software services.',
  alternates: { canonical: '/terms' },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-t border-border/60 pt-7">
    <h2 className="font-headline text-xl font-semibold tracking-tight">{title}</h2>
    <div className="mt-3 space-y-3 leading-7 text-muted-foreground">{children}</div>
  </section>
);

export default function TermsPage() {
  return (
    <div className="container max-w-3xl px-4 py-24 md:py-32">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal information</p>
      <h1 className="mt-4 font-headline text-fluid-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Clear boundaries for the Radbit website, accounts and currently available software services.</p>
      <p className="mt-5 text-sm text-muted-foreground">Effective 30 August 2026 · Version 1.0</p>

      <div className="mt-12 space-y-8">
        <Section title="1. The service provider">
          <p>{RADBIT_BRAND.operatorStatement} In these terms, “Nexus,” “Radbit,” “we” and “us” refer to Nexus Agronomics when it provides the Radbit service.</p>
          <p>Business contact: {RADBIT_BRAND.location} · <a className="underline underline-offset-4" href={`mailto:${RADBIT_BRAND.contactEmail}`}>{RADBIT_BRAND.contactEmail}</a>.</p>
        </Section>

        <Section title="2. Acceptance and eligibility">
          <p>By creating an account, buying a subscription or using an interactive Radbit service, you agree to these terms and the <Link className="underline underline-offset-4" href="/privacy">Privacy Notice</Link>. If you use Radbit for an organisation, you confirm that you are authorised to act for it.</p>
          <p>Accounts are intended for users aged 18 or older. Additional written terms may apply to consultancy projects, enterprise deployments, data processing or support services; those written terms prevail where they conflict with these general terms.</p>
        </Section>

        <Section title="3. What Radbit provides">
          <p>Radbit provides software development, systems design, workflow tools, business information and AI-assisted features. Features described as pilots, previews, planned capabilities or controlled development are not production commitments.</p>
          <p>{RADBIT_POSITIONING.advisoryBoundary}</p>
        </Section>

        <Section title="4. Accounts and acceptable use">
          <p>You must provide accurate account information, protect your credentials and notify us of suspected unauthorised use. You may not interfere with the service, bypass access controls, access another user&apos;s information, introduce malicious code, infringe rights or use the service unlawfully.</p>
          <p>You are responsible for having authority to upload or process information through Radbit. Do not upload passwords, private keys or unnecessary sensitive personal information.</p>
        </Section>

        <Section title="5. Customer content">
          <p>You retain your rights in content you submit. You grant Nexus a limited, non-exclusive permission to host, copy, transmit and process that content only as needed to provide, secure and support the service or meet applicable obligations.</p>
          <p>Public community content may be displayed to other users. Private project content is not made public by that licence. Enterprise processing responsibilities should be documented separately.</p>
        </Section>

        <Section title="6. AI and information tools">
          <p>{RADBIT_POSITIONING.aiBoundary} You remain responsible for decisions, submissions and communications made using generated output.</p>
          <p>Tender information, deadlines, exchange rates and regulatory material can change. Consult the original authority or a suitably qualified professional before taking a material action.</p>
        </Section>

        <Section title="7. Plans, payments and cancellation">
          <p>Prices, billing intervals and included features are shown before purchase or in the applicable written proposal. Third-party payment providers may apply their own terms.</p>
          <p>You may cancel a recurring plan before its next renewal. Unless a mandatory consumer right applies, fees already earned for a completed billing period are not automatically refundable. We will correct duplicate or erroneous charges and consider other refund requests reasonably in light of the service delivered.</p>
          <p>We will give reasonable notice of material price or plan changes where practicable. Changes do not remove rights that cannot lawfully be excluded.</p>
        </Section>

        <Section title="8. Availability and changes">
          <p>We work to keep available services reliable, but maintenance, provider outages, security events and connectivity conditions may interrupt access. We may modify or withdraw a feature for security, legal, technical or operational reasons.</p>
          <p>Where a paid core feature is permanently withdrawn during a prepaid period, we will provide an appropriate remedy where required by the agreement or applicable law.</p>
        </Section>

        <Section title="9. Suspension and termination">
          <p>You may close your account through available settings. We may restrict or suspend access where reasonably necessary to address misuse, non-payment, security risk or a legal obligation. Where appropriate, we will provide notice and an opportunity to remedy the issue.</p>
          <p>Account closure does not erase payment records or other information that must be retained. See the Privacy Notice for more detail.</p>
        </Section>

        <Section title="10. Responsibility and liability">
          <p>Nothing in these terms excludes liability or consumer rights that cannot lawfully be excluded. To the extent permitted by law, neither party is responsible for indirect or consequential loss that was not reasonably foreseeable.</p>
          <p>Any project-specific liability limit must be stated in the applicable proposal or service agreement. These terms do not promise that software will eliminate every error, penalty, cyber incident or business loss.</p>
        </Section>

        <Section title="11. Disputes and governing law">
          <p>These terms are governed by the laws of Zimbabwe, subject to mandatory rights that apply to a user. Please contact us first so the parties can try to resolve a dispute in good faith. If that fails, either party may use the courts or another dispute process agreed in writing.</p>
        </Section>

        <Section title="12. Contact and changes">
          <p>Questions about these terms may be sent to <a className="underline underline-offset-4" href={`mailto:${RADBIT_BRAND.contactEmail}`}>{RADBIT_BRAND.contactEmail}</a>.</p>
          <p>We may revise these terms as the service changes. Material changes will be identified by a new effective date and communicated where appropriate. Continued use after the effective date indicates acceptance, but does not override mandatory legal rights.</p>
        </Section>
      </div>
    </div>
  );
}
