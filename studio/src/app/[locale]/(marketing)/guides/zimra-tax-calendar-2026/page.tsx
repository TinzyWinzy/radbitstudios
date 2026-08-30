import type { Metadata } from "next";
import { faqPageSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "ZIMRA Tax Deadline Calendar 2026 — QPD, PAYE & VAT Due Dates | Radbit",
  description:
    "All 2026 ZIMRA dates in one place: QPDs on 25 Mar, 25 Jun, 25 Sep & 20 Dec; PAYE by the 10th; VAT returns by the 10th and payments by the 15th (SI 81/2025); annual returns and penalties.",
  alternates: { canonical: "/guides/zimra-tax-calendar-2026" },
};

const monthByMonth = [
  { m: "Jan", paye: "9 Jan (10th is Sat)", vat: "9 Jan (10th is Sat)", other: "" },
  { m: "Feb", paye: "10 Feb", vat: "10 Feb", other: "" },
  { m: "Mar", paye: "10 Mar", vat: "10 Mar", other: "QPD 1 — return 20 Mar; pay 25 Mar (10%)" },
  { m: "Apr", paye: "10 Apr", vat: "10 Apr", other: "Income tax return (2025) — 30 Apr" },
  { m: "May", paye: "8 May (10th is Sun)", vat: "8 May (10th is Sun)", other: "" },
  { m: "Jun", paye: "10 Jun", vat: "10 Jun", other: "QPD 2 — return 20 Jun; pay 25 Jun (25%)" },
  { m: "Jul", paye: "10 Jul", vat: "10 Jul", other: "" },
  { m: "Aug", paye: "10 Aug", vat: "10 Aug", other: "" },
  { m: "Sep", paye: "10 Sep", vat: "10 Sep", other: "QPD 3 — return 20 Sep; pay 25 Sep (30%)" },
  { m: "Oct", paye: "9 Oct (10th is Sat)", vat: "9 Oct (10th is Sat)", other: "" },
  { m: "Nov", paye: "10 Nov", vat: "10 Nov", other: "" },
  { m: "Dec", paye: "10 Dec", vat: "10 Dec", other: "QPD 4 — return 20 Dec; pay 20 Dec (35%; Sun)" },
];

const faq = [
  {
    question: "What are the QPD dates for 2026 in Zimbabwe?",
    answer:
      "Quarterly Payment Dates for 2026 are 25 March (10%), 25 June (25%), 25 September (30%) and 20 December (35%) of estimated annual tax. Under SI 81 of 2025 the QPD return (ITF12B) is due by the 20th of each payment month, and the payment itself falls due on the 25th (20 December for QPD 4) per Public Notice 17 of 2026 and ZIMRA's Tax Payment Calendar.",
  },
  {
    question: "When is PAYE due to ZIMRA?",
    answer: "PAYE (Employees' Tax) is due by the 10th day of the month following the month in which salaries were paid.",
  },
  {
    question: "When are VAT returns due in Zimbabwe?",
    answer:
      "Under the Finance (Due Dates for Submission of Returns) Regulations, 2025 (SI 81 of 2025), effective 28 August 2025, the VAT return is due by the 10th day of the month following the tax period. The VAT payment is due shortly afterwards: recent monthly public notices (e.g. Public Notice 43 of 2026) set the payment date at the 15th, while some earlier 2026 notices listed it at the 10th. Confirm the current month's notice in TaRMS before filing.",
  },
  {
    question: "What happens if I miss a ZIMRA deadline?",
    answer:
      "Late returns and late payments attract penalties and interest, and can block your tax clearance certificate (ITF263) — which is required for tenders, supplier accounts and bank facilities. Engage ZIMRA before the deadline to arrange a payment plan if you cannot pay on time.",
  },
  {
    question: "What happens if I underpay my QPD?",
    answer:
      "If your actual tax liability is underestimated by more than 10%, interest applies on the underpayment at the prescribed rate. Slightly overestimating and claiming a refund is safer than underpaying.",
  },
  {
    question: "When is the annual income tax return due?",
    answer: "The annual income tax return is due on or before 30 April following the end of the tax year (31 December).",
  },
];

