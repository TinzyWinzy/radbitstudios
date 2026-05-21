import { useRouter } from 'next/navigation';
import { subscriptionPlans } from '@/lib/subscriptions';
import type { AppUser } from '@/types/user';

const FEATURE_LABELS: Record<string, { label: string; icon: string }> = {
  assessmentSummary: { label: 'Assessments', icon: '📊' },
  templateGeneration: { label: 'Templates', icon: '📄' },
  mentorChat: { label: 'Mentor Messages', icon: '💬' },
  dashboardInsights: { label: 'Daily Insights', icon: '💡' },
  tendersCuration: { label: 'Tender Curations', icon: '📋' },
  logoGeneration: { label: 'Logo Designs', icon: '🎨' },
};

export function UsageSummary({ user }: { user: AppUser | null }) {
  const router = useRouter();
  if (!user) return null;
  const plan = user.plan || 'Free';
  const usage = user.usage || {};
  const planConfig = subscriptionPlans.find(p => p.name === plan);

  if (!planConfig) return null;

  const creditKeys = Object.keys(planConfig.credits) as (keyof typeof planConfig.credits)[];
  const upgradePath = plan === 'Free' ? { name: 'Growth', price: 5 } : plan === 'Growth' ? { name: 'Pro', price: 15 } : null;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline font-semibold">Usage Summary</h3>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {plan}
        </span>
      </div>

      <div className="space-y-3">
        {creditKeys.map(key => {
          const creds = usage[key as string];
          const info = FEATURE_LABELS[key as string];
          if (!creds || !info) return null;
          const remaining = creds.remaining ?? 0;
          const total = creds.total ?? 0;
          const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
          const isLow = remaining <= Math.floor(total * 0.2) || remaining <= 2;

          return (
            <div key={key as string}>
              <div className="flex justify-between text-xs mb-1">
                <span>{info.icon} {info.label}</span>
                <span className={isLow ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                  {remaining}/{total}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isLow ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {upgradePath && (
        <button
          onClick={() => router.push('/settings?tab=plan')}
          className="mt-4 w-full rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium py-2 px-3 transition-colors"
        >
          Upgrade to {upgradePath.name} — ${upgradePath.price}/mo
        </button>
      )}
    </div>
  );
}
