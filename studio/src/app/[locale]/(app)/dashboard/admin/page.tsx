"use client";

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminProjectCard } from "@/components/admin-project-card";
import {
  Shield,
  Users,
  Briefcase,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  ArrowRight,
  Handshake,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import type { Project } from "@/types/project";
import { PROJECT_STATUS_FLOW, STATUS_COLUMNS } from "@/services/project-service";

const PIPELINE_STATUSES = PROJECT_STATUS_FLOW;

export default function AdminDashboardPage() {
  const { user, role } = useContext(AuthContext);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes] = await Promise.all([
          fetch("/api/projects?admin=true"),
        ]);
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(Array.isArray(projectsData) ? projectsData : projectsData.projects ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const isAdmin = role === "admin" || role === "super_admin";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertTriangle className="size-12 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to access the admin panel.
        </p>
      </div>
    );
  }

  const grouped = projects.reduce<Record<string, Project[]>>((acc, p) => {
    const key = p.status;
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const leads = (grouped.lead || []).slice(0, 5);
  const totalClients = new Set(projects.map(p => p.clientId)).size;
  const activeProjects = projects.filter(p => !["completed", "cancelled"].includes(p.status)).length;
  const inOnboarding = (grouped.onboarding || []).length;
  const completedThisMonth = (grouped.completed || []).filter(p => {
    if (!p.completedAt || !("toDate" in p.completedAt)) return false;
    const d = (p.completedAt as { toDate: () => Date }).toDate();
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">
          Client pipeline and project management for {user?.displayName || "Admin"}.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold">{totalClients}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold">{activeProjects}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5" />
              In Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold">{inOnboarding}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Completed This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <div className="text-xl font-bold">{completedThisMonth}</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Partner Management */}
      <Card className="border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Handshake className="h-4 w-4 text-primary" />
            Partner Programme
          </CardTitle>
          <CardDescription className="text-xs">
            Manage affiliates, commissions, and payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="/dashboard/admin/partners"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View All Partners <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="/dashboard/admin/partners?tab=pending-payouts"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-500 hover:underline"
            >
              Pending Payouts <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <a
              href="/dashboard/admin/partners?tab=commissions"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:underline"
            >
              Approve Commissions <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr_1fr]">
        {/* Left: Summary stats (visible on desktop, moved to top on mobile) */}
        <div className="hidden lg:block space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Summary
              </CardTitle>
              <CardDescription className="text-xs">Pipeline at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {PIPELINE_STATUSES.map((status) => {
                const count = (grouped[status] || []).length;
                const col = STATUS_COLUMNS[status];
                return (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{col.label}</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Middle: Pipeline Kanban */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Client Pipeline
          </h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4 min-w-max">
                {PIPELINE_STATUSES.map((status) => {
                  const col = STATUS_COLUMNS[status];
                  const items = grouped[status] || [];
                  return (
                    <motion.div
                      key={status}
                      className={`w-64 shrink-0 rounded-lg border bg-card ${col.color} border-t-2`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between px-3 py-2.5 border-b">
                        <span className="text-xs font-semibold">{col.label}</span>
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                          {items.length}
                        </Badge>
                      </div>
                      <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
                        {items.length === 0 ? (
                          <div className="text-center py-6 text-xs text-muted-foreground">
                            <Briefcase className="h-6 w-6 mx-auto mb-1 opacity-30" />
                            <p>No projects</p>
                          </div>
                        ) : (
                          items.map((project) => (
                            <AdminProjectCard key={project.id} project={project} />
                          ))
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Right: Recent Leads */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            Recent Leads
          </h2>
          <Card>
            <CardContent className="p-3 space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  <UserPlus className="h-6 w-6 mx-auto mb-1 opacity-30" />
                  <p>No leads yet</p>
                </div>
              ) : (
                leads.map((project) => {
                  const createdAt = project.createdAt && "toDate" in project.createdAt
                    ? (project.createdAt as { toDate: () => Date }).toDate()
                    : null;
                  return (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {(() => {
                            const m = project.packageName.match(/^(.+?)\s*-\s*(.+?)\s+inquiry$/i);
                            return m ? m[1].trim() : project.packageName;
                          })()}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {project.currency === "ZiG" ? "ZiG" : "$"}{project.budget.toLocaleString()}
                          {createdAt && ` · ${formatDistanceToNow(createdAt, { addSuffix: true })}`}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
