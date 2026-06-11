import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Radbit',
  description: 'Terms and conditions for using the Radbit enterprise platform and services.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-16 space-y-6 md:space-y-10">
      <div className="space-y-2">
        <h1 className="text-fluid-3xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: 20 May 2026</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
        <p>
          By accessing or using Radbit (&quot;the Service&quot;), you agree to be bound by these
          Terms of Service. If you do not agree, do not use the Service.
        </p>
        <p>
          These terms apply to all users, including free and paid subscribers, in compliance with the
          laws of Zimbabwe and South Africa.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Description of Service</h2>
        <p>
          Radbit provides AI-powered business tools including a Digital Readiness Assessment,
          AI content generation, tender matching, community forum, and related services (the &quot;Service&quot;).
          All services are provided &quot;as is&quot; and &quot;as available.&quot;
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. User Accounts</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>You must be at least 16 years old to use the Service</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>You must provide accurate and complete information during registration</li>
          <li>You are responsible for all activity under your account</li>
          <li>Notify us immediately of any unauthorized use: support@radbitstudios.co.zw</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. Subscriptions and Payments</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Free plans are provided at no cost with limited features</li>
          <li>Paid plans (Growth, Pro, Enterprise) are billed monthly</li>
          <li>Payments are processed by third-party providers (Stripe, PayNow, PayFast, EcoCash)</li>
          <li>Refunds are provided at our discretion for billing errors only</li>
          <li>Downgrades take effect at the end of the current billing period</li>
          <li>We may change prices with 30 days&apos; notice</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Use the Service for any unlawful purpose</li>
          <li>Attempt to access another user&apos;s account without authorization</li>
          <li>Submit malicious content, viruses, or code</li>
          <li>Use AI generation features to create harmful, deceptive, or illegal content</li>
          <li>Spam the community forum or send unsolicited messages</li>
          <li>Reverse engineer, decompile, or scrape the Service</li>
          <li>Use automated tools to access the Service without permission</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">6. AI-Generated Content</h2>
        <p>
          AI-generated content is provided for informational and planning purposes only. It does not
          constitute professional advice (legal, financial, or otherwise). You should verify all
          AI-generated outputs before relying on them for business decisions.
        </p>
        <p>
          We do not claim ownership of AI-generated content created through the Service. However,
          you grant us a license to store and process this content to provide and improve the Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">7. User-Generated Content</h2>
        <p>
          You retain ownership of content you post to the community forum and other public areas.
          By posting, you grant us a worldwide, non-exclusive, royalty-free license to display and
          distribute this content within the Service.
        </p>
        <p>
          We reserve the right to remove content that violates these terms or applicable laws at our
          discretion.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Radbit shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of the Service.
          Our total liability is limited to the amount you have paid us in the 12 months preceding
          the claim.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">9. Termination</h2>
        <p>
          You may terminate your account at any time through the Settings page. We may suspend or
          terminate your account for violation of these terms, with or without notice.
        </p>
        <p>
          Upon termination, your right to use the Service ceases immediately. We will delete your
          data in accordance with our Privacy Policy and applicable law.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">10. Governing Law</h2>
        <p>
          These terms are governed by the laws of Zimbabwe. For users in South Africa, South African
          consumer protection laws also apply. Any disputes shall be resolved through arbitration in
          Harare, Zimbabwe, or by mutual agreement.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">11. Changes to Terms</h2>
        <p>
          We may update these terms at any time. Material changes will be communicated via email or
          a notice on the Service. Continued use after changes constitutes acceptance of the new terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">12. Contact</h2>
        <p>
          For questions about these terms, contact:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Email: support@radbitstudios.co.zw</li>
          <li>Legal: legal@radbitstudios.co.zw</li>
        </ul>
      </section>
    </div>
  );
}
