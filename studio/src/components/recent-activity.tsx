"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, FileText, Sparkles, Briefcase, Newspaper, MessageCircle } from "lucide-react";
import { getNotifications, type AppNotification } from "@/services/notifications/notifications-service";
import { formatDistanceToNow } from "date-fns";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  assessment: <FileText className="h-4 w-4" />,
  insights: <Sparkles className="h-4 w-4" />,
  tender: <Briefcase className="h-4 w-4" />,
  news: <Newspaper className="h-4 w-4" />,
  community: <MessageCircle className="h-4 w-4" />,
  system: <Sparkles className="h-4 w-4" />,
  project: <Briefcase className="h-4 w-4" />,
};

interface Props {
  userId: string;
}

export function RecentActivity({ userId }: Props) {
  const [activities, setActivities] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications(userId, 5)
      .then(setActivities)
      .catch(e => console.error('[RecentActivity] getNotifications failed:', e))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest updates and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No recent activity</p>
            <p className="text-xs mt-1">Complete your assessment to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="mt-0.5 text-primary/70 shrink-0">
                  {TYPE_ICONS[a.type] || <Sparkles className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{a.body}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {a.createdAt?.toDate ? formatDistanceToNow(a.createdAt.toDate(), { addSuffix: true }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
