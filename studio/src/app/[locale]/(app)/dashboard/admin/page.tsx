"use client";

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, BarChart3, Activity, UserCog, AlertTriangle } from "lucide-react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { user, role } = useContext(AuthContext);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalAssessments: number;
    totalThreads: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersSnap, assessmentsSnap, threadsSnap] = await Promise.all([
          getDocs(query(collection(db, "users"))),
          getDocs(query(collection(db, "assessments"))),
          getDocs(query(collection(db, "threads"))),
        ]);
        setStats({
          totalUsers: usersSnap.size,
          totalAssessments: assessmentsSnap.size,
          totalThreads: threadsSnap.size,
        });
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">
          Platform overview and management for {user?.displayName || "Admin"}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalAssessments ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Community Threads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalThreads ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Quick Actions
            </CardTitle>
            <CardDescription>Manage platform users and content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
              <span className="text-sm">Blog Manager</span>
              <Badge variant="secondary">Admin</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
              <span className="text-sm">User Role Management</span>
              <Badge variant="secondary">Super Admin</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Status
            </CardTitle>
            <CardDescription>Platform health indicators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-md">
              <span className="text-sm">Authentication</span>
              <Badge className="bg-green-500/15 text-green-400 border-green-500/30">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md">
              <span className="text-sm">Firestore Database</span>
              <Badge className="bg-green-500/15 text-green-400 border-green-500/30">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md">
              <span className="text-sm">AI Services</span>
              <Badge className="bg-green-500/15 text-green-400 border-green-500/30">Operational</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
