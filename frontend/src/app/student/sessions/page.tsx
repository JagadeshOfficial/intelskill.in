'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Video, Download, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getSessionsForStudent, Session } from '@/lib/api-sessions'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function StudentSessionsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadSessions()
    }, [])

    const loadSessions = async () => {
        try {
            let studentId = localStorage.getItem('studentId')
            const token = localStorage.getItem('jwtToken')

            // Fallback: fetch profile if ID missing
            if (!studentId && token) {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
                try {
                    const profileRes = await fetch(`${API_URL}/api/v1/student/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (profileRes.ok) {
                        const profile = await profileRes.json();
                        if (profile.id) {
                            studentId = profile.id.toString();
                            localStorage.setItem('studentId', studentId!);
                        }
                    }
                } catch (e) {
                    console.error("Failed to fetch profile for ID", e);
                }
            }

            if (!studentId) {
                // If still no ID, redirect to login
                toast({
                    variant: "destructive",
                    title: "Access Denied",
                    description: "Please log in to view sessions.",
                })
                // router.push('/login') // Optional: enforce login
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            const data = await getSessionsForStudent(Number(studentId))
            setSessions(data)
        } catch (error) {
            console.error('Failed to load sessions:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load sessions",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline tracking-tighter">Live Sessions</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Join live sessions with your tutors.
                </p>
            </header>
            <main className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center p-8">Loading...</div>
                ) : sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                        <Calendar className="h-12 w-12 mb-4 opacity-20" />
                        <p>No scheduled sessions found for your batches.</p>
                    </div>
                ) : (
                    sessions.map(session => (
                        <Card key={session.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="font-headline text-xl">{session.title}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {session.course.title} • {session.batch.name}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={session.status === 'SCHEDULED' ? 'default' : 'secondary'}>
                                        {session.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {format(new Date(session.startTime), 'EEEE, MMMM d, yyyy')}
                                            <br />
                                            {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                                        </span>
                                    </div>
                                    <div className="text-sm">
                                        <p className="text-muted-foreground">Tutor:</p>
                                        <p className="font-medium">{session.tutor.firstName} {session.tutor.lastName}</p>
                                    </div>
                                </div>
                                {session.description && (
                                    <div className="mt-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                                        {session.description}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 bg-slate-50/50 pt-4">
                                {session.status === 'SCHEDULED' && session.meetingLink ? (
                                    <Button asChild size="lg" className="w-full md:w-auto">
                                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                                            <Video className="mr-2 h-4 w-4" />
                                            Join Live Session
                                        </a>
                                    </Button>
                                ) : (
                                    <Button disabled variant="outline">
                                        <Video className="mr-2 h-4 w-4" />
                                        Wait for Link
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))
                )}
            </main>
        </div>
    );
}
