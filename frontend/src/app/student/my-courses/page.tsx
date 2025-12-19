'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, AlertCircle, Library, Search, PlayCircle, Clock, MoreVertical, LayoutGrid, List as ListIcon, GraduationCap, CheckCircle2, Star } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Course {
    id: number;
    title: string;
    description: string;
    progress?: number;
    thumbnail?: string;
    category?: string;
    lessonsCount?: number;
    duration?: string;
}

export default function MyCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const email = localStorage.getItem('studentEmail');
        if (email) {
            fetchCourses(email);
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let result = courses;

        // Search Filter
        if (searchTerm) {
            result = result.filter(c =>
                c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Tab Filter
        if (activeTab === 'in-progress') {
            result = result.filter(c => (c.progress || 0) > 0 && (c.progress || 0) < 100);
        } else if (activeTab === 'completed') {
            result = result.filter(c => (c.progress || 0) === 100);
        }

        setFilteredCourses(result);
    }, [searchTerm, activeTab, courses]);

    const fetchCourses = async (email: string) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
            const response = await fetch(`${API_URL}/api/courses/student/${email}`);
            if (!response.ok) {
                throw new Error('Failed to fetch courses');
            }
            const data = await response.json();
            // detailed mock data
            const coursesWithProgress = data.map((c: any) => ({
                ...c,
                progress: Math.floor(Math.random() * 100),
                category: ['Development', 'Design', 'Business', 'Marketing'][Math.floor(Math.random() * 4)],
                lessonsCount: Math.floor(Math.random() * 20) + 5,
                duration: `${Math.floor(Math.random() * 10) + 2}h ${Math.floor(Math.random() * 60)}m`
            }));
            setCourses(coursesWithProgress);
            setFilteredCourses(coursesWithProgress);
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
        <div className="min-h-screen p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-primary flex items-center gap-3">
                        <span className="bg-primary/10 p-2 rounded-xl"><Library className="h-8 w-8 text-primary" /></span>
                        My Learning
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Jump back into your courses and track your progress.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search courses..."
                            className="pl-9 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1">
                <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
                        <TabsTrigger value="all">All Courses</TabsTrigger>
                        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-2 border rounded-md p-1 bg-background shadow-sm">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 w-8 p-0"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 w-8 p-0"
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2 text-destructive border-destructive/20 hover:bg-destructive/10">Retry Connection</Button>
                </Alert>
            )}

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {filteredCourses.map(course => (
                        <CourseCard key={course.id} course={course} viewMode={viewMode} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm mb-4">
                        <BookOpen className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">No courses found</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">
                        {searchTerm ? "Try adjusting your search terms." : "You haven't enrolled in any courses yet."}
                    </p>
                    <Button variant="link" className="mt-4 text-primary" asChild>
                        <Link href="/courses">Browse Catalog</Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

function CourseCard({ course, viewMode }: { course: Course, viewMode: 'grid' | 'list' }) {
    if (viewMode === 'list') {
        return (
            <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden flex flex-row items-center p-2 gap-4 border-l-4 border-l-primary hover:bg-slate-50/50">
                <div className="h-24 w-40 bg-gradient-to-br from-slate-200 to-slate-300 rounded-md shrink-0 flex items-center justify-center text-slate-400">
                    {course.thumbnail ? <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover rounded-md" /> : <GraduationCap className="h-8 w-8" />}
                </div>
                <div className="flex-grow py-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant="secondary" className="mb-2 text-[10px] tracking-wider font-bold uppercase text-slate-500">{course.category}</Badge>
                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors mb-1">{course.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-slate-700">{course.progress}%</span>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><PlayCircle className="h-3 w-3" /> {course.lessonsCount} Lessons</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>
                        </div>
                        <Button size="sm" asChild>
                            <Link href={`/student/courses/${course.id}`}>Continue</Link>
                        </Button>
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <Card className="group hover:shadow-xl transition-all duration-300 border-border/50 overflow-hidden flex flex-col h-full bg-card hover:border-primary/20">
            <div className="h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />}
                <Badge className="absolute top-4 right-4 bg-white/90 text-black hover:bg-white backdrop-blur-sm shadow-sm">
                    {course.category}
                </Badge>
                {course.progress === 100 && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white p-1 rounded-full shadow-lg">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                )}
            </div>

            <CardContent className="pt-6 space-y-4 flex-grow relative">
                {/* Floating Start Button */}
                <Button size="icon" className="absolute -top-5 right-6 rounded-full h-12 w-12 shadow-lg bg-white text-primary border-4 border-card hover:bg-primary hover:text-white transition-all scale-90 group-hover:scale-100" asChild>
                    <Link href={`/student/courses/${course.id}`}>
                        <PlayCircle className="h-6 w-6 ml-1" />
                    </Link>
                </Button>

                <div>
                    <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2 h-10">{course.description || "No description available for this course."}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                    <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                        <ListIcon className="h-3 w-3" /> {course.lessonsCount} Modules
                    </div>
                    <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                        <Clock className="h-3 w-3" /> {course.duration}
                    </div>
                </div>

                <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                        <span className={course.progress === 100 ? "text-green-600" : "text-slate-700"}>
                            {course.progress === 100 ? "Completed" : "Progress"}
                        </span>
                        <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className={`h-2 ${course.progress === 100 ? "bg-green-100 [&>div]:bg-green-600" : "bg-slate-100"}`} />
                </div>
            </CardContent>

            <CardFooter className="pt-0 pb-6 border-t bg-slate-50/50 p-4 flex justify-between items-center text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-slate-700">4.8</span>
                    <span>(120 reviews)</span>
                </div>
                <Link href={`/student/courses/${course.id}`} className="font-bold text-primary cursor-pointer hover:underline flex items-center gap-1">
                    Continue Learning <PlayCircle className="h-3 w-3" />
                </Link>
            </CardFooter>
        </Card>
    );
}

function CourseSkeleton() {
    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
                    <div className="h-4 w-64 bg-slate-100 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-[400px] bg-slate-100 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        </div>
    )
}

