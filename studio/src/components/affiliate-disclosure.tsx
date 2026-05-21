import { go } from '@/lib/affiliate';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function AffiliateDisclosure() {
  return (
    <div className="text-xs text-muted-foreground/50 mt-8 border-t border-border/20 pt-4">
      <p className="mb-2">
        Some links on this page are affiliate links. If you purchase through these links, we may
        earn a small commission at no extra cost to you. We only recommend services we believe add
        value to Zimbabwean SMEs.
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <Link href={go('ecocash-business')} rel="nofollow sponsored" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
          EcoCash Business <ExternalLink className="h-3 w-3" />
        </Link>
        <Link href={go('paynow')} rel="nofollow sponsored" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
          PayNow <ExternalLink className="h-3 w-3" />
        </Link>
        <Link href={go('zimra')} className="hover:text-foreground transition-colors inline-flex items-center gap-1">
          ZIMRA <ExternalLink className="h-3 w-3" />
        </Link>
        <Link href={go('rbz')} className="hover:text-foreground transition-colors inline-flex items-center gap-1">
          Reserve Bank <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
