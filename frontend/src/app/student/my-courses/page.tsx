'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, AlertCircle, Library } from "lucide-react";
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

export default function MyCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const email = localStorage.getItem('studentEmail');
        if (email) {
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
        return <CourseSkeleton />;
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Library className="h-8 w-8 text-blue-600" /> My Courses
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Access all your enrolled courses and continue learning.
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
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="bg-white text-destructive hover:bg-destructive/10 border-destructive/20">Retry</Button>
                </Alert>
            )}

            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden hover:border-blue-300 flex flex-col">
                            <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden shrink-0">
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                <div className="absolute bottom-4 left-4 text-white font-bold text-xl drop-shadow-md pr-4">
                                    {course.title}
                                </div>
                            </div>
                            <CardContent className="pt-4 space-y-4 flex-grow">
                                <p className="text-sm text-slate-500 line-clamp-3">{course.description || "No description available."}</p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                                        <span>Progress</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <Progress value={course.progress} className="h-2 bg-slate-100" />
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0 pb-5 mt-auto">
                                <Button asChild className="w-full bg-slate-900 group-hover:bg-blue-600 transition-colors">
                                    <Link href={`/courses/${course.id}`}>
                                        Continue Learning
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
                    <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No Courses Found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">You remain to be enrolled in any courses. Check back later or contact your administrator.</p>
                </div>
            )}
        </div>
    );
}

function CourseSkeleton() {
    return (
        <div className="p-6 space-y-8">
            <div className="h-20 w-1/3 bg-slate-100 rounded-lg animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-80 bg-slate-100 rounded-xl animate-pulse"></div>
                ))}
            </div>
        </div>
    )
}
