
'use client';

import { useState, useContext, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Zap, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { curateTendersNews, CurateTendersNewsOutput } from '@/ai/flows/curate-tenders-news';
import { cn } from '@/lib/utils';
import { AuthContext } from '@/contexts/auth-context';
import { db } from '@/lib/firebase/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, serverTimestamp, query } from 'firebase/firestore';
import { checkAndDecrementUsage } from '@/services/usage-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';


type Article = CurateTendersNewsOutput['articles'][0];
type ArticleWithBookmark = Article & { bookmarked: boolean; bookmarkId?: string };

function ArticleItem({ article, onBookmarkToggle, isBookmarkedView = false }: { article: ArticleWithBookmark, onBookmarkToggle: () => void, isBookmarkedView?: boolean }) {
  return (
    <div>
        <div className="flex justify-between items-start">
            <div className="space-y-1.5 flex-1">
                <p className="font-semibold text-lg">{article.title}</p>
                <p className="text-sm text-muted-foreground">{article.summary}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <Badge variant="secondary">{article.category}</Badge>
                    {article.expiryDate && (
                        <span className="text-destructive">Expires: {article.expiryDate}</span>
                    )}
                     <a href={article.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                        Source <ExternalLink className="h-3 w-3" />
                     </a>
                </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="icon" onClick={onBookmarkToggle}>
                    <Bookmark className={cn("h-5 w-5", (article.bookmarked || isBookmarkedView) && "fill-primary text-primary")} />
                    <span className="sr-only">Bookmark</span>
                </Button>
            </div>
        </div>
    </div>
  )
}

export default function TendersPage() {
  const { user, refreshUserData } = useContext(AuthContext);
  const { toast } = useToast();
  
  const [contentToProcess, setContentToProcess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [curatedArticles, setCuratedArticles] = useState<ArticleWithBookmark[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Map<string, {id: string, article: Article}>>(new Map());
  const [isSyncingBookmarks, setIsSyncingBookmarks] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setIsSyncingBookmarks(false);
      return;
    };
    setIsSyncingBookmarks(true);
    try {
      const bookmarksColRef = collection(db, 'users', user.uid, 'bookmarks');
      const q = query(bookmarksColRef);
      const querySnapshot = await getDocs(q);
      const bookmarks = new Map<string, {id: string, article: Article}>();
      querySnapshot.forEach(doc => {
        const articleData = doc.data() as Article;
        // Use source as the key if available, otherwise title
        const key = articleData.source || articleData.title;
        bookmarks.set(key, {id: doc.id, article: articleData});
      });
      setBookmarkedArticles(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      toast({ title: "Error", description: "Could not fetch your saved bookmarks.", variant: "destructive" });
    } finally {
      setIsSyncingBookmarks(false);
    }
  }, [user, toast]);
  
  const handleCurate = useCallback(async () => {
    if (!contentToProcess.trim() || !user) {
      toast({ title: "Missing Content", description: "Please paste the content you want to curate.", variant: "destructive"});
      return;
    }

    setIsLoading(true);
    setCuratedArticles([]);

    try {
      const usageResult = await checkAndDecrementUsage(user.uid, 'tendersCuration');
      if (!usageResult.success) {
        toast({ title: "Usage Limit Reached", description: usageResult.message, variant: 'destructive'});
        setIsLoading(false);
        return;
      }
      await refreshUserData();
      
      const response = await curateTendersNews({ 
          content: contentToProcess,
          userQuery: `My business is in the ${(user as any).industry || 'general business'} sector.`,
       });
      let articles: Article[] = (response && response.articles) ? response.articles : [];
      
      const articlesWithBookmarks = articles.map(article => {
        const key = article.source || article.title;
        const bookmarkInfo = bookmarkedArticles.get(key);
        return { 
          ...article, 
          bookmarked: !!bookmarkInfo,
          bookmarkId: bookmarkInfo?.id
        };
      });
      setCuratedArticles(articlesWithBookmarks);

    } catch (error) {
      console.error('Error curating content:', error);
      toast({
        title: 'Curation Failed',
        description: 'An error occurred while processing the content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [contentToProcess, toast, user, bookmarkedArticles, refreshUserData]);

  useEffect(() => {
    if(user) {
        fetchBookmarks();
    } else {
        setIsSyncingBookmarks(false);
    }
  }, [user, fetchBookmarks]);
  
  const toggleBookmark = async (article: ArticleWithBookmark) => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to bookmark articles.", variant: "destructive"});
        return;
    }

    const key = article.source || article.title;
    const isBookmarked = bookmarkedArticles.has(key);

    try {
      if (!isBookmarked) {
        const bookmarkDocRef = doc(collection(db, 'users', user.uid, 'bookmarks'));
        const { bookmarked, bookmarkId, ...articleToSave } = article;
        await setDoc(bookmarkDocRef, { ...articleToSave, savedAt: serverTimestamp() });
        toast({ title: "Bookmarked!", description: `"${article.title}" has been saved.`});
      } else {
        const bookmarkInfo = bookmarkedArticles.get(key);
        if (bookmarkInfo) {
            const bookmarkDocRef = doc(db, 'users', user.uid, 'bookmarks', bookmarkInfo.id);
            await deleteDoc(bookmarkDocRef);
            toast({ title: "Bookmark Removed", description: `"${article.title}" has been removed from your saved list.`});
        }
      }
      
      await fetchBookmarks();

    } catch(e) {
      console.error("Error toggling bookmark:", e);
      toast({ title: "Error", description: "Could not update your bookmark. Please try again.", variant: "destructive" });
    }
  };

  useEffect(() => {
    const articlesWithBookmarks = curatedArticles.map(article => {
        const key = article.source || article.title;
        const bookmarkInfo = bookmarkedArticles.get(key);
        return { 
          ...article, 
          bookmarked: !!bookmarkInfo,
          bookmarkId: bookmarkInfo?.id
        };
    });
    setCuratedArticles(articlesWithBookmarks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookmarkedArticles]);

  const bookmarkedArray: ArticleWithBookmark[] = Array.from(bookmarkedArticles.values()).map(b => ({...b.article, bookmarked: true, bookmarkId: b.id}));
  const remainingGenerations = (user as any)?.usage?.tendersCuration?.remaining ?? 0;

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Curate Content</CardTitle>
            <CardDescription>
              Paste article text below and the AI will analyze and filter it based on your business profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content to Curate</Label>
              <Textarea
                id="content"
                placeholder="Paste the full text of a news article or tender document here..."
                className="h-36"
                value={contentToProcess}
                onChange={(e) => setContentToProcess(e.target.value)}
                disabled={isLoading}
              />
               <p className="text-xs text-muted-foreground">Curation uses left: {remainingGenerations}</p>
            </div>
            <Button className="w-full" onClick={handleCurate} disabled={isLoading || remainingGenerations <= 0}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Zap className="mr-2 h-4 w-4" />}
              {isLoading ? 'Curating...' : 'Curate with AI'}
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
            <Tabs defaultValue="curated">
                <CardHeader>
                     <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="curated">Curated</TabsTrigger>
                        <TabsTrigger value="bookmarks">My Bookmarks</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent className="min-h-[400px]">
                    <TabsContent value="curated">
                        <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : curatedArticles.length > 0 ? (
                            curatedArticles.map((article, index) => (
                            <div key={index}>
                                <ArticleItem article={article} onBookmarkToggle={() => toggleBookmark(article)} />
                                {index < curatedArticles.length - 1 && <Separator className="mt-4" />}
                            </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-40">
                                <p className="text-muted-foreground text-center">
                                Paste content in the box and click &ldquo;Curate with AI&rdquo; to get started.
                                </p>
                            </div>
                        )}
                        </div>
                    </TabsContent>
                    <TabsContent value="bookmarks">
                         <div className="space-y-4">
                            {isSyncingBookmarks ? (
                                <div className="flex items-center justify-center h-40">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : bookmarkedArray.length > 0 ? (
                                bookmarkedArray.map((article, index) => (
                                    <div key={article.source || article.title}>
                                        <ArticleItem article={article} onBookmarkToggle={() => toggleBookmark(article)} isBookmarkedView={true} />
                                        {index < bookmarkedArray.length - 1 && <Separator className="mt-4" />}
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-40">
                                    <p className="text-muted-foreground text-center">
                                        You haven&apos;t bookmarked any articles yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </CardContent>
            </Tabs>
        </Card>
      </div>
    </div>
  );
}

    