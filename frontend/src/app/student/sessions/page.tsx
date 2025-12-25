'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Calendar, Clock, Video, Users, User, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Session {
    id: number
    title: string
    description: string
    sessionLink: string
    startTime: string
    endTime: string
    batchName: string
    tutorName: string
    batchId: number
    tutorId: number
}

interface Batch {
    id: number
    name: string
    courseId: number
}

export default function StudentSessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [studentEmail, setStudentEmail] = useState<string | null>(null)

    useEffect(() => {
        fetchUserData()
    }, [])

    useEffect(() => {
        if (studentEmail) {
            fetchStudentSessions()
        }
    }, [studentEmail])

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("studentToken");
            if (!token) {
                setLoading(false);
                return;
            }
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/v1/student/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setStudentEmail(data.email)
            } else {
                setLoading(false);
            }
        } catch (error) {
            console.error("Failed to fetch user data", error)
            setLoading(false);
        }
    }

    const fetchStudentSessions = async () => {
        if (!studentEmail) return
        setLoading(true)
        try {
            const token = localStorage.getItem("studentToken");
            // 1. Get Student Courses
            console.log("Fetching courses for student:", studentEmail);
            const coursesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/courses/student/${studentEmail}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (coursesRes.ok) {
                const coursesData = await coursesRes.json()
                console.log("Courses Data Fetched:", coursesData);
                const batchIds = new Set<number>()

                // 2. Extract Batches where student is enrolled
                // Note: The API returns courses where student is enrolled in a batch. 
                // We need to identify *which* batch inside the course.
                // Assuming the course object has batches fully populated with students.
                // If not, we might need to iterate all batches.
                // Based on CourseController, it seems it returns Course with Batches. 
                // We'll iterate and check email match.

                coursesData.forEach((c: any) => {
                    if (c.batches) {
                        c.batches.forEach((b: any) => {
                            console.log(`Checking batch: ${b.name} (ID: ${b.id})`);
                            console.log("Students in batch:", b.students);

                            const isEnrolled = b.students?.some((s: any) => {
                                // Handle cases where s might be a string (email) or object
                                const sEmail = (typeof s === 'string') ? s : s.email;
                                const match = sEmail === studentEmail;
                                console.log(`Comparing '${sEmail}' with '${studentEmail}': ${match}`);
                                return match;
                            })

                            if (isEnrolled) {
                                console.log(`Student IS enrolled in batch ${b.id}`);
                                batchIds.add(b.id)
                            } else {
                                console.log(`Student IS NOT enrolled in batch ${b.id}`);
                            }
                        })
                    }
                })

                if (batchIds.size === 0) {
                    console.warn("No enrolled batches found for student (after filtering).");
                    setSessions([])
                    setLoading(false)
                    return
                }

                // 3. Fetch Sessions for each batch
                const allSessions: Session[] = []
                for (const batchId of Array.from(batchIds)) {
                    const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/sessions/batch/${batchId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                    if (sessionRes.ok) {
                        const batchSessions = await sessionRes.json()
                        allSessions.push(...batchSessions)
                    }
                }

                // Sort by start time
                allSessions.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                setSessions(allSessions)
            }
        } catch (error) {
            console.error('Failed to fetch sessions', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Virtual Classroom</h1>
                    <p className="text-muted-foreground mt-2">Join your live sessions</p>
                </div>
                <Button variant="ghost" onClick={fetchStudentSessions}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground">Loading your schedule...</div>
                ) : sessions.length === 0 ? (
                    <div className="col-span-full text-center py-10">
                        <div className="flex justify-center mb-4">
                            <Calendar className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-medium">No upcoming sessions</h3>
                        <p className="text-muted-foreground">You don't have any scheduled classes at the moment.</p>
                    </div>
                ) : (
                    sessions.map(session => (
                        <Card key={session.id} className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="secondary" className="mb-2">
                                        {session.batchName}
                                    </Badge>
                                    <Badge variant={new Date(session.endTime) < new Date() ? "outline" : "default"}>
                                        {new Date(session.endTime) < new Date() ? "Ended" : "Upcoming"}
                                    </Badge>
                                </div>
                                <CardTitle className="line-clamp-1 text-lg">{session.title}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[2.5rem]">{session.description || "No description provided."}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        {new Date(session.startTime).toLocaleDateString()} • {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span>{session.batchName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="w-4 h-4" />
                                    <span>{session.tutorName}</span>
                                </div>

                                <Button className="w-full mt-2 gap-2 shadow-sm text-white font-semibold tracking-wide"
                                    variant={new Date(session.endTime) < new Date() ? "secondary" : "default"}
                                    disabled={new Date(session.endTime) < new Date()}
                                    asChild>
                                    <a href={session.sessionLink} target="_blank" rel="noopener noreferrer">
                                        <Video className="w-4 h-4" />
                                        {new Date(session.endTime) < new Date() ? "Session Ended" : "Join Class"}
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
