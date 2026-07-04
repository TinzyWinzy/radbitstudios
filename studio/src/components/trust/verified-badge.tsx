import { ShieldCheck, Award, ExternalLink } from 'lucide-react';

interface VerifiedBadgeProps {
  level?: 'standard' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

export function VerifiedByRadbit({ level = 'standard', size = 'md', showDetails, className = '' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const iconSizes = { sm: 10, md: 14, lg: 16 };

  if (showDetails) {
    return (
      <div className={`inline-flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 ${className}`}>
        <div className="flex items-center gap-2">
          {level === 'premium' ? (
            <Award className="text-amber-500" size={20} />
          ) : (
            <ShieldCheck className="text-primary" size={20} />
          )}
          <div>
            <p className="font-semibold text-sm">Verified by Radbit</p>
            <p className="text-[11px] text-muted-foreground">
              {level === 'premium' ? 'Premium Verified Business' : 'Standard Verified'}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          This business has completed Radbit&apos;s verification process. Financials, compliance status, and operational records are independently verified.
        </p>
        <a href="/diaspora/invest" className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
          View snapshot <ExternalLink size={10} />
        </a>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full border border-primary/20 bg-primary/5 text-primary font-medium ${sizeClasses[size]} ${className}`}>
      {level === 'premium' ? (
        <Award size={iconSizes[size]} className="text-amber-500" />
      ) : (
        <ShieldCheck size={iconSizes[size]} />
      )}
      Verified by Radbit
    </span>
  );
}

export function ComplianceStatusBadge({ status }: { status: 'valid' | 'expiring' | 'expired' }) {
  const config = {
    valid: { label: 'Compliant', class: 'bg-green-500/10 text-green-600 border-green-500/20' },
    expiring: { label: 'Expiring Soon', class: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    expired: { label: 'Non-Compliant', class: 'bg-red-500/10 text-red-600 border-red-500/20' },
  };

  const c = config[status];
  return (
    <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${c.class}`}>
      {c.label}
    </span>
  );
}
