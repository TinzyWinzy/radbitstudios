"use client";

import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell, CheckCheck, Loader2, ExternalLink, FileText, Sparkles,
  Briefcase, Newspaper, MessageCircle, Settings, Inbox,
} from "lucide-react";
import { markAsRead, markAllAsRead, type AppNotification } from "@/services/notifications/notifications-service";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  collection, query, where, orderBy, limit, onSnapshot,
  startAfter, getDocs, getCountFromServer,
} from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  assessment: <FileText className="h-4 w-4" />,
  insights: <Sparkles className="h-4 w-4" />,
  tender: <Briefcase className="h-4 w-4" />,
  news: <Newspaper className="h-4 w-4" />,
  community: <MessageCircle className="h-4 w-4" />,
  system: <Sparkles className="h-4 w-4" />,
};

const TYPE_LABELS: Record<string, string> = {
  assessment: "Assessment",
  insights: "Insights",
  tender: "Tender",
  news: "News",
  community: "Community",
  system: "System",
};

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "assessment", label: "Assessments" },
  { value: "insights", label: "Insights" },
  { value: "tender", label: "Tenders" },
  { value: "news", label: "News" },
  { value: "system", label: "System" },
];

const PAGE_SIZE = 20;

export default function NotificationsClientPage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const [allItems, setAllItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [totalUnread, setTotalUnread] = useState(0);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE),
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
      setAllItems(items);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length >= PAGE_SIZE);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false),
    );
    getCountFromServer(q).then((snap) => setTotalUnread(snap.data().count)).catch(e => console.error('[Notifications] getCount failed:', e));
  }, [user, allItems]);

  const loadMore = useCallback(async () => {
    if (!user || !lastDoc || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
      setAllItems((prev) => [...prev, ...items]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length >= PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }, [user, lastDoc, hasMore, loadingMore]);

  const handleMarkRead = async (id: string) => {
    setAllItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markAsRead(id).catch(e => console.error('[Notifications] markAsRead failed:', e));
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    setAllItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setTotalUnread(0);
    await markAllAsRead(user.uid).catch(e => console.error('[Notifications] markAllAsRead failed:', e));
    toast({ title: "All notifications marked as read" });
  };

  const filtered = filter === "all" ? allItems : allItems.filter((n) => n.type === filter);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="h-7 w-7 text-primary" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalUnread > 0
              ? `${totalUnread} unread notification${totalUnread > 1 ? "s" : ""}`
              : "No unread notifications"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {totalUnread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-1.5" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="flex-wrap h-auto">
          {FILTER_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs">
              {t.label}
              {t.value === "all" && totalUnread > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center size-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-muted-foreground font-normal">
            <Inbox className="h-4 w-4" />
            {filter === "all" ? "All notifications" : TYPE_LABELS[filter] || filter}
            <span className="text-xs text-muted-foreground/60 ml-1">({filtered.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm mt-1">
                {filter === "all"
                  ? "Complete your assessment or check tenders to get started."
                  : `No ${TYPE_LABELS[filter]?.toLowerCase() || filter} notifications yet.`}
              </p>
            </div>
          ) : (
            <div>
              {filtered.map((n, i) => (
                <button
                  key={n.id}
                  onClick={() => { if (!n.read) handleMarkRead(n.id); }}
                  className={cn(
                    "w-full text-left px-6 py-4 hover:bg-muted/50 transition-colors flex items-start gap-3",
                    !n.read && "bg-primary/[0.03]",
                    i < filtered.length - 1 && "border-b border-border/50",
                  )}
                >
                  <div className={cn(
                    "size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    !n.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                  )}>
                    {TYPE_ICONS[n.type] || <Bell className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm", !n.read && "font-semibold")}>{n.title}</p>
                      {!n.read && <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground/60">
                        {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true }) : ""}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground/70">
                        {TYPE_LABELS[n.type] || n.type}
                      </span>
                    </div>
                  </div>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 text-muted-foreground hover:text-foreground mt-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </button>
              ))}
              {hasMore && (
                <div className="p-4 text-center">
                  <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                    {loadingMore ? "Loading..." : "Load more"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
