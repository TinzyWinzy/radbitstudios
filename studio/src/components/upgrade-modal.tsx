import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import type { UpgradeInfo } from '@/services/feature-gate';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  upgrade: UpgradeInfo | null;
  onUpgrade?: () => void;
}

export function UpgradeModal({ open, onOpenChange, upgrade, onUpgrade }: UpgradeModalProps) {
  if (!upgrade || !upgrade.upgradeTo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 mb-2">
            <Sparkles className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">Upgrade to {upgrade.upgradeTo}</DialogTitle>
          <DialogDescription className="text-center">
            {upgrade.message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">{upgrade.feature}</p>
            <p className="text-3xl font-bold text-primary">
              ${upgrade.price}<span className="text-lg font-normal text-muted-foreground">/mo</span>
            </p>
          </div>

          <ul className="space-y-2 text-sm">
            {upgrade.upgradeTo === 'Growth' && (
              <>
                <li className="flex items-center gap-2"><ArrowUpRight className="size-4 text-primary shrink-0" />10x more assessment credits</li>
                <li className="flex items-center gap-2"><ArrowUpRight className="size-4 text-primary shrink-0" />Unlimited tenders & insights</li>
                <li className="flex items-center gap-2"><ArrowUpRight className="size-4 text-primary shrink-0" />Direct messaging with other SMEs</li>
              </>
            )}
            {upgrade.upgradeTo === 'Pro' && (
              <>
                <li className="flex items-center gap-2"><ArrowUpRight className="size-4 text-primary shrink-0" />Unlimited everything</li>
                <li className="flex items-center gap-2"><ArrowUpRight className="size-4 text-primary shrink-0" />Priority support</li>
                <li className="flex items-center gap-2"><ArrowUpRight className="size-4 text-primary shrink-0" />Community post analytics</li>
              </>
            )}
            {upgrade.upgradeTo === 'Enterprise' && (
              <li className="flex items-center gap-2"><ArrowUpRight className="size-4 text-primary shrink-0" />White-label reports & API access</li>
            )}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Button className="flex-1" onClick={onUpgrade}>
            Upgrade to {upgrade.upgradeTo} — ${upgrade.price}/mo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
