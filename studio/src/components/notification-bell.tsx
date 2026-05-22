"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, Loader2, CheckCheck, ExternalLink } from "lucide-react";
import { markAsRead, markAllAsRead, type AppNotification } from "@/services/notifications/notifications-service";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface Props {
  userId: string;
}

export function NotificationBell({ userId }: Props) {
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10),
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      setNotifications(items);
      setUnread(items.filter(n => !n.read).length);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  const handleOpen = async () => {
    setOpen(true);
  };

  const handleMarkRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
    await markAsRead(id).catch(() => {});
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
    await markAllAsRead(userId).catch(() => {});
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" onClick={handleOpen} className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unread > 0 && (
            <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => { if (!n.read) handleMarkRead(n.id); }}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0",
                  !n.read && "bg-primary/5",
                )}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : ''}
                    </p>
                  </div>
                  {n.link && <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />}
                </div>
              </button>
            ))
          )}
        </div>
        <div className="border-t p-2">
          <Link href="/notifications" className="flex items-center justify-center gap-1.5 text-xs text-primary hover:underline py-1" onClick={() => setOpen(false)}>
            <ExternalLink className="h-3 w-3" />
            See all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
