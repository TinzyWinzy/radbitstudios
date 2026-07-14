import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZIMRA Tax Deadline Calendar 2026 | Radbit",
  description: "A practical 2026 ZIMRA tax deadline guide for QPD dates, VAT return reminders, PAYE dates, and annual return planning.",
  alternates: { canonical: "/guides/zimra-tax-calendar-2026" },
};

export default function ZimraTaxCalendarPage() {
  return (
    <div className="container max-w-3xl py-8 md:py-16">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
        Free Guide
      </div>
      <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4">
        ZIMRA Tax Deadline Calendar 2026
      </h1>
      <p className="text-muted-foreground mb-8">
        A practical planning guide for common ZIMRA dates. Always confirm against the latest ZIMRA public notice or your tax adviser before filing.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="font-headline text-xl font-bold mb-3">Quarterly Payment Dates (QPDs)</h2>
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">QPD</th>
                  <th className="text-left p-3 font-medium">Due Date</th>
                  <th className="text-left p-3 font-medium">Covers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr><td className="p-3">QPD 1</td><td className="p-3 font-medium">25 March 2026</td><td className="p-3 text-muted-foreground">1 Jan - 31 Mar</td></tr>
                <tr><td className="p-3">QPD 2</td><td className="p-3 font-medium">25 June 2026</td><td className="p-3 text-muted-foreground">1 Apr - 30 Jun</td></tr>
                <tr><td className="p-3">QPD 3</td><td className="p-3 font-medium">25 September 2026</td><td className="p-3 text-muted-foreground">1 Jul - 30 Sep</td></tr>
                <tr><td className="p-3">QPD 4</td><td className="p-3 font-medium">25 December 2026</td><td className="p-3 text-muted-foreground">1 Oct - 31 Dec</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            QPD dates are commonly published through ZIMRA notices. Confirm penalties and interest against the latest ZIMRA guidance before advising clients.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold mb-3">VAT Return Deadlines (2026)</h2>
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Period</th>
                  <th className="text-left p-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <tr key={m}>
                    <td className="p-3">{m} 2026</td>
                    <td className="p-3 font-medium">10 {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan 2027'][i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Local 2026 ZIMRA notice extracts in this repository list VAT returns and payments as due on the 10th of each month.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-xl font-bold mb-3">PAYE (Monthly)</h2>
          <div className="overflow-hidden rounded-xl border border-border/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Month</th>
                  <th className="text-left p-3 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <tr key={m}>
                    <td className="p-3">{m} 2026</td>
                    <td className="p-3 font-medium">10 {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan 2027'][i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            PAYE covers the previous month&apos;s salaries. Due on the 10th of each month.
          </p>
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
                <tr><td className="p-3">Annual Income Tax Return (2025 tax year)</td><td className="p-3 font-medium">30 April 2026</td></tr>
                <tr><td className="p-3">Annual VAT Return</td><td className="p-3 font-medium">31 January 2027</td></tr>
                <tr><td className="p-3">NSSA Annual Return</td><td className="p-3 font-medium">31 March 2026</td></tr>
                <tr><td className="p-3">PRAZ Renewal</td><td className="p-3 font-medium">Annually from registration date</td></tr>
              </tbody>
            </table>
          </div>
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
