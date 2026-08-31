import type { Metadata } from 'next';
import Link from 'next/link';
import { RADBIT_BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Privacy Notice — Radbit',
  description: 'How Radbit Studios handles personal information when providing its website, accounts and software services.',
  alternates: { canonical: '/privacy' },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="border-t border-border/60 pt-7">
    <h2 className="font-headline text-xl font-semibold tracking-tight">{title}</h2>
    <div className="mt-3 space-y-3 leading-7 text-muted-foreground">{children}</div>
  </section>
);

export default function PrivacyNoticePage() {
  return (
    <div className="container max-w-3xl px-4 py-24 md:py-32">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal information</p>
      <h1 className="mt-4 font-headline text-fluid-3xl font-semibold tracking-tight">Privacy Notice</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        This notice describes the information currently handled through Radbit&apos;s website, accounts and software tools. It does not claim that every proposed or pilot capability is available.
      </p>
      <p className="mt-5 text-sm text-muted-foreground">Effective 30 August 2026 · Version 1.0</p>

      <div className="mt-12 space-y-8">
        <Section title="1. Who is responsible">
          <p>{RADBIT_BRAND.operatorStatement} Nexus Agronomics is responsible for personal information used to operate Radbit accounts, enquiries, billing, communications and the public website.</p>
          <p>Contact: {RADBIT_BRAND.location} · <a className="underline underline-offset-4" href={`mailto:${RADBIT_BRAND.privacyEmail}`}>{RADBIT_BRAND.privacyEmail}</a>.</p>
          <p>For customer projects, Nexus Agronomics may process records on a customer&apos;s documented instructions. Those responsibilities should be set out in the applicable service agreement or data-processing addendum.</p>
        </Section>

        <Section title="2. Information we handle">
          <ul className="list-disc space-y-2 pl-5">
            <li>Account and profile information, such as name, email address, phone number, organisation and authentication identifiers.</li>
            <li>Enquiries, project communications, support messages and documents a user chooses to upload.</li>
            <li>Assessment responses, saved workflows and prompts or content submitted to AI-assisted tools.</li>
            <li>Subscription, invoice and payment-status information. Payment providers process payment credentials under their own notices.</li>
            <li>Security and technical information, such as IP address, device details, session records and abuse-prevention logs.</li>
            <li>Newsletter preferences and analytics information where the relevant choice has been made.</li>
          </ul>
        </Section>

        <Section title="3. Why we use it">
          <p>We use personal information to provide requested services, authenticate users, manage projects and subscriptions, respond to enquiries, secure the platform, maintain records, and comply with applicable obligations.</p>
          <p>Optional analytics help us understand aggregate product use. Marketing communications are sent only where requested or otherwise permitted, and each message should provide a way to unsubscribe.</p>
          <p>We do not sell personal information. We do not use customer project data to train unrelated Radbit models unless that use is separately agreed and legally justified.</p>
        </Section>

        <Section title="4. Service providers and international processing">
          <p>Radbit relies on selected infrastructure, authentication, hosting, AI, analytics, communications and payment providers. Depending on the feature used, these may include Google/Firebase and Gemini, Vercel, Supabase, Sentry, Resend, WhatsApp/Meta, Stripe, PayNow, PayFast or EcoCash-related providers.</p>
          <p>Some providers may process information outside Zimbabwe. We assess service providers and contractual safeguards according to the feature and information involved. A provider should not receive information that is unnecessary for its role.</p>
        </Section>

        <Section title="5. AI-assisted features">
          <p>Information entered into an AI-assisted feature may be transmitted to the model or infrastructure provider used to generate the response. Do not enter passwords, private keys, identity documents or information you are not authorised to disclose.</p>
          <p>AI output can be incomplete or incorrect. It is decision support, not a tax ruling, regulatory approval, legal opinion, financial recommendation or guarantee of compliance.</p>
        </Section>

        <Section title="6. Retention and deletion">
          <p>We keep information only for as long as reasonably required for the stated purpose, security, dispute handling and applicable record-keeping duties. Different records have different retention periods; payment and accounting records may need to be retained after an account closes.</p>
          <p>Account deletion removes covered active account data through the platform process. Backup expiry, legally required records and records controlled by a customer may follow separate schedules. We do not promise immediate or universal deletion where retention is required or technically pending.</p>
        </Section>

        <Section title="7. Security">
          <p>We use access controls, authentication, encryption provided by infrastructure services, private storage rules, logging and other technical and organisational safeguards appropriate to the service. No online service can guarantee absolute security.</p>
          <p>If you believe information has been exposed or misused, contact us immediately at <a className="underline underline-offset-4" href={`mailto:${RADBIT_BRAND.privacyEmail}`}>{RADBIT_BRAND.privacyEmail}</a>.</p>
        </Section>

        <Section title="8. Your choices and requests">
          <p>You may ask about your personal information, request access or correction, object to particular processing, withdraw optional consent, unsubscribe from marketing, or request deletion where applicable. We may need to verify identity before completing a request.</p>
          <p>Use the account settings where available or email <a className="underline underline-offset-4" href={`mailto:${RADBIT_BRAND.privacyEmail}`}>{RADBIT_BRAND.privacyEmail}</a>. You may also raise a concern with the relevant Zimbabwean data-protection authority.</p>
        </Section>

        <Section title="9. Children">
          <p>Radbit is intended for business users aged 18 or older. We do not knowingly offer accounts to children. Contact us if you believe a child&apos;s information has been submitted.</p>
        </Section>

        <Section title="10. Changes">
          <p>We may update this notice as the service and its providers change. Material changes will be identified by a new effective date and, where appropriate, an account or email notice.</p>
          <p>See also the <Link className="underline underline-offset-4" href="/terms">Terms of Service</Link>.</p>
        </Section>
      </div>
    </div>
  );
}
