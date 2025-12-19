"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    Users,
    Clock,
    Star,
    Upload,
    PlusCircle,
    ArrowRight,
    Activity,
    PlayCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TutorDashboard() {
    const [name, setName] = useState("Tutor");
    const [coursesCount, setCoursesCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

    useEffect(() => {
        // Load user info
        const storedName = localStorage.getItem('tutorFirstName');
        if (storedName) setName(storedName);

        const fetchData = async () => {
            let tutorId = localStorage.getItem('tutorId');
            const token = localStorage.getItem('jwtToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

            // Fallback: Fetch ID from profile if missing but token exists
            if (!tutorId && token) {
                try {
                    const profileRes = await fetch(`${API_URL}/api/v1/tutor/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (profileRes.ok) {
                        const profile = await profileRes.json();
                        if (profile.id) {
                            tutorId = profile.id.toString();
                            localStorage.setItem('tutorId', tutorId!);
                            if (profile.firstName) {
                                setName(profile.firstName);
                                localStorage.setItem('tutorFirstName', profile.firstName);
                            }
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch tutor profile", e);
                }
            }

            if (tutorId) {
                try {
                    // Fetch Courses Count
                    const res = await fetch(`${API_URL}/courses/tutor/${encodeURIComponent(tutorId)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            setCoursesCount(data.length);
                        }
                    }

                    // Fetch Sessions
                    const sessionRes = await fetch(`${API_URL}/api/v1/sessions/tutor/${tutorId}`);
                    if (sessionRes.ok) {
                        const sData = await sessionRes.json();
                        setUpcomingSessions(sData.filter((s: any) => s.status === 'SCHEDULED'));
                    }
                } catch (e) {
                    console.error("Failed to fetch dashboard data", e);
                }
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">
                        Welcome back, {name}!
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Here's what's happening with your courses today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button asChild variant="outline">
                        <Link href="/tutor/content">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Content
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/tutor/courses">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Course
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Courses
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{coursesCount}</div>
                        <p className="text-xs text-muted-foreground">
                            +1 from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Students
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">
                            Across all batches
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Hours Taught
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">--</div>
                        <p className="text-xs text-muted-foreground">
                            platform engagement
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg. Rating
                        </CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5.0</div>
                        <p className="text-xs text-muted-foreground">
                            Based on student feedback
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Upcoming Classes */}
                <Card className="col-span-full mb-0 lg:col-span-7">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" /> Upcoming Classes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {upcomingSessions.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {upcomingSessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                        <div>
                                            <h4 className="font-semibold text-sm">{session.title}</h4>
                                            <p className="text-xs text-slate-500 mt-1">{session.course.title} • {session.batch.name}</p>
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(session.startTime).toLocaleString()}
                                            </p>
                                        </div>
                                        {session.meetingLink && (
                                            <Button size="sm" asChild>
                                                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">Join</a>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground bg-slate-50/50 rounded-lg border border-dashed">
                                <Clock className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">No upcoming scheduled classes.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-4 mt-6 lg:mt-0">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your latest actions across the platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[
                                { action: "Course Created", detail: "Java Full Stack Development", time: "2 hours ago" },
                                { action: "Content Uploaded", detail: "Chapter 1: Collections Framework", time: "yesterday" },
                                { action: "Batch Started", detail: "Feb 2025 Morning Batch", time: "3 days ago" },
                            ].map((item, i) => (
                                <div className="flex items-center" key={i}>
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>
                                            <Activity className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{item.action}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.detail}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                                        {item.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Shortcuts / Tips */}
                <Card className="col-span-3 mt-6 lg:mt-0">
                    <CardHeader>
                        <CardTitle>Quick Tips</CardTitle>
                        <CardDescription>
                            Maximize your teaching impact.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center gap-4 rounded-md border p-4">
                            <Upload className="h-8 w-8 text-blue-500" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    Organize Content
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Use folders to structure materials.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-md border p-4">
                            <Users className="h-8 w-8 text-green-500" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    Engage Students
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Post regularly in the forum.
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full" asChild>
                            <Link href="/tutor/courses">
                                View All Courses <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
