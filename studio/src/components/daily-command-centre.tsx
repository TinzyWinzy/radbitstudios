import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, CircleDashed } from "lucide-react";

type Props = {
  firstName: string;
  complianceScore: number | null;
  financialHealth: { score: number; details: string } | null;
  founderReputation: { score: number; status: string } | null;
  operations: { stockCount: number; deliveryCount: number; assetCount: number } | null;
  loading?: boolean;
};

type Signal = {
  label: string;
  value: string;
  detail: string;
  href?: string;
  state: "attention" | "stable" | "unknown";
};

function signalIcon(state: Signal["state"]) {
  if (state === "attention") return <CircleAlert aria-hidden="true" className="h-4 w-4 text-primary" />;
  if (state === "stable") return <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-[hsl(var(--radbit-mineral))]" />;
  return <CircleDashed aria-hidden="true" className="h-4 w-4 text-muted-foreground" />;
}

export function DailyCommandCentre({ firstName, complianceScore, financialHealth, founderReputation, operations, loading }: Props) {
  const signals: Signal[] = [
    {
      label: "Compliance",
      value: complianceScore === null ? "Not assessed" : `${complianceScore}/100`,
      detail: complianceScore === null ? "Establish your current standing" : complianceScore < 80 ? "Review outstanding requirements" : "Good standing",
      href: "/praz-compliance",
      state: complianceScore === null ? "unknown" : complianceScore < 80 ? "attention" : "stable",
    },
    {
      label: "Financial health",
      value: financialHealth ? `${financialHealth.score}/100` : "No data",
      detail: financialHealth?.details || "Add statements for a useful signal",
      state: !financialHealth ? "unknown" : financialHealth.score < 65 ? "attention" : "stable",
    },
    {
      label: "Founder reputation",
      value: founderReputation ? `${founderReputation.score}/100` : "Not rated",
      detail: founderReputation?.status || "Complete your public profile",
      state: !founderReputation ? "unknown" : founderReputation.score < 65 ? "attention" : "stable",
    },
    {
      label: "Operations",
      value: operations ? `${operations.stockCount + operations.deliveryCount + operations.assetCount} records` : "No records",
      detail: operations ? `${operations.stockCount} stock · ${operations.deliveryCount} deliveries · ${operations.assetCount} assets` : "Connect your operating activity",
      state: operations ? "stable" : "unknown",
    },
  ];

  const priority = signals.find(signal => signal.state === "attention") || signals.find(signal => signal.state === "unknown");

  return (
    <section aria-labelledby="command-centre-title" className="frost-surface overflow-hidden rounded-2xl">
      <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)]">
        <div className="flex min-h-[20rem] flex-col justify-between border-b border-border/70 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div>
            <p className="eyebrow">Today · Operating brief</p>
            <h1 id="command-centre-title" className="mt-5 max-w-xl font-headline text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Good to see you, {firstName}.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              {loading ? "Reading your latest business signals…" : priority ? `Your clearest next move is to address ${priority.label.toLowerCase()}.` : "Your core business signals are in good standing."}
            </p>
          </div>

          <div className="mt-10">
            <p className="eyebrow">Recommended action</p>
            {priority ? (
              <div className="mt-3 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-lg font-medium text-foreground">{priority.detail}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Resolve the highest-friction signal before exploring new tools.</p>
                </div>
                {priority.href && <Link href={priority.href} className="decision-link inline-flex min-h-11 shrink-0 items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Review now <ArrowRight className="h-4 w-4" /></Link>}
              </div>
            ) : <p className="mt-3 text-lg font-medium">Review current opportunities and tenders.</p>}
          </div>
        </div>

        <div className="divide-y divide-border/70 bg-background/20">
          <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-8"><p className="eyebrow">Business signals</p><Link href="/dashboard/actions" className="decision-link inline-flex items-center gap-1.5 text-xs font-semibold text-primary">Action Centre <ArrowRight className="h-3.5 w-3.5" /></Link></div>
          {signals.map((signal) => {
            const content = <><span className="flex min-w-0 items-start gap-3"><span className="mt-1">{signalIcon(signal.state)}</span><span className="min-w-0"><span className="block text-sm font-medium">{signal.label}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{loading ? "Updating…" : signal.detail}</span></span></span><span className="shrink-0 text-sm font-semibold tabular-nums">{loading ? "—" : signal.value}</span></>;
            return signal.href ? <Link key={signal.label} href={signal.href} className="decision-link flex min-h-[4.75rem] items-center justify-between gap-4 px-6 py-4 hover:bg-foreground/[0.035] sm:px-8">{content}</Link> : <div key={signal.label} className="flex min-h-[4.75rem] items-center justify-between gap-4 px-6 py-4 sm:px-8">{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
