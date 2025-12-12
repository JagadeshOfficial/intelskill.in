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
    Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TutorDashboard() {
    const [name, setName] = useState("Tutor");
    const [coursesCount, setCoursesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user info
        const storedName = localStorage.getItem('tutorFirstName');
        if (storedName) setName(storedName);

        // Fetch Courses Count (Real Data)
        const fetchStats = async () => {
            const tutorId = localStorage.getItem('tutorId');
            if (tutorId) {
                try {
                    const res = await fetch(`http://localhost:8081/courses/tutor/${encodeURIComponent(tutorId)}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            setCoursesCount(data.length);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch courses", e);
                }
            }
            setLoading(false);
        };
        fetchStats();
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
                {/* Recent Activity */}
                <Card className="col-span-4">
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
                <Card className="col-span-3">
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
