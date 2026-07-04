'use client';

import { useState } from "react";
import Link from "next/link";
import { Calculator } from "lucide-react";

const RATE = 0.15;

export default function VatCalculatorPage() {
  const [exclusive, setExclusive] = useState<number>(100);
  const [inclusive, setInclusive] = useState<number>(115);

  const vatAmount = exclusive * RATE;
  const totalInclusive = exclusive * (1 + RATE);

  const netFromInclusive = inclusive / (1 + RATE);
  const vatFromInclusive = inclusive - netFromInclusive;

  return (
    <div className="container max-w-2xl py-16">
      <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block">
        &larr; Back to Resources
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Calculator className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">VAT Calculator</h1>
          <p className="text-muted-foreground">Zimbabwe &mdash; 15% standard VAT (ZIMRA)</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/30 p-6 md:p-8">
        <div className="grid gap-6 mb-6">
          <div>
            <label htmlFor="exclusive-input" className="block text-sm font-medium mb-2">
              Amount (VAT exclusive &mdash; net price)
            </label>
            <input
              id="exclusive-input"
              type="number"
              min="0"
              step="0.01"
              value={exclusive}
              onChange={(e) => setExclusive(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-muted-foreground mb-1">VAT (15%)</p>
              <p className="text-xl font-bold">US${vatAmount.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-primary/70 text-sm mb-1">Total (incl. VAT)</p>
              <p className="text-xl font-bold">US${totalInclusive.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Advanced: Calculate VAT from an inclusive amount
          </summary>
          <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
            <p className="text-muted-foreground text-sm">
              For when you only know the <em>total</em> amount your customer paid.
            </p>
            <div>
              <label htmlFor="inclusive-input" className="block text-sm font-medium mb-2">
                Total Amount (VAT inclusive)
              </label>
              <input
                id="inclusive-input"
                type="number"
                min="0"
                step="0.01"
                value={inclusive}
                onChange={(e) => setInclusive(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-muted-foreground mb-1">Net Price (excl. VAT)</p>
                <p className="text-xl font-bold">US${netFromInclusive.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-muted-foreground mb-1">VAT Amount</p>
                <p className="text-xl font-bold">US${vatFromInclusive.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className="mt-10 space-y-6 max-w-prose mx-auto">
        <div className="rounded-xl border border-border/50 bg-muted/30 p-6 space-y-4">
          <h2 className="font-headline font-semibold text-lg">Understanding VAT in Zimbabwe</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Value-Added Tax (VAT) is Zimbabwe&apos;s primary consumption tax, administered by the Zimbabwe Revenue Authority (ZIMRA). The standard rate is 15% on most goods and services. Businesses registered for VAT must charge this rate on their taxable supplies and can claim input credits on qualifying business purchases.
            </p>
            <p>
              <strong className="text-foreground">VAT registration threshold.</strong> As of 2026, any business with an annual turnover exceeding US$40,000 (or equivalent in ZiG) must register for VAT with ZIMRA. Businesses below this threshold may voluntarily register, which can be beneficial if you supply to VAT-registered customers who need compliant invoices to claim their own input credits.
            </p>
            <p>
              <strong className="text-foreground">Zero-rated supplies (0% VAT).</strong> Certain goods and services attract a zero rate rather than the standard 15%. These include exported goods, unprocessed agricultural products (raw maize, tobacco, cotton, unprocessed meat and fish), and unbranded/organic pesticides and fertilisers. While no VAT is charged on these supplies, the supplier can still claim input credits on related purchases &mdash; which often results in a VAT refund from ZIMRA.
            </p>
            <p>
              <strong className="text-foreground">Exempt supplies (no VAT).</strong> Some goods and services are entirely exempt from VAT, meaning no VAT is charged and no input credits can be claimed. These include financial services (insurance, lending), residential property rentals, medical services, educational services, and passenger transport by road or rail.
            </p>
            <p>
              <strong className="text-foreground">VAT filing requirements.</strong> Registered businesses must submit VAT returns electronically through ZIMRA&apos;s e-services portal. Returns are typically due on or before the 25th of the month following the tax period. Late submissions attract penalties of 5% of the tax due plus interest at the prescribed rate. Our <Link href="/resources/tools/vat-calculator" className="text-primary hover:underline">tax compliance tools</Link> can help you stay on top of deadlines.
            </p>
            <p>
              <strong className="text-foreground">Record-keeping.</strong> ZIMRA requires VAT-registered businesses to retain all tax invoices, credit notes, import documents, and accounting records for at least six years. Digital records are acceptable, provided they are accessible for inspection. Proper record-keeping is essential for substantiating input claims and surviving a ZIMRA audit.
            </p>
            <p>
              Notable: Zimbabwe operates a dual-currency system where transactions may be in US$ or ZiG. VAT calculations apply consistently regardless of currency &mdash; the 15% rate is applied to the VAT-exclusive amount in whatever currency the transaction is denominated.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Rate: 15% standard VAT per ZIMRA. Zero-rated and exempt categories apply. This tool is for estimation only &mdash; consult a ZIMRA-accredited tax practitioner for your specific situation.
        </p>
      </div>
    </div>
  );
}
