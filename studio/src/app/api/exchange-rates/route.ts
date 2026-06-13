import { NextResponse } from "next/server";

const FRANKFURTER_BASE = "https://api.frankfurter.app";

const SUPPORTED_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "ZAR", "CNY", "AUD", "INR",
  "CHF", "CAD", "NZD", "SGD", "HKD", "SEK", "NOK", "DKK",
  "BRL", "MXN",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") || "USD").toUpperCase();

  try {
    const res = await fetch(
      `${FRANKFURTER_BASE}/latest?from=${base}&to=${SUPPORTED_CURRENCIES.join(",")}`,
      { next: { revalidate: 3600 } },
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch rates" }, { status: 502 });
    }

    const data = await res.json();

    const rates: Record<string, number> = {};
    for (const [code, rate] of Object.entries(data.rates as Record<string, number>)) {
      if (SUPPORTED_CURRENCIES.includes(code)) {
        rates[code] = rate;
      }
    }

    return NextResponse.json({
      base: data.base,
      date: data.date,
      rates,
    });
  } catch {
    return NextResponse.json({ error: "Exchange rate service unavailable" }, { status: 503 });
  }
}
