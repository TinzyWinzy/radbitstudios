import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Radbit SME Hub',
  description: 'Radbit SME Hub privacy policy covering POPIA, Zimbabwe Cyber Act, data collection, and your rights.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: 20 May 2026</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p>
          Radbit SME Hub (&quot;Radbit,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;) respects your privacy and is committed to protecting your
          personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your
          information when you use our platform at radbitstudios.co.zw (the &quot;Service&quot;).
        </p>
        <p>
          This policy complies with the Protection of Personal Information Act (POPIA) of South Africa,
          the Zimbabwe Cyber and Data Protection Act [Chapter 12:07], the General Data Protection
          Regulation (GDPR) for users in the European Economic Area, and other applicable data
          protection laws.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">2. Information We Collect</h2>
        <h3 className="font-medium">2.1 Information You Provide</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Account information: email address, display name, and profile photo</li>
          <li>Business information: business name, industry, business description</li>
          <li>Assessment responses and scores from the Digital Readiness Assessment</li>
          <li>AI-generated content requests and results (business plans, slogans, etc.)</li>
          <li>Community forum posts, replies, and messages</li>
          <li>Payment information (processed by third-party providers — we do not store card details)</li>
        </ul>
        <h3 className="font-medium">2.2 Information Collected Automatically</h3>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Usage data: pages visited, features used, time spent on the Service</li>
          <li>Device information: browser type, operating system, IP address</li>
          <li>Cookies and similar tracking technologies (see Section 5)</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>To provide, maintain, and improve the Service</li>
          <li>To generate AI-powered business insights and content</li>
          <li>To match you with relevant tenders and business opportunities</li>
          <li>To send notifications about features, tenders, and platform updates</li>
          <li>To process payments and manage your subscription</li>
          <li>To detect and prevent abuse, fraud, or unauthorized access</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">4. Legal Basis for Processing (GDPR)</h2>
        <p>For users in the European Economic Area, we process your data under the following legal bases:</p>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li><strong>Contract performance:</strong> to deliver the Service you requested</li>
          <li><strong>Consent:</strong> where you have given explicit consent (e.g., marketing)</li>
          <li><strong>Legitimate interests:</strong> to improve our Service and ensure security</li>
          <li><strong>Legal obligation:</strong> to comply with applicable laws</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">5. Cookies and Tracking</h2>
        <p>
          We use essential cookies for authentication and service operation. We also use analytics
          cookies to understand how you use our platform.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-medium">Cookie</th>
                <th className="text-left py-2 pr-4 font-medium">Purpose</th>
                <th className="text-left py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4"><code>__session</code></td>
                <td className="py-2 pr-4">Authentication session</td>
                <td className="py-2">1 hour</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 pr-4"><code>cookie_consent</code></td>
                <td className="py-2 pr-4">Cookie preference storage</td>
                <td className="py-2">1 year</td>
              </tr>
              <tr>
                <td className="py-2 pr-4"><code>sidebar_state</code></td>
                <td className="py-2 pr-4">UI preference (sidebar collapsed state)</td>
                <td className="py-2">1 year</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          You can manage cookie preferences through your browser settings or our cookie consent banner.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">6. Data Sharing and Disclosure</h2>
        <p>We do not sell your personal data. We may share your information with:</p>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li><strong>Service providers:</strong> Stripe, PayNow, PayFast, EcoCash (payment processing); Google Cloud (hosting and AI); Sentry (error tracking)</li>
          <li><strong>Legal authorities:</strong> where required by law or to protect our rights</li>
          <li><strong>Business transfers:</strong> in connection with a merger, acquisition, or sale of assets</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">7. Data Retention</h2>
        <p>
          We retain your data for as long as your account is active or as needed to provide the Service.
          Upon account deletion, we delete or anonymize your data within 30 days, except where
          retention is required by law (e.g., financial records for 5 years).
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">8. Your Rights</h2>
        <p>Under POPIA and GDPR, you have the following rights:</p>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li><strong>Right to access:</strong> request a copy of your personal data</li>
          <li><strong>Right to rectification:</strong> correct inaccurate data</li>
          <li><strong>Right to erasure:</strong> request deletion of your data (&quot;right to be forgotten&quot;)</li>
          <li><strong>Right to restrict processing:</strong> limit how we use your data</li>
          <li><strong>Right to data portability:</strong> receive your data in a structured format</li>
          <li><strong>Right to object:</strong> object to processing based on legitimate interests</li>
          <li><strong>Right to withdraw consent:</strong> withdraw consent at any time</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at privacy@radbitstudios.co.zw or use the
          Settings &rarr; Account & Plan section of the platform.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">9. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your data,
          including AES-256-GCM encryption for sensitive personal information at rest, TLS 1.3 for
          data in transit, and regular security audits. However, no method of transmission over the
          Internet is 100% secure.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">10. International Transfers</h2>
        <p>
          Your data may be processed on servers located in the United States, South Africa, and
          the European Union. We ensure appropriate safeguards are in place through standard
          contractual clauses and adequacy decisions where applicable.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">11. Children&apos;s Privacy</h2>
        <p>
          The Service is not intended for individuals under the age of 16. We do not knowingly
          collect data from children. If you believe a child has provided us with personal data,
          please contact us.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">12. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of material
          changes via email or a prominent notice on the Service. Your continued use after changes
          constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">13. Contact</h2>
        <p>
          For questions, concerns, or data protection requests, contact our Data Protection Officer:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Email: privacy@radbitstudios.co.zw</li>
          <li>Data Protection Officer: dpo@radbitstudios.co.zw</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          For POPIA enquiries, contact the Information Regulator (South Africa):
          enquiries@inforegulator.org.za. For Zimbabwe Cyber Act enquiries, contact the Postal and
          Telecommunications Regulatory Authority of Zimbabwe (POTRAZ): potraz@potraz.gov.zw.
        </p>
      </section>
    </div>
  );
}
