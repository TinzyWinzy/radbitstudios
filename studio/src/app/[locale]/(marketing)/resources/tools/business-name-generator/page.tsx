import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { BusinessNameGenerator } from "@/components/business-name-generator";

export const metadata: Metadata = {
  title: "Business Name Generator — Free Zimbabwe SME Name Ideas",
  description:
    "Free business name generator for Zimbabwean SMEs. Get Shona, English, and bilingual name ideas tailored to your industry.",
  alternates: { canonical: "/resources/tools/business-name-generator" },
};

export default function BusinessNameGeneratorPage() {
  return (
    <div className="container max-w-2xl py-16">
      <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">&larr; Back to Resources</Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Sparkles className="h-6 w-6" /></div>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Business Name Generator</h1>
          <p className="text-muted-foreground">Free name ideas for Zimbabwean SMEs</p>
        </div>
      </div>

      <BusinessNameGenerator />

      <div className="mt-12 space-y-6 max-w-prose mx-auto">
        <div className="rounded-xl border border-border/50 bg-muted/30 p-6 space-y-4">
          <h2 className="font-headline font-semibold text-lg">Tips for Naming Your Zimbabwe Business</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Choosing the right business name is one of the most important decisions you&apos;ll make as an entrepreneur. A strong name communicates your value, resonates with your target market, and stands out in a crowded field. For Zimbabwean businesses, there are several practical and legal considerations to keep in mind.
            </p>
            <p>
              <strong className="text-foreground">Check name availability on PACRA.</strong> Before you settle on a name, search the Companies and Deeds Registry (PACRA) database to confirm it isn&apos;t already registered. You can do this in person at their Harare offices or through a registered secretarial firm. Names that are identical or &ldquo;confusingly similar&rdquo; to existing registrations will be rejected.
            </p>
            <p>
              <strong className="text-foreground">Consider bilingual appeal.</strong> Zimbabwe&apos;s market spans English, Shona, and Ndebele speakers. A name that works in multiple languages can broaden your reach. For example, portmanteaus blending English and vernacular words often create memorable, distinctive brands — like &ldquo;SimbaTech&rdquo; or &ldquo;Kudenga Logistics.&rdquo;
            </p>
            <p>
              <strong className="text-foreground">Keep it short and pronounceable.</strong> The best business names are easy to say, spell, and remember. Avoid acronyms that don&apos;t form a word, and test your name on friends and colleagues before finalising. A name that people can say after hearing it once has a built-in marketing advantage.
            </p>
            <p>
              <strong className="text-foreground">Check domain and social media availability.</strong> Once you have a shortlist, search for available .co.zw and .com domains, and check handles on X, Facebook, LinkedIn, and WhatsApp Business. Consistent naming across platforms builds trust and makes you easier to find.
            </p>
            <p>
              <strong className="text-foreground">Avoid geographical and sector restrictions.</strong> Names that include specific locations (&ldquo;Harare,&rdquo; &ldquo;Mbare&rdquo;) or narrow service descriptions (&ldquo;Catering,&rdquo; &ldquo;Transport&rdquo;) can limit your business if you expand later. A broader name gives you room to grow.
            </p>
            <p>
              <strong className="text-foreground">Reserve your name with PACRA.</strong> Once you&apos;ve chosen a name, you can reserve it for 30 to 90 days while you prepare your incorporation documents. This prevents someone else from registering it while you complete your paperwork. The reservation fee is nominal and well worth the peace of mind.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Names generated on this page are suggestions only and may already be registered. Always verify with PACRA and the Deeds Office before incorporation.
        </p>
      </div>
    </div>
  );
}
