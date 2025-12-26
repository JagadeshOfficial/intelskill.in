"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Database, FileText, ClipboardCheck, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalBatches: 0,
    pendingAssignments: 7, // Placeholder for new modules
    activeTests: 4 // Placeholder for new modules
  });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("adminToken");
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
        const res = await fetch(`${baseUrl}/api/v1/auth/admin/dashboard/stats`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Dashboard</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Overview of your platform's metrics.
        </p>
      </header>
      <main className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Students & Tutors</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">Active Catalog</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Batches</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBatches}</div>
              <p className="text-xs text-muted-foreground">Ongoing sessions</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50/50 border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Pending ASG</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{stats.pendingAssignments}</div>
              <p className="text-xs text-orange-600 flex items-center gap-1">Require review <ArrowUpRight className="h-3 w-3" /></p>
            </CardContent>
          </Card>
          <Card className="bg-green-50/50 border-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Active Tests</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{stats.activeTests}</div>
              <p className="text-xs text-green-600 flex items-center gap-1">In progress <ArrowUpRight className="h-3 w-3" /></p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: 'John Doe', action: 'Submitted Assignment', time: '2 mins ago', module: 'Assignments' },
                  { user: 'Admin', action: 'Created New Test', time: '1 hour ago', module: 'Tests' },
                  { user: 'Jane Smith', action: 'Joined Batch 4', time: '3 hours ago', module: 'Courses' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px]">{activity.module}</Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Launch</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start gap-2 h-12" asChild>
                <Link href="/admin/assignments">
                  <FileText className="h-4 w-4 pointer-events-none" /> Go to Assignments
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-12" asChild>
                <Link href="/admin/tests">
                  <ClipboardCheck className="h-4 w-4 pointer-events-none" /> Go to Tests
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
