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
          <p className="text-muted-foreground">Zimbabwe &mdash; 15% standard VAT</p>
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
              <p className="text-xl font-bold">${vatAmount.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-primary/70 text-sm mb-1">Total (incl. VAT)</p>
              <p className="text-xl font-bold">${totalInclusive.toFixed(2)}</p>
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
                <p className="text-xl font-bold">${netFromInclusive.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-muted-foreground mb-1">VAT Amount</p>
                <p className="text-xl font-bold">${vatFromInclusive.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </details>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        Rate: 15% standard VAT per ZIMRA. Zero-rated goods (exports, unprocessed food/tobacco/alcohol) use a custom rate &mdash; consult your ZIMRA officer.
      </p>
    </div>
  );
}
