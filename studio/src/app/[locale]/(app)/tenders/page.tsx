'use client';

import { useState, useEffect, useContext } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase, Search, ExternalLink, Calendar, DollarSign, Building2,
  Clock, AlertCircle, CheckCircle, Loader2, RefreshCw,
  Bookmark, Zap, Globe, Lock, Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/contexts/auth-context';
import { getLatestTendersAction as getLatestTenders } from '@/app/actions';
import { format, differenceInDays } from 'date-fns';
import { checkFeatureAccess } from '@/services/feature-gate';
import type { UpgradeInfo } from '@/services/feature-gate';
import { UpgradeModal } from '@/components/upgrade-modal';
import { createNotification } from "@/services/notifications/notifications-service";

type Tender = {
  id: string;
  title: string;
  description: string;
  organization: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
  closingDate: Date | null;
  value: string | null;
  category: string;
  sector: string;
  region: string;
  requirements: string[];
  status: 'open' | 'closing_soon' | 'closed' | 'awarded';
  impactScore?: number;
  urgencyScore?: number;
  confidenceScore?: number;
};

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
  closing_soon: { label: 'Closing Soon', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: AlertCircle },
  awarded: { label: 'Awarded', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Building2 },
};

function TenderCard({ tender, onBookmark }: { tender: Tender & { bookmarked?: boolean }; onBookmark?: () => void }) {
  const statusCfg = STATUS_CONFIG[tender.status] || STATUS_CONFIG.open;
  const StatusIcon = statusCfg.icon;
  const daysLeft = tender.closingDate ? differenceInDays(new Date(tender.closingDate), new Date()) : null;

  return (
    <div className="group p-5 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className={cn('text-xs font-medium', statusCfg.color)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusCfg.label}
            </Badge>
            {tender.impactScore && tender.impactScore >= 70 && (
              <Badge variant="default" className="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
                <Zap className="h-3 w-3 mr-0.5" />{tender.impactScore} impact
              </Badge>
            )}
            {tender.impactScore && tender.impactScore < 70 && tender.impactScore >= 40 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {tender.impactScore} impact
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {tender.sector}
            </Badge>
            {tender.value && (
              <Badge variant="outline" className="text-xs text-green-700 dark:text-green-400">
                <DollarSign className="h-3 w-3 mr-0.5" />
                {tender.value}
              </Badge>
            )}
            {daysLeft !== null && daysLeft >= 0 && (
              <Badge variant="outline" className={cn('text-xs ml-auto', daysLeft <= 7 ? 'text-red-600 border-red-200' : 'text-muted-foreground')}>
                <Calendar className="h-3 w-3 mr-1" />
                {daysLeft === 0 ? 'Closes today' : `${daysLeft}d left`}
              </Badge>
            )}
          </div>

          <h3 className="font-headline font-semibold text-base leading-snug mb-1.5 group-hover:text-primary transition-colors">
            <a href={tender.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {tender.title}
            </a>
          </h3>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {tender.organization}
            </span>
            {tender.closingDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Closes {format(new Date(tender.closingDate), 'dd MMM yyyy')}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {tender.description}
          </p>

          {tender.requirements.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tender.requirements.slice(0, 3).map((req, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {req}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{tender.sourceName}</span>
            <a
              href={tender.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              View & Apply <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {onBookmark && (
          <Button variant="ghost" size="icon" onClick={onBookmark} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark className={cn('h-4 w-4', tender.bookmarked && 'fill-primary text-primary')} />
            <span className="sr-only">Bookmark</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TendersPage() {
  const { user } = useContext(AuthContext);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [regionTab, setRegionTab] = useState<'zimbabwe' | 'regional'>('zimbabwe');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState<UpgradeInfo | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  const [rawData, setRawData] = useState<any>(null);

  const sectorMap: Record<string, string> = {
    'Agriculture': 'Agriculture & Agribusiness',
    'Manufacturing': 'Manufacturing',
    'Technology': 'Information Technology',
    'Financial Services': 'Financial Services',
    'Healthcare': 'Healthcare',
    'Education': 'Education & Training',
    'Transport & Logistics': 'Transportation & Logistics',
    'Construction': 'Construction & Engineering',
    'Retail & Wholesale': 'Retail & Wholesale',
    'Professional Services': 'Professional Services',
  };

  const [mySectorOnly, setMySectorOnly] = useState(false);

  const loadTenders = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    setIsLoading(true);
    try {
      const opts: { limit: number; sector?: string } = { limit: 100 };
      if (mySectorOnly && user?.industry) {
        opts.sector = sectorMap[user.industry];
      }
      const data = await getLatestTenders(opts);
      setTenders(data);
      if (user?.uid) {
        const lastVisit = localStorage.getItem('lastTenderVisit');
        const now = Date.now();
        if (lastVisit) {
          const cutoff = Number(lastVisit);
          const newTenders = data.filter((t: Tender) => {
            const d = t.publishedAt ? new Date(t.publishedAt).getTime() : 0;
            return d > cutoff;
          });
          if (newTenders.length > 0) {
            try {
              createNotification({
                userId: user.uid,
                title: 'New Tenders Available',
                body: `${newTenders.length} new tender${newTenders.length > 1 ? 's' : ''} matching your industry`,
                type: 'tender',
                read: false,
                link: '/tenders',
              });
            } catch (e) {
              console.error('Failed to create tender notification:', e);
            }
          }
        }
        localStorage.setItem('lastTenderVisit', String(now));
      }
    } catch (error) {
      console.error('Error loading tenders:', error);
    } finally {
      setIsLoading(false);
      if (showRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTenders();
  }, [mySectorOnly, user?.uid]);

  const handleRefresh = async () => {
    try {
      const r = await fetch('/api/scraper/tenders');
      const d = await r.json();
      setRawData(d);
    } catch { /* fire and forget */ }
    await loadTenders(true);
  };

  const userPlan = user?.plan || 'Free';
  const isRegional = regionTab === 'regional';

  const filteredTenders = tenders
    .filter(t => {
      if (activeTab !== 'all' && t.status !== activeTab) return false;
      if (isRegional && t.region === 'Zimbabwe') return false;
      if (!isRegional && t.region !== 'Zimbabwe') return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.sector.toLowerCase().includes(q) ||
          t.organization.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aScore = (a.impactScore || 0) + (a.urgencyScore || 0);
      const bScore = (b.impactScore || 0) + (b.urgencyScore || 0);
      return bScore - aScore;
    });

  const openCount = tenders.filter(t => t.status === 'open').length;
  const closingCount = tenders.filter(t => t.status === 'closing_soon').length;
  const hasProfile = !!user?.industry;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-primary" />
            Tenders & Opportunities
          </h1>
          <p className="text-muted-foreground mt-2">
            Active government and corporate tender opportunities curated for Zimbabwean SMEs.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {isRefreshing ? 'Refreshing...' : 'Refresh Tenders'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowRawData(v => !v)}
          className="gap-2"
        >
          <Code className="h-4 w-4" />
          Raw
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openCount}</p>
              <p className="text-xs text-muted-foreground">Open Tenders</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-900">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Clock className="size-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{closingCount}</p>
              <p className="text-xs text-muted-foreground">Closing Soon</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <Zap className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tenders.filter(t => t.status !== 'closed').length}</p>
              <p className="text-xs text-muted-foreground">Total Active</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by sector, organization, keyword..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {!hasProfile && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                <AlertCircle className="h-4 w-4" />
                <span>Complete your profile for personalized tender matching</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {['all', 'open', 'closing_soon'].map(status => (
                <Button
                  key={status}
                  variant={activeTab === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab(status)}
                  className="text-xs capitalize"
                >
                  {status === 'all' ? 'All' : STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status}
                </Button>
              ))}
              {hasProfile && (
                <>
                  <div className="h-4 w-px bg-border mx-1" />
                  <Button
                    variant={mySectorOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMySectorOnly(v => !v)}
                    className="text-xs"
                  >
                    <Building2 className="h-3 w-3 mr-1" />
                    {mySectorOnly ? 'My Sector' : 'All Sectors'}
                  </Button>
                </>
              )}
              <div className="h-4 w-px bg-border mx-1" />
              <Button
                variant={regionTab === 'zimbabwe' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRegionTab('zimbabwe')}
                className="text-xs"
              >
                <Building2 className="h-3 w-3 mr-1" />
                Zimbabwe
              </Button>
              <Button
                variant={regionTab === 'regional' ? 'default' : 'outline'}
                size="sm"
                onClick={async () => {
                  if (userPlan === 'Free') {
                    if (user) {
                      const access = await checkFeatureAccess(user.uid, 'tendersRegional');
                      if (!access.allowed) {
                        setUpgradeInfo(access.upgrade ?? null);
                        return;
                      }
                    } else {
                      setUpgradeInfo({
                        upgradeTo: 'Growth',
                        price: 5,
                        message: 'SADC regional tenders require the Growth plan. Sign in and upgrade to unlock cross-border procurement opportunities.',
                        feature: 'Tenders Regional',
                      });
                      return;
                    }
                  }
                  setRegionTab('regional');
                }}
                className="text-xs"
              >
                <Globe className="h-3 w-3 mr-1" />
                SADC Region
                {userPlan === 'Free' && <Lock className="h-3 w-3 ml-1 text-muted-foreground" />}
              </Button>
              <span className="ml-auto text-xs text-muted-foreground">
                {filteredTenders.length} tenders
              </span>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-2 p-5 rounded-xl border">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredTenders.length > 0 ? (
                <div className="space-y-3">
                  {filteredTenders.map(tender => (
                    <TenderCard
                      key={tender.id}
                      tender={tender}
                      onBookmark={() => {}}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Briefcase className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium mb-1">No tenders found</p>
                  <p className="text-sm">
                    {searchQuery ? 'Try different search terms.' : 'Tenders will appear here once scraped.'}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showRawData && rawData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono">Raw Scraper Output</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowRawData(false)}>Close</Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <UpgradeModal
        open={!!upgradeInfo}
        onOpenChange={(o) => { if (!o) setUpgradeInfo(null); }}
        upgrade={upgradeInfo}
        onUpgrade={() => window.location.href = user ? '/settings?tab=plan' : '/sign-in'}
      />
    </div>
  );
}