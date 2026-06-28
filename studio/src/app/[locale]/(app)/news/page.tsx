'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Newspaper, Clock, ExternalLink, Search,
  TrendingUp, AlertTriangle, Loader2, Zap, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/contexts/auth-context';
import { getLatestNewsAction as getLatestNews } from '@/app/actions';
import { generatePersonalizedBrief } from '@/ai/flows/generate-personalized-brief';
import { formatDistanceToNow } from 'date-fns';
import type { NewsArticle } from '@/types/news';
import { createNotification } from "@/services/notifications/notifications-service";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  policy: { label: 'Policy', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  finance: { label: 'Finance', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
  technology: { label: 'Technology', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  business: { label: 'Business', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  regulatory: { label: 'Regulatory', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
  general: { label: 'General', color: 'bg-muted text-muted-foreground border-border' },
};

const INDUSTRY_BADGE_COLORS = [
  'bg-primary/10 text-primary border-primary/20',
  'bg-secondary/10 text-secondary border-secondary/20',
  'bg-green-500/10 text-green-400 border-green-500/20',
  'bg-blue-500/10 text-blue-400 border-blue-500/20',
];

function NewsCard({ article }: { article: NewsArticle }) {
  const cat = CATEGORY_LABELS[article.category] || CATEGORY_LABELS.general;
  const avgScore = article.impactScore && article.urgencyScore
    ? Math.round((article.impactScore + article.urgencyScore) / 2) : null;

  return (
    <div className="group p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className={cn('text-xs font-medium', cat.color)}>{cat.label}</Badge>
            {avgScore !== null && avgScore >= 70 && (
              <Badge variant="default" className="text-xs bg-amber-500/15 text-amber-400 border-amber-500/30">
                <Zap className="h-3 w-3 mr-0.5" />{avgScore} impact
              </Badge>
            )}
            {avgScore !== null && avgScore < 70 && avgScore >= 40 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {avgScore} impact
              </Badge>
            )}
            {(article.industryTags || []).slice(0, 2).map((tag, i) => (
              <Badge key={tag} variant="outline" className={cn('text-xs', INDUSTRY_BADGE_COLORS[i % INDUSTRY_BADGE_COLORS.length])}>
                {tag}
              </Badge>
            ))}
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </span>
          </div>
          <h3 className="font-headline font-semibold text-base leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {article.title}
            </a>
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-xs text-muted-foreground">{article.sourceName}</span>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              Read full article <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [briefLoading, setBriefLoading] = useState(false);
  const [brief, setBrief] = useState<Awaited<ReturnType<typeof generatePersonalizedBrief>> | null>(null);
  const [myIndustryOnly, setMyIndustryOnly] = useState(false);

  const loadNews = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      if (forceRefresh) {
        try {
          const r = await fetch('/api/scraper/news?force=true', { method: 'POST' });
          if (r.ok) {
            const data = await r.json();
            toast({
              title: "News refreshed",
              description: `Scraped ${data.scraped} new article${data.scraped === 1 ? '' : 's'}${data.errors > 0 ? ` (${data.errors} errors)` : ''}`,
            });
          } else {
            toast({
              title: "Refresh failed",
              description: `API returned ${r.status}. Try again later.`,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('[News] Failed to refresh news:', error);
          toast({
            title: "Refresh failed",
            description: "Could not reach the server. Check your connection.",
            variant: "destructive",
          });
        }
      }

      const opts: { limit: number; industry?: string } = { limit: 100 };
      if (myIndustryOnly && user?.industry) {
        opts.industry = user.industry;
      }
      const news = await getLatestNews(opts);
      setAllNews(news);
      if (user?.uid) {
        const lastVisit = localStorage.getItem('lastNewsVisit');
        const now = Date.now();
        if (lastVisit) {
          const cutoff = Number(lastVisit);
          const newArticles = news.filter((a: NewsArticle) => {
            const d = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            return d > cutoff;
          });
          if (newArticles.length > 0) {
            try {
              createNotification({
                userId: user.uid,
                title: 'New News Available',
                body: `${newArticles.length} new article${newArticles.length > 1 ? 's' : ''} matching your industry`,
                type: 'news',
                read: false,
                link: '/news',
              });
            } catch (e) {
              console.error('[News] Failed to create notification:', e);
            }
          }
        }
        localStorage.setItem('lastNewsVisit', String(now));
      }
    } catch (error) {
      console.error('[News] Error loading:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.industry, user?.uid, myIndustryOnly]);

  useEffect(() => {
    loadNews();
    // Poll every 5 minutes
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNews]);

  const handleGenerateBrief = async () => {
    if (!user) return;
    setBriefLoading(true);
    try {
      const result = await generatePersonalizedBrief({
        userId: user.uid,
        businessName: user?.businessName,
        industry: user?.industry,
        businessDescription: user?.businessDescription,
        focusArea: 'both',
      });
      setBrief(result);
    } catch (error) {
      console.error('[News] Brief generation failed:', error);
      toast({
        title: "Brief generation failed",
        description: "Could not generate your personalized brief. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBriefLoading(false);
    }
  };

  const filteredNews = allNews
    .filter(article => {
      if (activeCategory !== 'all' && article.category !== activeCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          article.title.toLowerCase().includes(q) ||
          article.summary.toLowerCase().includes(q) ||
          article.sourceName.toLowerCase().includes(q) ||
          article.industryTags?.some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aScore = (a.impactScore || 0) + (a.urgencyScore || 0);
      const bScore = (b.impactScore || 0) + (b.urgencyScore || 0);
      return bScore - aScore;
    });

  const categories = ['all', 'policy', 'finance', 'technology', 'business', 'regulatory'];
  const hasProfile = !!user?.industry;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            Business News
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time news from Zimbabwe, Africa, and global markets — curated for your industry.
          </p>
        </div>
        {hasProfile && (
          <Button
            onClick={handleGenerateBrief}
            disabled={briefLoading}
            size="sm"
            className="gap-1.5"
          >
            {briefLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {briefLoading ? 'Generating...' : 'AI Brief'}
          </Button>
        )}
      </div>

      {/* AI Brief */}
      {brief && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Your Personalized Brief</CardTitle>
              <Badge variant="default" className="ml-auto bg-primary text-primary-foreground text-[10px]">AI</Badge>
            </div>
            <CardDescription className="text-xs">{brief.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {brief.topStories.length > 0 && (
              <div>
                <h4 className="font-semibold text-xs mb-2">Top Stories</h4>
                <div className="space-y-2">
                  {brief.topStories.map((story, i) => (
                    <div key={i} className="p-2.5 bg-card rounded-lg border border-border/50">
                      <p className="font-medium text-xs">{story.headline}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{story.whyItMatters}</p>
                      {story.actionStep && (
                        <p className="text-[11px] text-primary mt-1 font-medium">→ {story.actionStep}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {brief.relevantTenders.length > 0 && (
              <div>
                <h4 className="font-semibold text-xs mb-2">Tender Opportunities</h4>
                <div className="space-y-1.5">
                  {brief.relevantTenders.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-card rounded-lg border border-border/50">
                      <div>
                        <p className="font-medium text-xs">{t.title}</p>
                        <p className="text-[10px] text-muted-foreground">Due: {t.deadline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* News List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news, sources, industries..."
                className="pl-8 h-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => loadNews(true)} disabled={isLoading} className="h-9 text-xs gap-1.5">
                <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
                Refresh
              </Button>
              {hasProfile ? (
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={myIndustryOnly}
                    onChange={(e) => setMyIndustryOnly(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span>My Industry</span>
                </label>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Complete your profile for personalized news</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className="text-xs capitalize h-9"
                >
                  {cat === 'all' ? 'All News' : CATEGORY_LABELS[cat]?.label || cat}
                </Button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">
                {filteredNews.length} articles
              </span>
            </div>

            <TabsContent value={activeCategory} className="mt-0">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-2 p-4 rounded-lg border">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredNews.length > 0 ? (
                <div className="space-y-3">
                  {filteredNews.map(article => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Newspaper className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-medium mb-1">No news found</p>
                  <p className="text-sm">
                    {searchQuery ? 'Try different search terms.' : 'News will appear here once sources are scraped.'}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => loadNews(true)}
                  >
                    <RefreshCw className="mr-2 h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
