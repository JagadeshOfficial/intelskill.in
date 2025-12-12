'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, MessageSquare, PlayCircle, BookOpen, Clock, AlertCircle } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Course {
    id: number;
    title: string;
    description: string;
    progress?: number;
    thumbnail?: string;
}

export default function StudentDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ name: string; email: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 1. Get User Info from specific keys (matching UserNav logic)
        const email = localStorage.getItem('studentEmail');
        const firstName = localStorage.getItem('studentFirstName');
        const lastName = localStorage.getItem('studentLastName');

        if (email) {
            setUser({
                name: `${firstName} ${lastName}`.trim() || 'Student',
                email: email
            });
            // 2. Fetch Courses
            fetchCourses(email);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCourses = async (email: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            const response = await fetch(`${API_URL}/api/courses/student/${email}`);
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            const data = await response.json();
            // Add mock progress for now as backend doesn't track it yet per course
            const coursesWithProgress = data.map((c: any) => ({ ...c, progress: Math.floor(Math.random() * 100) }));
            setCourses(coursesWithProgress);
        } catch (err) {
            console.error(err);
            setError("Could not load your courses. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Authentication Required</CardTitle>
                        <CardDescription>Please log in to view your dashboard.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild className="w-full"><Link href="/login">Log In</Link></Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
            <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user.name}! 👋</h1>
                    <p className="text-slate-500 mt-1">
                        You have {courses.length} active courses. Keep up the momentum!
                    </p>
                </div>
            </header>

            {error && (
                <Alert variant="destructive" className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <div>
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="bg-white text-destructive hover:bg-destructive/10 border-destructive/20">
                        Retry
                    </Button>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Upcoming Sessions (Mock) */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Clock className="h-5 w-5 text-orange-500" /> Upcoming Sessions
                        </h2>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                {[{ title: "Live Q&A: Spring Boot", time: "Tomorrow, 4:00 PM", type: "Webinar" }].map((session, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                                <PlayCircle className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{session.title}</h4>
                                                <p className="text-xs text-slate-500">{session.time} • {session.type}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary">Join</Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {/* Sidebar Stats */}
                <aside className="space-y-6">
                    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 border-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-100">
                                <Award className="h-5 w-5" /> Overall Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold">Level 4</span>
                                <span className="text-blue-200 mb-1">Explorer</span>
                            </div>
                            <Progress value={65} className="mt-4 h-2 bg-blue-500/50" />
                            <p className="text-xs text-blue-200 mt-2">1,250 XP to Level 5</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Stats Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg text-green-600"><Award className="h-4 w-4" /></div>
                                    <span className="text-sm font-medium">Completed</span>
                                </div>
                                <span className="font-bold">5</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><MessageSquare className="h-4 w-4" /></div>
                                    <span className="text-sm font-medium">Forum Posts</span>
                                    12
                                </div>
                                <span className="font-bold">12</span>
                            </div>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="col-span-2 space-y-4">
                    <div className="h-8 w-40 bg-slate-100 rounded animate-pulse"></div>
                    <div className="h-48 bg-slate-100 rounded-xl animate-pulse"></div>
                    <div className="h-48 bg-slate-100 rounded-xl animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    <div className="h-40 bg-slate-100 rounded-xl animate-pulse"></div>
                    <div className="h-60 bg-slate-100 rounded-xl animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}
