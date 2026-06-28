"use client";

import { useContext, useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Mail,
  Briefcase,
  ClipboardList,
  StickyNote,
  Loader2,
  Send,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import type { Project, OnboardingChecklist, ClientNote, ProjectStatus } from "@/types/project";
import { getStatusLabel } from "@/services/project-service";

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { role } = useContext(AuthContext);
  const [clientName, setClientName] = useState("");
  const [clientEmail] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [checklist, setChecklist] = useState<OnboardingChecklist | null>(null);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingChecklist, setUpdatingChecklist] = useState<string | null>(null);

  const isAdmin = role === "admin" || role === "super_admin";

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects?clientId=${id}`);
      if (res.ok) {
        const data = await res.json();
        const clientProjects: Project[] = data.projects ?? [];
        setProjects(clientProjects);
        if (clientProjects.length > 0) {
          const first = clientProjects[0];
          const m = first.packageName.match(/^(.+?)\s*-\s*(.+?)\s+inquiry$/i);
          if (m) setClientName(m[1].trim());
        }
      }
    } catch (e) {
      console.error("Failed to fetch projects:", e);
    }
  }, [id]);

  const fetchChecklist = useCallback(async () => {
    try {
      const res = await fetch(`/api/checklist?userId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setChecklist(data.checklist ?? data ?? null);
      }
    } catch (e) {
      console.error("Failed to fetch checklist:", e);
    } finally {
      setChecklistLoading(false);
    }
  }, [id]);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/clients?clientId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : data.notes ?? []);
      }
    } catch (e) {
      console.error("Failed to fetch notes:", e);
    } finally {
      setNotesLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    Promise.all([fetchProjects(), fetchChecklist(), fetchNotes()])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAdmin, fetchProjects, fetchChecklist, fetchNotes]);

  const handleStatusUpdate = async (projectId: string, newStatus: ProjectStatus) => {
    setUpdatingStatus(projectId);
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, status: newStatus }),
      });
      if (res.ok) {
        setProjects(prev =>
          prev.map(p => (p.id === projectId ? { ...p, status: newStatus } : p))
        );
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleChecklistToggle = async (itemId: string, currentStatus: string) => {
    if (!checklist) return;
    setUpdatingChecklist(itemId);
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      const res = await fetch("/api/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checklistId: checklist.id, itemId, status: newStatus }),
      });
      if (res.ok) {
        setChecklist(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map(item =>
              item.id === itemId ? { ...item, status: newStatus as "pending" | "completed" } : item
            ),
          };
        });
      }
    } catch (e) {
      console.error("Failed to update checklist:", e);
    } finally {
      setUpdatingChecklist(null);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: id, content: newNote.trim() }),
      });
      if (res.ok) {
        const result = await res.json();
        setNotes(prev => [result.note ?? result, ...prev]);
        setNewNote("");
      }
    } catch (e) {
      console.error("Failed to add note:", e);
    } finally {
      setSubmittingNote(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <AlertTriangle className="size-12 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  const checklistProgress = checklist?.items
    ? Math.round((checklist.items.filter(i => i.status === "completed").length / checklist.items.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/admin")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{clientName || "Client Details"}</h1>
          {clientEmail && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5" />
              {clientEmail}
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-72" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects" className="gap-1.5">
              <Briefcase className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="checklist" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5">
              <StickyNote className="h-4 w-4" />
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            {projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Briefcase className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No projects for this client.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {projects.map((project) => {
                  const statusIdx = ["lead", "onboarding", "design", "development", "review", "live", "completed"].indexOf(project.status);
                  const progress = statusIdx >= 0 ? Math.round((statusIdx / 6) * 100) : 0;
                  const nextStatus = statusIdx >= 0 && statusIdx < 6
                    ? ["lead", "onboarding", "design", "development", "review", "live", "completed"][statusIdx + 1] as ProjectStatus
                    : null;
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">
                              {(() => {
                                const m = project.packageName.match(/^(.+?)\s*-\s*(.+?)\s+inquiry$/i);
                                return m ? `${m[1].trim()} — ${m[2].trim()}` : project.packageName;
                              })()}
                            </CardTitle>
                            <Badge variant="outline">
                              {getStatusLabel(project.status)}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            {project.currency === "ZiG" ? "ZiG" : "$"}{project.budget.toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                          {nextStatus && project.status !== "completed" && project.status !== "cancelled" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => handleStatusUpdate(project.id, nextStatus)}
                              disabled={updatingStatus === project.id}
                            >
                              {updatingStatus === project.id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : null}
                              Move to {getStatusLabel(nextStatus)}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="checklist" className="space-y-4">
            {checklistLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : !checklist ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <ClipboardList className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No checklist found for this client.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {checklist.items.filter(i => i.status === "completed").length} of {checklist.items.length} completed
                  </span>
                  <Badge variant="secondary" className="text-xs">{checklistProgress}%</Badge>
                </div>
                <Progress value={checklistProgress} className="h-2" />
                <ScrollArea className="h-[50vh]">
                  <div className="space-y-2 pr-4">
                    {checklist.items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Card
                          className={`cursor-pointer transition-colors ${
                            item.status === "completed" ? "border-green-500/30 bg-green-500/5" : ""
                          }`}
                          onClick={() => handleChecklistToggle(item.id, item.status)}
                        >
                          <CardContent className="flex items-start gap-3 p-3">
                            {updatingChecklist === item.id ? (
                              <Loader2 className="h-5 w-5 shrink-0 mt-0.5 animate-spin text-muted-foreground" />
                            ) : item.status === "completed" ? (
                              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-green-400" />
                            ) : (
                              <Circle className="h-5 w-5 shrink-0 mt-0.5 text-muted-foreground" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm ${item.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                                {item.task}
                              </p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] h-5">
                                  {item.type}
                                </Badge>
                                {item.link && (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-primary hover:underline"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    View link
                                  </a>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Add a Note</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Write a note about this client..."
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || submittingNote}
                  className="gap-1.5"
                >
                  {submittingNote ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Add Note
                </Button>
              </CardContent>
            </Card>

            {notesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <StickyNote className="h-8 w-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {note.createdAt?.toDate ? (
                            <span>{formatDistanceToNow(note.createdAt.toDate(), { addSuffix: true })}</span>
                          ) : (
                            <span>Recently</span>
                          )}
                          {note.createdAt?.toDate && (
                            <span className="text-muted-foreground/60">
                              · {format(note.createdAt.toDate(), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
