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

      <p className="text-xs text-muted-foreground mt-8 text-center">
        Names are generated algorithmically. Always check the PACRA name database before committing to a name.
      </p>
    </div>
  );
}
