"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MarketSnapshot } from "@/app/actions";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function MarketSnapshotCard() {
  const [data, setData] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const { getMarketSnapshotAction } = await import("@/app/actions");
      const result = await getMarketSnapshotAction();
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isStale = data && (Date.now() - new Date(data.fetchedAt).getTime() > 60 * 60 * 1000);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Market Snapshot</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isStale && (
              <span className="flex items-center gap-1 text-[10px] text-amber-500">
                <AlertTriangle className="h-3 w-3" />
                Stale
              </span>
            )}
            <Button size="sm" variant="ghost" onClick={fetchData} disabled={loading} className="h-7 w-7 p-0">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <CardDescription className="text-xs">
          {data ? `Updated ${formatTime(data.fetchedAt)}` : "Zimbabwe market data"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-4 space-y-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-xs text-muted-foreground">Could not load market data.</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="h-7 text-xs">
              Retry
            </Button>
          </div>
        ) : data ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Official ZiG/USD */}
            <MetricCard
              label="Official Rate"
              value={`${data.exchangeRates.officialZiGPerUSD.toFixed(2)} ZiG`}
              sub="per 1 USD"
            />
            {/* Black Market Buy */}
            <MetricCard
              label="Black Market (Buy)"
              value={`${data.exchangeRates.blackMarketBuyZiGPerUSD.toFixed(2)} ZiG`}
              sub="per 1 USD"
            />
            {/* Black Market Sell */}
            <MetricCard
              label="Black Market (Sell)"
              value={`${data.exchangeRates.blackMarketSellZiGPerUSD.toFixed(2)} ZiG`}
              sub="per 1 USD"
            />
            {/* Gold Price */}
            <MetricCard
              label="Gold Price"
              value={`$${data.economicIndicators.goldPriceUSD.toLocaleString()}`}
              sub="per oz"
            />
            {/* RBZ Policy Rate */}
            <MetricCard
              label="RBZ Policy Rate"
              value={`${data.economicIndicators.rbzPolicyRate}%`}
              sub={
                data.economicIndicators.cpiMonthOverMonth !== null
                  ? `CPI: ${data.economicIndicators.cpiMonthOverMonth.toFixed(2)}% (MoM)`
                  : undefined
              }
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-1">
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}