export default function ZimraTaxCalendarPage() {
  const jsonLd = faqPageSchema(faq);

  return (
    <div className="container max-w-3xl py-8 md:py-16">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
        Free Guide
      </div>
      <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
        ZIMRA Tax Deadline Calendar 2026
      </h1>
      <p className="text-muted-foreground mb-8">
        The 2026 filing calendar for Zimbabwean businesses: quarterly payment dates (QPDs), monthly PAYE and VAT
        deadlines, annual returns, and penalties. Dates follow ZIMRA&apos;s official Tax Payment Calendar and current
        public notices — always confirm the latest notice before filing.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="font-headline text-xl font-bold mb-3">2026 Deadlines at a Glance</h2>
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Tax</th>
                  <th className="text-left p-3 font-medium">Due Date</th>
                  <th className="text-left p-3 font-medium">Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr><td className="p-3">PAYE (Employees&apos; Tax)</td><td className="p-3 font-medium">10th of the following month</td><td className="p-3 text-muted-foreground">Monthly</td></tr>
                <tr><td className="p-3">VAT</td><td className="p-3 font-medium">Return: 10th of following month; payment by the 15th (SI 81/2025)</td><td className="p-3 text-muted-foreground">Monthly</td></tr>
                <tr><td className="p-3">QPD 1 (10%)</td><td className="p-3 font-medium">25 March 2026</td><td className="p-3 text-muted-foreground">Quarterly</td></tr>
                <tr><td className="p-3">QPD 2 (25%)</td><td className="p-3 font-medium">25 June 2026</td><td className="p-3 text-muted-foreground">Quarterly</td></tr>
                <tr><td className="p-3">QPD 3 (30%)</td><td className="p-3 font-medium">25 September 2026</td><td className="p-3 text-muted-foreground">Quarterly</td></tr>
                <tr><td className="p-3">QPD 4 (35%)</td><td className="p-3 font-medium">20 December 2026</td><td className="p-3 text-muted-foreground">Quarterly</td></tr>
                <tr><td className="p-3">Annual Income Tax Return</td><td className="p-3 font-medium">30 April</td><td className="p-3 text-muted-foreground">Annual</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold mb-3">Quarterly Payment Dates (QPDs)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            QPDs are advance payments of estimated annual income tax for income not fully covered by third-party
            withholding. Percentages are of estimated annual tax liability.
          </p>
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">QPD</th>
                  <th className="text-left p-3 font-medium">Due Date</th>
                  <th className="text-left p-3 font-medium">% of Annual Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr><td className="p-3">QPD 1</td><td className="p-3 font-medium">25 March 2026</td><td className="p-3 text-muted-foreground">10%</td></tr>
                <tr><td className="p-3">QPD 2</td><td className="p-3 font-medium">25 June 2026</td><td className="p-3 text-muted-foreground">25%</td></tr>
                <tr><td className="p-3">QPD 3</td><td className="p-3 font-medium">25 September 2026</td><td className="p-3 text-muted-foreground">30%</td></tr>
                <tr><td className="p-3">QPD 4</td><td className="p-3 font-medium">20 December 2026</td><td className="p-3 text-muted-foreground">35%</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            In 2026, returns and payments are filed separately: under SI 81 of 2025 the QPD return (ITF12B) is due by the
            20th of each payment month, then the payment itself falls due on the date above (Public Notice 17 of 2026).
            Confirm both dates in the latest notice before filing.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold mb-3">Month by Month — Full 2026 Calendar</h2>
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Month</th>
                  <th className="text-left p-3 font-medium">PAYE (due 10th)</th>
                  <th className="text-left p-3 font-medium">VAT return (due 10th)</th>
                  <th className="text-left p-3 font-medium">QPD &amp; Other</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {monthByMonth.map((row) => (
                  <tr key={row.m}>
                    <td className="p-3">{row.m}</td>
                    <td className="p-3">{row.paye}</td>
                    <td className="p-3">{row.vat}</td>
                    <td className="p-3 text-muted-foreground">{row.other || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Where a due date falls on a weekend or public holiday, common practice is to file on the nearest preceding
            business day (the nominal date is shown in brackets). Confirm adjusted dates with your tax adviser. The VAT
            payment falls due a few days after the 10th return date (recent 2026 notices: the 15th) — confirm the
            current month&apos;s notice in TaRMS.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold mb-3">Other Tax Deadlines</h2>
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Tax</th>
                  <th className="text-left p-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr><td className="p-3">Withholding tax (resident interest, non-resident fees/remittances/royalties)</td><td className="p-3 font-medium">Within 10 days of payment/crediting</td></tr>
                <tr><td className="p-3">Non-resident shareholders&apos; tax</td><td className="p-3 font-medium">Within 30 days of payment/crediting</td></tr>
                <tr><td className="p-3">Withholding amounts under contracts</td><td className="p-3 font-medium">10th of the following month</td></tr>
                <tr><td className="p-3">Automated Financial Transactions Tax (AFTT) &amp; IMTT</td><td className="p-3 font-medium">10th of the month following the transaction</td></tr>
                <tr><td className="p-3">Stamp duty</td><td className="p-3 font-medium">10th of the following month</td></tr>
                <tr><td className="p-3">Betting tax</td><td className="p-3 font-medium">25th of the following month</td></tr>
                <tr><td className="p-3">Excise duty (manufacturers)</td><td className="p-3 font-medium">20th of each month</td></tr>
                <tr><td className="p-3">Informal trader&apos;s presumptive tax</td><td className="p-3 font-medium">Within 30 days of amount recovered</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold mb-3">Annual Deadlines</h2>
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Return</th>
                  <th className="text-left p-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr><td className="p-3">Income Tax Return (ITF12C) for the 2025 tax year</td><td className="p-3 font-medium">30 April 2026</td></tr>
                <tr><td className="p-3">Income Tax Return (ITF12C) for the 2026 tax year</td><td className="p-3 font-medium">30 April 2027</td></tr>
                <tr><td className="p-3">PAYE reconciliation (P16)</td><td className="p-3 font-medium">Annually — confirm current deadline</td></tr>
                <tr><td className="p-3">NSSA Annual Return</td><td className="p-3 font-medium">Annually — confirm current deadline</td></tr>
                <tr><td className="p-3">PRAZ Renewal</td><td className="p-3 font-medium">Annually from expiry date</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold mb-3">Missing a Deadline: The Cost</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Missing a deadline compounds quickly and can block the tax clearance certificate (ITF263) you need for
            tenders, supplier accounts and bank facilities:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              <strong>QPD underestimation:</strong> underpaying your quarterly instalments by more than 10% attracts
              interest at the prescribed rate on the shortfall.
            </li>
            <li>
              <strong>Late returns and payments:</strong> attract penalties plus interest that continue to accrue until
              settled.
            </li>
            <li>
              <strong>Payroll (PAYE):</strong> failure to deduct and remit in time carries the heaviest consequences —
              confirm the current penalty rates with your tax adviser.
            </li>
            <li>
              <strong>Payment plans:</strong> if you cannot pay on time, approach ZIMRA before the deadline to arrange a
              payment plan rather than missing it silently.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold mb-3">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <div key={item.question} className="rounded-xl border border-border/50 p-4">
                <h3 className="font-headline font-semibold mb-1">{item.question}</h3>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold mb-3">Confirm Before Filing</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tax dates and rules change. Cross-check every filing against the latest sources:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>
              <a className="underline decoration-primary/40 underline-offset-4 hover:text-primary" href="https://www.zimra.co.zw/domestic-taxes/tax-payment-dates" target="_blank" rel="noopener noreferrer">
                ZIMRA Tax Payment Calendar
              </a>{" "}
              — the official standing payment schedule.
            </li>
            <li>
              <a className="underline decoration-primary/40 underline-offset-4 hover:text-primary" href="https://www.zimra.co.zw/public-notices" target="_blank" rel="noopener noreferrer">
                ZIMRA Public Notices
              </a>{" "}
              — current-year notices that override or detail the standing calendar.
            </li>
            <li>Your tax adviser or accountant, who sees the latest guidance in context.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h2 className="font-headline text-lg font-bold mb-2">Never Miss a Deadline Again</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Radbit sends you automated reminders 30, 14, and 7 days before every tax deadline.
            Sign up free and connect your business profile.
          </p>
          <a
            href="/sign-up"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Get Deadline Reminders Free
          </a>
        </section>
      </div>
    </div>
  );
}