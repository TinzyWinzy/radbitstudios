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
  Newspaper, Clock, ExternalLink, Search, Bookmark,
  TrendingUp, AlertTriangle, Loader2, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/contexts/auth-context';
import { getLatestNewsAction as getLatestNews } from '@/app/actions';
import { generatePersonalizedBrief } from '@/ai/flows/generate-personalized-brief';
import { formatDistanceToNow } from 'date-fns';
import type { NewsArticle } from '@/types/news';

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  policy: { label: 'Policy', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  finance: { label: 'Finance', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  technology: { label: 'Technology', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  business: { label: 'Business', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  regulatory: { label: 'Regulatory', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  general: { label: 'General', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
};

const INDUSTRY_BADGE_COLORS = [
  'bg-primary/10 text-primary border-primary/20',
  'bg-secondary/10 text-secondary border-secondary/20',
  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
];

function NewsCard({ article, onBookmark }: { article: NewsArticle & { bookmarked?: boolean }; onBookmark?: () => void }) {
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
              <Badge variant="default" className="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
                <Zap className="h-3 w-3 mr-0.5" />{avgScore} impact
              </Badge>
            )}
            {avgScore !== null && avgScore < 70 && avgScore >= 40 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {avgScore} impact
              </Badge>
            )}
            {article.industryTags.slice(0, 2).map((tag, i) => (
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
        {onBookmark && (
          <Button variant="ghost" size="icon" onClick={onBookmark} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark className={cn('h-4 w-4', article.bookmarked && 'fill-primary text-primary')} />
            <span className="sr-only">Bookmark</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NewsPage() {
  const { user } = useContext(AuthContext);
  const [allNews, setAllNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [briefLoading, setBriefLoading] = useState(false);
  const [brief, setBrief] = useState<Awaited<ReturnType<typeof generatePersonalizedBrief>> | null>(null);

  const loadNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const news = await getLatestNews({ limit: 100, industry: user?.industry || undefined });
      setAllNews(news);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.industry]);

  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 120000);
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
      console.error('Error generating brief:', error);
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
          article.industryTags.some(t => t.toLowerCase().includes(q))
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Newspaper className="h-7 w-7 text-primary" />
            Business News
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time news from Zimbabwe, Africa, and global markets — curated for your industry.
          </p>
        </div>
        {hasProfile && (
          <Button
            onClick={handleGenerateBrief}
            disabled={briefLoading}
            className="gap-2"
          >
            {briefLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {briefLoading ? 'Generating...' : 'AI Brief for My Business'}
          </Button>
        )}
      </div>

      {brief && (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Your Personalized Brief</CardTitle>
              <Badge variant="default" className="ml-auto bg-primary text-primary-foreground text-xs">AI Generated</Badge>
            </div>
            <CardDescription>{brief.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {brief.topStories.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Top Stories for Your Business</h4>
                <div className="space-y-2">
                  {brief.topStories.map((story, i) => (
                    <div key={i} className="p-3 bg-card rounded-lg border border-border/50">
                      <p className="font-medium text-sm">{story.headline}</p>
                      <p className="text-xs text-muted-foreground mt-1">{story.whyItMatters}</p>
                      <p className="text-xs text-primary mt-1 font-medium">{story.actionStep}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {brief.relevantTenders.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Tender Opportunities</h4>
                <div className="space-y-1.5">
                  {brief.relevantTenders.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-card rounded-lg border border-border/50 text-sm">
                      <div>
                        <p className="font-medium">{t.title}</p>
                        <p className="text-xs text-muted-foreground">Deadline: {t.deadline}</p>
                      </div>
                      <span className="text-xs text-primary font-medium">Apply</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

          <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search news, sources, industries..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={async () => { await fetch('/api/scraper/news', { method: 'POST' }); loadNews(); }}>
                <Loader2 className="h-3 w-3 mr-1" />
                Refresh
              </Button>
              {!hasProfile && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Complete your business profile in Settings to get personalized news</span>
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
                  className="text-xs capitalize"
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
                    <NewsCard
                      key={article.id}
                      article={article}
                      onBookmark={() => {}}
                    />
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
                    onClick={async () => {
                      await fetch('/api/scraper/news', { method: 'POST' });
                      window.location.reload();
                    }}
                  >
                    Trigger News Refresh
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