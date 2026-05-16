

'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, PlusCircle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Thread {
  id: string;
  title: string;
  authorName: string;
  authorAvatar?: string;
  replyCount: number;
  lastReplyAt: Date | null;
  tags: string[];
  createdAt: Date;
}

export default function CommunityPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      try {
        const threadsCollection = collection(db, 'threads');
        const q = query(threadsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const threadsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title,
            authorName: data.authorName,
            authorAvatar: data.authorAvatar || `https://placehold.co/40x40`,
            replyCount: data.replyCount || 0,
            tags: data.tags || [],
            createdAt: data.createdAt.toDate(),
            lastReplyAt: data.lastReplyAt ? data.lastReplyAt.toDate() : null,
          } as Thread;
        });
        setThreads(threadsData);
      } catch (error) {
        console.error("Error fetching threads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
        <p className="text-muted-foreground mt-2">
          Connect, share, and learn from fellow Zimbabwean entrepreneurs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search threads..." className="pl-8" />
            </div>
            <div className='flex gap-2'>
              <Button asChild>
                <Link href="/community/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Thread
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 py-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className='flex-1 space-y-2'>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                     <div className='text-right space-y-2'>
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
              ))
            ) : (
                threads.map((thread) => (
                <div key={thread.id} className="py-4">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar>
                        <AvatarImage src={thread.authorAvatar} alt={thread.authorName} />
                        <AvatarFallback>{thread.authorName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                        <Link href={`/community/${thread.id}`} className="font-medium hover:text-primary cursor-pointer">
                            {thread.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            by {thread.authorName} &middot; {formatDistanceToNow(thread.createdAt, { addSuffix: true })}
                        </p>
                        <div className="mt-1 flex gap-2">
                            {thread.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                            </Badge>
                            ))}
                        </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-sm font-medium">
                        <span>{thread.replyCount}</span>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {thread.lastReplyAt ? `${formatDistanceToNow(thread.lastReplyAt)} ago` : 'No replies yet'}
                        </p>
                    </div>
                    </div>
                </div>
                ))
            )}
            {!isLoading && threads.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    <p className="text-lg font-medium">No Threads Found</p>
                    <p>Be the first to start a conversation!</p>
                     <Button asChild className="mt-4">
                        <Link href="/community/new">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create New Thread
                        </Link>
                    </Button>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
