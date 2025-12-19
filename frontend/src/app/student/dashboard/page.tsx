'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, MessageSquare, PlayCircle, BookOpen, Clock, AlertCircle, TrendingUp, ChevronRight, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

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
            // 2. Fetch Courses and Sessions
            fetchData(email);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchData = async (email: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

            // 1. Fetch Courses
            const response = await fetch(`${API_URL}/api/courses/student/${email}`);
            if (response.ok) {
                const data = await response.json();
                // Add mock progress for now as backend doesn't track it yet per course
                const coursesWithProgress = data.map((c: any) => ({ ...c, progress: Math.floor(Math.random() * 100) }));
                setCourses(coursesWithProgress);
            } else {
                // If fetch fails (maybe 404 if no courses), just empty array
                setCourses([]);
            }

            // 2. Fetch Sessions
            // Try to get ID from local storage first
            let studentId = localStorage.getItem('studentId');

            // If not in local storage, try fetching profile by email to get ID
            if (!studentId) {
                // This assumes we have a public or secured endpoint to find by email
                // Or we can rely on the user being logged in with a token.
                // But let's try reading profile/me if token exists
                const token = localStorage.getItem('jwtToken'); // Usually stored as jwtToken or token
                if (token) {
                    const profileRes = await fetch(`${API_URL}/api/v1/student/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (profileRes.ok) {
                        const profile = await profileRes.json();
                        if (profile.id) {
                            studentId = profile.id.toString();
                            localStorage.setItem('studentId', studentId!); // Cache it
                        }
                    }
                }
            }

            if (studentId) {
                const sessionRes = await fetch(`${API_URL}/api/v1/sessions/student/${studentId}`);
                if (sessionRes.ok) {
                    const sessions = await sessionRes.json();
                    setUpcomingSessions(sessions.filter((s: any) => s.status === 'SCHEDULED'));
                }
            }

        } catch (err) {
            console.error(err);
            // Don't block dashboard on fetch error
            setError("Could not load your full dashboard data. Some info might be missing.");
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
                            <AlertTitle>Notice</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </div>
                    </div>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Continue Learning Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-blue-600" /> Continue Learning
                            </h2>
                            <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Link href="/student/my-courses">View All <ChevronRight className="ml-1 h-3 w-3" /></Link>
                            </Button>
                        </div>

                        {courses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courses.slice(0, 4).map(course => (
                                    <div key={course.id} className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                                        <div className="h-32 bg-gradient-to-r from-slate-100 to-slate-200 relative">
                                            {course.thumbnail ? (
                                                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <GraduationCap className="h-10 w-10 text-slate-300" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                            <Badge className="absolute top-3 right-3 bg-white/90 text-slate-800 hover:bg-white shadow-sm backdrop-blur-sm">
                                                {/* Mock Category */}
                                                Development
                                            </Badge>
                                        </div>

                                        <div className="p-4 flex-grow flex flex-col gap-3">
                                            <div>
                                                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{course.title}</h3>
                                                <p className="text-xs text-slate-500 line-clamp-1 mt-1">{course.description || "No description available."}</p>
                                            </div>

                                            <div className="mt-auto space-y-2">
                                                <div className="flex justify-between text-xs font-semibold text-slate-600">
                                                    <span>Progress</span>
                                                    <span>{course.progress || 0}%</span>
                                                </div>
                                                <Progress value={course.progress || 0} className="h-1.5 bg-slate-100" />
                                            </div>
                                        </div>

                                        <div className="px-4 pb-4">
                                            <Button size="sm" className="w-full bg-slate-900 group-hover:bg-blue-600 transition-colors gap-2" asChild>
                                                <Link href={`/student/courses/${course.id}`}>
                                                    <PlayCircle className="h-3.5 w-3.5" /> Resume Course
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Card className="bg-slate-50 border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                                    <BookOpen className="h-10 w-10 text-slate-300 mb-3" />
                                    <p className="font-medium text-slate-600">No active courses</p>
                                    <p className="text-sm text-slate-400 mb-4">Enroll in a course to get started!</p>
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href="/courses">Browse Catalog</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <Clock className="h-5 w-5 text-orange-500" /> Upcoming Sessions
                        </h2>
                        <Card className="hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                {upcomingSessions.length > 0 ? (
                                    upcomingSessions.map((session, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors rounded-lg border-b last:border-0 last:rounded-b-lg first:rounded-t-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                                    <PlayCircle className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900">{session.title}</h4>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                        <span>{new Date(session.startTime).toLocaleString()}</span>
                                                        <span>•</span>
                                                        <span>{session.course.title}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            {session.meetingLink && (
                                                <Button size="sm" variant="secondary" asChild>
                                                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">Join</a>
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
                                        <Clock className="h-8 w-8 text-slate-200" />
                                        <p>No upcoming sessions scheduled.</p>
                                    </div>
                                )}
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
