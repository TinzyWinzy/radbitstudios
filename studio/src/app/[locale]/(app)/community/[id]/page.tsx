
'use client';

import { useState, useEffect, useContext } from 'react';
import { useParams, notFound } from 'next/navigation';
import { db } from '@/lib/firebase/firebase';
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
  runTransaction,
  increment,
} from 'firebase/firestore';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, ThumbsUp, CheckCircle, Loader2, BarChart3, TrendingUp, MessageSquare, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { moderateCommunityContent } from '@/ai/flows/moderate-community-content';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthContext } from '@/contexts/auth-context';
import { checkFeatureAccess } from '@/services/feature-gate';
import { UpgradeModal } from '@/components/upgrade-modal';
import type { UpgradeInfo } from '@/services/feature-gate';


interface Thread {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  tags: string[];
  content: string;
  createdAt: Timestamp;
}

interface Reply {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    isBestAnswer: boolean;
    likes: number;
    createdAt: Timestamp;
}

export default function ThreadDetailPage() {
  const params = useParams();
  const threadId = params.id as string;
  const { user } = useContext(AuthContext);

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');

  const [isLoadingThread, setIsLoadingThread] = useState(true);
  const [isLoadingReplies, setIsLoadingReplies] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [analyticsAccess, setAnalyticsAccess] = useState<{ allowed: boolean; upgrade?: UpgradeInfo }>({ allowed: false });
  const [threadStats, setThreadStats] = useState({ totalReplies: 0, totalLikes: 0, avgReplyLength: 0 });

  const { toast } = useToast();

  useEffect(() => {
    document.title = 'Community - Radbit';
  }, []);

  useEffect(() => {
    if (!user) return;
    const checkAccess = async () => {
      const result = await checkFeatureAccess(user.uid, 'communityPostAnalytics');
      setAnalyticsAccess({ allowed: result.allowed, upgrade: result.upgrade });
    };
    checkAccess();
  }, [user]);

  useEffect(() => {
    if (!threadId) return;

    const threadDocRef = doc(db, 'threads', threadId);

    const unsubscribeThread = onSnapshot(threadDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            setThread({
                id: doc.id,
                title: data.title,
                authorId: data.authorId,
                authorName: data.authorName,
                authorAvatar: data.authorAvatar,
                tags: data.tags || [],
                content: data.content,
                createdAt: data.createdAt,
            });
            document.title = `${data.title} - Radbit`;
        } else {
            notFound();
        }
        setIsLoadingThread(false);
    });

    const repliesCollectionRef = collection(db, 'threads', threadId, 'replies');
    const q = query(repliesCollectionRef, orderBy('createdAt', 'asc'));

    const unsubscribeReplies = onSnapshot(q, (querySnapshot) => {
        const repliesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            authorId: doc.data().authorId,
            authorName: doc.data().authorName,
            content: doc.data().content,
            isBestAnswer: doc.data().isBestAnswer,
            likes: doc.data().likes || 0,
            createdAt: doc.data().createdAt,
            authorAvatar: doc.data().authorAvatar || `https://placehold.co/40x40`,
        })) as Reply[];
        setReplies(repliesData);
        setIsLoadingReplies(false);

        if (analyticsAccess.allowed) {
          const totalLikes = repliesData.reduce((sum, r) => sum + r.likes, 0);
          const avgLen = repliesData.length > 0
            ? Math.round(repliesData.reduce((sum, r) => sum + r.content.length, 0) / repliesData.length)
            : 0;
          setThreadStats({ totalReplies: repliesData.length, totalLikes, avgReplyLength: avgLen });
        }
    });

    return () => {
        unsubscribeThread();
        unsubscribeReplies();
    };
  }, [threadId, analyticsAccess.allowed]);


  const handlePostReply = async () => {
    if (!newReply.trim() || !user) return;

    setIsPosting(true);

    try {
        const moderationResult = await moderateCommunityContent({ text: newReply });
        if (!moderationResult.isSafe) {
            toast({
                title: 'Inappropriate Content',
                description: moderationResult.reason || 'Your reply violates our community guidelines.',
                variant: 'destructive',
            });
            setIsPosting(false);
            return;
        }
        
        const threadDocRef = doc(db, 'threads', threadId);
        const repliesCollectionRef = collection(threadDocRef, 'replies');

        await runTransaction(db, async (transaction) => {
            // Add the new reply
            transaction.set(doc(repliesCollectionRef), {
                authorId: user.uid,
                authorName: user.displayName || 'SME User',
                authorAvatar: user.photoURL,
                content: newReply,
                isBestAnswer: false,
                likes: 0,
                createdAt: serverTimestamp(),
            });

            // Update the parent thread document
            transaction.update(threadDocRef, {
                replyCount: increment(1),
                lastReplyAt: serverTimestamp()
            });
        });

        
        setNewReply('');

        toast({
            title: 'Reply Posted!',
            description: 'Your reply has been added to the thread.',
        });

    } catch (error) {
        console.error('Error posting reply:', error);
        toast({
            title: 'Error',
            description: 'Could not post your reply. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsPosting(false);
    }
  };
  
  const toggleBestAnswer = async (replyId: string) => {
    if (user?.uid !== thread?.authorId) {
        toast({
            title: 'Not Allowed',
            description: 'Only the author of the thread can mark the best answer.',
            variant: 'destructive',
        });
        return;
    }

    const batch = writeBatch(db);
    const repliesCollectionRef = collection(db, 'threads', threadId, 'replies');

    const currentBest = replies.find(r => r.isBestAnswer);
    const newBest = replies.find(r => r.id === replyId);

    // If there's a current best answer, unmark it
    if (currentBest) {
        const currentBestDocRef = doc(repliesCollectionRef, currentBest.id);
        batch.update(currentBestDocRef, { isBestAnswer: false });
    }

    // If the clicked reply is not the current best, mark it as best
    if (newBest && newBest.id !== currentBest?.id) {
        const newBestDocRef = doc(repliesCollectionRef, newBest.id);
        batch.update(newBestDocRef, { isBestAnswer: true });
    }

    try {
        await batch.commit();
    } catch (error) {
        console.error("Error updating best answer:", error);
        toast({
            title: 'Error',
            description: 'Could not update the best answer.',
            variant: 'destructive',
        });
    }
  }
  
  if (isLoadingThread) {
    return <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
            </CardContent>
        </Card>
    </div>
  }

  if (!thread) {
    notFound();
  }


  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" asChild>
          <Link href="/community">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{thread.title}</CardTitle>
          <CardDescription className="flex items-center gap-2 pt-1">
            Posted by {thread.authorName}
            <div className="flex gap-2">
              {thread.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{thread.content}</p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">{replies.length} Replies</h2>
        
        {isLoadingReplies ? (
            Array.from({length: 2}).map((_, i) => (
                 <Card key={i}>
                    <CardHeader className="flex-row items-center gap-3">
                         <Skeleton className="h-10 w-10 rounded-full" />
                         <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3 mt-2" />
                    </CardContent>
                 </Card>
            ))
        ) : (
            replies.map(reply => (
                <Card key={reply.id} className={cn(reply.isBestAnswer && "border-green-500 ring-2 ring-green-500")}>
                    <CardHeader className="flex-row items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={reply.authorAvatar || undefined} alt={reply.authorName || "User"} />
                                <AvatarFallback>{reply.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold">{reply.authorName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {reply.isBestAnswer && (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="mr-1 h-4 w-4"/> Best Answer
                                </Badge>
                            )}
                            {user?.uid === thread.authorId && (
                                <Button variant="ghost" size="sm" onClick={() => toggleBestAnswer(reply.id)} title="Mark as best answer">
                                    <CheckCircle className={cn("h-5 w-5", reply.isBestAnswer ? 'text-green-600' : 'text-muted-foreground')}/>
                                </Button>
                            )}
                            <Button variant="ghost" size="sm" disabled>
                                <ThumbsUp className="h-4 w-4 mr-2"/>
                                {reply.likes}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground">{reply.content}</p>
                    </CardContent>
                </Card>
            ))
        )}
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Post a Reply</CardTitle>
        </CardHeader>
        <CardContent>
            <Textarea
                placeholder="Share your thoughts..."
                className="h-32"
                value={newReply}
                onChange={e => setNewReply(e.target.value)}
                disabled={isPosting || !user}
            />
        </CardContent>
        <CardFooter>
            <Button onClick={handlePostReply} disabled={isPosting || !user || !newReply.trim()}>
                {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                {isPosting ? 'Posting...' : 'Post Reply'}
            </Button>
        </CardFooter>
      </Card>

      {analyticsAccess.allowed && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Community Analytics</CardTitle>
              <Badge variant="default" className="ml-auto bg-primary text-primary-foreground text-xs">Pro</Badge>
            </div>
            <CardDescription>Insights for this thread</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-3 rounded-lg bg-card">
                <MessageSquare className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl font-bold">{threadStats.totalReplies}</span>
                <span className="text-xs text-muted-foreground">Replies</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-card">
                <Heart className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl font-bold">{threadStats.totalLikes}</span>
                <span className="text-xs text-muted-foreground">Likes</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg bg-card">
                <TrendingUp className="h-5 w-5 text-primary mb-1" />
                <span className="text-2xl font-bold">{threadStats.avgReplyLength}</span>
                <span className="text-xs text-muted-foreground">Avg Length</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!analyticsAccess.allowed && analyticsAccess.upgrade && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium text-sm">Community Post Analytics</p>
                <p className="text-xs text-muted-foreground">Unlock insights on replies, likes & engagement</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.location.href = '/settings?tab=plan'}>
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      )}

      <UpgradeModal
        open={false}
        onOpenChange={() => {}}
        upgrade={analyticsAccess.upgrade ?? null}
        onUpgrade={() => window.location.href = '/settings?tab=plan'}
      />
    </div>
  );
}
