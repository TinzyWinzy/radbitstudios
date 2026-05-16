
'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { db } from '@/lib/firebase/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDocs,
  runTransaction,
  Timestamp,
} from 'firebase/firestore';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Search, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthContext } from '@/contexts/auth-context';

interface DbUser {
  uid: string;
  displayName: string;
  photoURL: string;
}

interface Conversation {
  id: string;
  otherUser: DbUser;
  lastMessage: string;
  timestamp: Timestamp;
  unread: number;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

export default function MessagesPage() {
  const { user: currentUser } = useContext(AuthContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  // Fetch conversations
  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'conversations'), where('participants', 'array-contains', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      setIsLoadingConversations(true);

      const allUserIds = new Set<string>();
      querySnapshot.docs.forEach(doc => {
          doc.data().participants.forEach((p: string) => {
              if (p !== currentUser.uid) allUserIds.add(p);
          });
      });

      const usersData: { [key: string]: DbUser } = {};
      if (allUserIds.size > 0) {
          const usersQuery = query(collection(db, 'users'), where('uid', 'in', [...allUserIds]));
          const usersSnapshot = await getDocs(usersQuery);
          usersSnapshot.forEach(doc => {
              usersData[doc.id] = doc.data() as DbUser;
          });
      }


      const convosPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const otherUserId = data.participants.find((p: string) => p !== currentUser.uid);
        const otherUser = usersData[otherUserId] || { displayName: 'Unknown User', photoURL: '' };
        
        return {
          id: doc.id,
          otherUser: otherUser,
          lastMessage: data.lastMessage?.text || 'No messages yet.',
          timestamp: data.lastMessage?.timestamp || new Timestamp(0,0),
          unread: 0, // Unread count logic would be more complex
        };
      });

      const convos = await Promise.all(convosPromises);
      convos.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

      setConversations(convos as Conversation[]);
      setIsLoadingConversations(false);
      
      if (!selectedConversation && convos.length > 0) {
        setSelectedConversation(convos[0].id);
      }
    });

    return () => unsubscribe();
  }, [currentUser, selectedConversation]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    setIsLoadingMessages(true);
    const messagesQuery = query(
      collection(db, 'conversations', selectedConversation, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        senderId: doc.data().senderId,
        text: doc.data().text,
        timestamp: doc.data().timestamp,
      })) as Message[];
      setMessages(msgs);
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [selectedConversation]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollAreaRef.current) {
        setTimeout(() => {
             if (scrollAreaRef.current) {
                const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
                if (viewport) {
                    viewport.scrollTop = viewport.scrollHeight;
                }
             }
        }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    const msgValidation = z.string().min(1, 'Message cannot be empty').max(5000, 'Message is too long').safeParse(trimmed);
    if (!msgValidation.success || !selectedConversation || isSending || !currentUser) return;

    setIsSending(true);
    const text = input;
    setInput('');

    try {
        const conversationDocRef = doc(db, 'conversations', selectedConversation);
        const messagesColRef = collection(conversationDocRef, 'messages');

        await runTransaction(db, async (transaction) => {
            transaction.set(doc(messagesColRef), {
                senderId: currentUser.uid,
                text: text,
                timestamp: serverTimestamp(),
            });

            transaction.update(conversationDocRef, {
                lastMessage: {
                    text: text,
                    timestamp: serverTimestamp()
                }
            });
        });

    } catch (error) {
        console.error("Error sending message:", error);
        toast({
            title: "Error",
            description: "Could not send your message.",
            variant: "destructive",
        })
        setInput(text);
    } finally {
        setIsSending(false);
    }
  };
  
  const activeConversation = conversations.find(c => c.id === selectedConversation);

  if (!currentUser) {
      return <div className="flex h-full items-center justify-center"><p>Please log in to view messages.</p></div>
  }


  return (
    <div className="h-[calc(100vh-10rem)]">
      <Card className="h-full flex">
        <div className={cn("w-full md:w-1/3 border-r", selectedConversation && 'hidden md:flex flex-col')}>
            <CardHeader>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search conversations..." className="pl-8" />
                </div>
            </CardHeader>
            <ScrollArea className="flex-1">
                <div className='space-y-1 p-2'>
                {isLoadingConversations ? (
                    Array.from({length: 2}).map((_, i) => (
                         <div key={i} className="flex items-center gap-3 p-2">
                             <Skeleton className="h-10 w-10 rounded-full" />
                             <div className="flex-1 space-y-2">
                                 <Skeleton className="h-4 w-3/4" />
                                 <Skeleton className="h-3 w-1/2" />
                             </div>
                         </div>
                    ))
                ) : conversations.length > 0 ? (
                     conversations.map(conv => (
                    <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={cn(
                        'flex items-center gap-3 p-2 rounded-lg w-full text-left hover:bg-muted',
                        selectedConversation === conv.id && 'bg-muted'
                    )}
                    >
                    <Avatar>
                        <AvatarImage src={conv.otherUser.photoURL} alt={conv.otherUser.displayName || "User"} />
                        <AvatarFallback>{conv.otherUser.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                        <p className="font-semibold">{conv.otherUser.displayName}</p>
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                    </button>
                ))
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                        No conversations started yet.
                    </div>
                )}
                </div>
            </ScrollArea>
        </div>

        <div className={cn("w-full md:w-2/3 flex-col", selectedConversation ? 'flex' : 'hidden md:flex')}>
            {activeConversation ? (
                <>
                <CardHeader className="flex-row items-center justify-between border-b">
                    <div className='flex items-center gap-3'>
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                            <ArrowLeft className='h-5 w-5'/>
                        </Button>
                         <Avatar>
                            <AvatarImage src={activeConversation.otherUser.photoURL} alt={activeConversation.otherUser.displayName || "User"} />
                            <AvatarFallback>{activeConversation.otherUser.displayName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-semibold">{activeConversation.otherUser.displayName}</p>
                    </div>
                </CardHeader>
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {isLoadingMessages ? (
                            <div className="space-y-4">
                                <div className="flex justify-start gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-10 w-48 rounded-lg" /></div>
                                <div className="flex justify-end gap-3"><Skeleton className="h-10 w-32 rounded-lg" /><Skeleton className="h-10 w-10 rounded-full" /></div>
                            </div>
                        ) : (
                             messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex items-start gap-3 ${message.senderId === currentUser.uid ? 'justify-end' : ''}`}
                                >
                                    {message.senderId !== currentUser.uid && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={activeConversation.otherUser.photoURL} />
                                            <AvatarFallback>{activeConversation.otherUser.displayName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={`rounded-lg px-4 py-2 max-w-[80%] ${message.senderId === currentUser.uid
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                            }`}
                                    >
                                        <p className="text-sm">{message.text}</p>
                                    </div>
                                    {message.senderId === currentUser.uid && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={currentUser.photoURL || undefined} />
                                            <AvatarFallback>{currentUser.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                        <Input
                        id="message"
                        placeholder="Type your message..."
                        className="flex-1"
                        autoComplete="off"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isSending}
                        />
                        <Button type="submit" size="icon" disabled={isSending}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
                </>
            ) : (
                <div className="flex flex-1 items-center justify-center">
                   {isLoadingConversations ? (
                        <p className="text-muted-foreground">Loading conversations...</p>
                   ) : (
                        <p className="text-muted-foreground">Select a conversation to start chatting</p>
                   )}
                </div>
            )}
        </div>

      </Card>
    </div>
  );
}
