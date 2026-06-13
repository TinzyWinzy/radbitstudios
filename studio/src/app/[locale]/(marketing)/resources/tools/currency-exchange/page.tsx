'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, ArrowRightLeft, Info } from "lucide-react";

const currencies = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦", sadc: true },
  { code: "BWP", name: "Botswana Pula", flag: "🇧🇼", sadc: true },
  { code: "ZMW", name: "Zambian Kwacha", flag: "🇿🇲", sadc: true },
  { code: "MZN", name: "Mozambican Metical", flag: "🇲🇿", sadc: true },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "DKK", name: "Danish Krone", flag: "🇩🇰" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽" },
];

type RateMap = Record<string, number>;

export default function CurrencyExchangePage() {
  const [base, setBase] = useState("USD");
  const [rates, setRates] = useState<RateMap | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState(1);

  const fetchRates = useCallback(async (baseCurrency: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/exchange-rates?base=${baseCurrency}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRates(data.rates);
      setDate(data.date);
    } catch {
      setError("Unable to load exchange rates. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates(base);
  }, [base, fetchRates]);

  const handleSwap = () => {
    setBase("USD");
  };

  return (
    <div className="container max-w-3xl py-16">
      <Link
        href="/resources"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 inline-block"
      >
        &larr; Back to Resources
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <ArrowRightLeft className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Currency Exchange Rates</h1>
          <p className="text-muted-foreground">
            Live rates for SADC and major global currencies
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/30 p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-end mb-6">
          <div className="flex-1">
            <label htmlFor="base-currency" className="block text-sm font-medium mb-2">
              Base Currency
            </label>
            <select
              id="base-currency"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || 0)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-base"
            />
          </div>
          <button
            onClick={handleSwap}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border/50 text-sm hover:bg-card/50 transition-colors"
            title="Reset to USD"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={() => fetchRates(base)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {date && (
          <p className="text-xs text-muted-foreground mb-4">
            Rates as of {new Date(date).toLocaleDateString("en-ZW", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })} &middot; Source: European Central Bank
          </p>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive mb-4">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rates ? (
          <div>
            <div className="grid gap-2">
              <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Currency</span>
                <span>Rate (1 {base})</span>
              </div>
              {currencies
                .filter((c) => c.code !== base)
                .filter((c) => rates[c.code] !== undefined)
                .map((c) => {
                  const rate = rates[c.code];
                  const converted = amount * rate;
                  return (
                    <div
                      key={c.code}
                      className={`grid grid-cols-[1fr_auto] gap-4 items-center rounded-lg px-4 py-3 ${
                        c.sadc ? "bg-primary/5 border border-primary/10" : "bg-card/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg">{c.flag}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">
                            {c.code}
                            {c.sadc && (
                              <span className="ml-1.5 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                SADC
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{c.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-medium tabular-nums">
                          {converted.toLocaleString("en-ZW", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 4,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          1 {c.code} = {(1 / rate).toFixed(6)} {base}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {currencies.some((c) => c.code !== base && rates[c.code] === undefined) && (
              <div className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <p>
                  Some SADC currencies (BWP, ZMW, MZN) are not available from the European Central
                  Bank data source. Check your local bank or the respective central bank for these
                  rates.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        Exchange rates are provided by the European Central Bank and updated daily on working days.
        Rates shown are mid-market rates and may differ from rates offered by banks or money
        transfer services. Always verify with your financial institution before transacting.
      </p>
    </div>
  );
}
