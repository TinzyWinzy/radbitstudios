
'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { moderateCommunityContent } from '@/ai/flows/moderate-community-content';
import { AuthContext } from '@/contexts/auth-context';
import { z } from 'zod';

const threadSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title is too long'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000, 'Content is too long'),
  tags: z.string().max(200, 'Tags are too long').optional(),
});

export default function NewThreadPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const handleCreateThread = async () => {
    const validation = threadSchema.safeParse({ title, content, tags });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({ title: 'Validation Error', description: firstError.message, variant: 'destructive' });
      return;
    }

    if (!user) {
        toast({
            title: 'Authentication Error',
            description: 'You must be logged in to create a thread.',
            variant: 'destructive'
        });
        return;
    }

    setIsLoading(true);

    try {
      // Moderate content
      const moderationResult = await moderateCommunityContent({ text: `${title} ${content}` });
      if (!moderationResult.isSafe) {
        toast({
          title: 'Inappropriate Content',
          description: moderationResult.reason || 'Your post violates our community guidelines.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const threadData = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        authorId: user.uid,
        authorName: user.displayName || 'SME User',
        authorAvatar: user.photoURL || null,
        createdAt: serverTimestamp(),
        lastReplyAt: null,
        replyCount: 0,
      };

      await addDoc(collection(db, 'threads'), threadData);

      toast({
        title: 'Thread Created!',
        description: 'Your new thread has been posted successfully.',
      });

      // Redirect back to the community page
      router.push('/community');

    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: 'Error',
        description: 'Could not create the thread. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
       <div>
         <Button variant="ghost" asChild>
          <Link href="/community">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forum
          </Link>
        </Button>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Create a New Thread</CardTitle>
          <CardDescription>Share your thoughts and questions with the community. Be respectful and constructive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Thread Title</Label>
            <Input 
              id="title" 
              placeholder="What's the main topic of your post?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Your Question or Message</Label>
            <Textarea
              id="content"
              placeholder="Elaborate on your topic..."
              className="h-40"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input 
              id="tags" 
              placeholder="e.g., Marketing, Finance, Suppliers"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isLoading}
            />
             <p className="text-xs text-muted-foreground">Adding relevant tags helps others find your post.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateThread} disabled={isLoading || !user}>
            <Send className="mr-2 h-4 w-4" />
            {isLoading ? 'Posting...' : 'Post Thread'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
