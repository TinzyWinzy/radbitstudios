import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Download, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Radbit SME Hub",
  description: "How Radbit SME Hub collects, uses, and protects your personal data in compliance with POPIA, GDPR, and the Zimbabwe Cyber Act.",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="size-6 shrink-0" />
            <span className="font-semibold text-foreground">Radbit SME Hub</span>
          </Link>
        </div>
      </header>

      <main className="container max-w-4xl py-12 px-4 md:px-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>

        <h1 className="font-headline text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: May 31, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Radbit SME Hub (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our platform, in compliance with the Zimbabwe Cyber and Data Protection Act
              (2021), the South African Protection of Personal Information Act (POPIA), and the
              European Union General Data Protection Regulation (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Name, email address, phone number, business name, industry, and business description
                    that you provide during registration and profile management.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Usage Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Assessment responses, AI tool usage, feature interactions, and platform activity
                    used to personalize your experience and improve our services.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    Device &amp; Technical Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Browser type, device information, IP address, and cookies necessary for
                    authentication and platform functionality.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>To provide, personalize, and improve our AI-powered services</li>
              <li>To track your Digital Readiness Assessment results and benchmarks</li>
              <li>To send you relevant tenders, business news, and notifications</li>
              <li>To process payments and manage your subscription</li>
              <li>To communicate with you about your account and our services</li>
              <li>To ensure platform security and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal data. We may share information with trusted service
              providers (Firebase/Google Cloud, payment processors) solely to operate the platform.
              All third-party processors are contractually bound to protect your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-1">Access &amp; Portability</h3>
                  <p className="text-sm text-muted-foreground">
                    Request a copy of your personal data in a portable format (GDPR Article 20).
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-1">Rectification</h3>
                  <p className="text-sm text-muted-foreground">
                    Update your profile information at any time through Settings.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-1">Erasure</h3>
                  <p className="text-sm text-muted-foreground">
                    Delete your account and all associated data permanently through Settings &gt; Privacy &amp; Data.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-1">Objection</h3>
                  <p className="text-sm text-muted-foreground">
                    Opt out of non-essential data processing and marketing communications.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement AES-256-GCM encryption for sensitive data at rest, JWT-based authentication,
              Firestore security rules, and rate limiting. While we strive to use commercially acceptable
              means to protect your data, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal data for as long as your account is active. Upon account deletion,
              we remove your personal data within 30 days, except where required by law or for
              legitimate business purposes (e.g., financial records for tax compliance).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. International Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data may be processed in countries outside Zimbabwe. We ensure appropriate safeguards
              are in place, including standard contractual clauses where required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are not intended for individuals under the age of 18. We do not knowingly
              collect personal data from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material
              changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or wish to exercise your data rights,
              contact us at:
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:privacy@radbitstudios.co.zw" className="underline hover:text-foreground">
                privacy@radbitstudios.co.zw
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
