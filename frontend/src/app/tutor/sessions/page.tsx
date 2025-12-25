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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar, Clock, Video, Plus, Link as LinkIcon, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

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

export default function TutorSessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [batches, setBatches] = useState<Batch[]>([])
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [tutorId, setTutorId] = useState<number | null>(null)

    // Form State
    const [newSession, setNewSession] = useState({
        title: '',
        description: '',
        startTime: '',
        duration: '60', // minutes
        sessionLink: '',
        batchId: '',
    })

    useEffect(() => {
        fetchUserData()
    }, [])

    useEffect(() => {
        if (tutorId) {
            fetchSessions()
            fetchBatches()
        }
    }, [tutorId])

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("tutorToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/v1/tutor/me`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setTutorId(data.id)
            }
        } catch (error) {
            console.error("Failed to fetch user data", error)
        }
    }

    const fetchSessions = async () => {
        if (!tutorId) return
        try {
            const token = localStorage.getItem("tutorToken");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/sessions/tutor/${tutorId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setSessions(data)
            }
        } catch (error) {
            console.error('Failed to fetch sessions', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchBatches = async () => {
        if (!tutorId) return
        try {
            const token = localStorage.getItem("tutorToken");
            // Get courses for tutor (assuming this user is tutor)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/courses/tutors/${tutorId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                const coursesData = await res.json()
                const allBatches: Batch[] = []
                coursesData.forEach((c: any) => {
                    if (c.batches) {
                        c.batches.forEach((b: any) => allBatches.push({ id: b.id, name: `${c.title} - ${b.name}`, courseId: c.id }))
                    }
                })
                setBatches(allBatches)
            }
        } catch (error) {
            console.error('Failed to fetch batches', error)
        }
    }

    const handleCreateSession = async () => {
        try {
            const token = localStorage.getItem("tutorToken");
            const startTime = new Date(newSession.startTime)
            const endTime = new Date(startTime.getTime() + parseInt(newSession.duration) * 60000)

            const endDateTimeLocal = new Date(endTime.getTime() - endTime.getTimezoneOffset() * 60000).toISOString().slice(0, 19);

            const payload = {
                title: newSession.title,
                description: newSession.description,
                sessionLink: newSession.sessionLink,
                startTime: newSession.startTime,
                endTime: endDateTimeLocal,
                batchId: parseInt(newSession.batchId),
                tutorId: tutorId
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setIsCreateOpen(false)
                fetchSessions()
                setNewSession({
                    title: '',
                    description: '',
                    startTime: '',
                    duration: '60',
                    sessionLink: '',
                    batchId: '',
                })
                const errData = await res.json().catch(() => ({}));
                console.error("Server Error:", errData);
                alert(`Failed to create session: ${errData.message || res.statusText || "Unknown error"}`);
            }
        } catch (error) {
            console.error('Failed to create session', error)
            alert("An execution error occurred. Check console for details.");
        }
    }

    const generateMeetingLink = () => {
        const roomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const origin = window.location.origin;
        setNewSession({ ...newSession, sessionLink: `${origin}/meeting/${roomId}` })
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Online Sessions</h1>
                    <p className="text-muted-foreground mt-2">Manage your upcoming classes</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Schedule Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Schedule Class</DialogTitle>
                            <DialogDescription>
                                Create a new online session for your batch.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Topic</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Week 4 Review"
                                    value={newSession.title}
                                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description (Optional)</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Details about the session..."
                                    value={newSession.description}
                                    onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start">Start Time</Label>
                                    <Input
                                        id="start"
                                        type="datetime-local"
                                        value={newSession.startTime}
                                        onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="duration">Duration</Label>
                                    <Select
                                        value={newSession.duration}
                                        onValueChange={(val) => setNewSession({ ...newSession, duration: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30">30 min</SelectItem>
                                            <SelectItem value="45">45 min</SelectItem>
                                            <SelectItem value="60">1 hour</SelectItem>
                                            <SelectItem value="90">1.5 hours</SelectItem>
                                            <SelectItem value="120">2 hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="batch">Batch</Label>
                                <Select
                                    value={newSession.batchId}
                                    onValueChange={(val) => setNewSession({ ...newSession, batchId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map(b => (
                                            <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="link">Meeting Link</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="link"
                                        placeholder="https://zoom.us/..."
                                        value={newSession.sessionLink}
                                        onChange={(e) => setNewSession({ ...newSession, sessionLink: e.target.value })}
                                    />
                                    <Button type="button" variant="outline" onClick={generateMeetingLink}>
                                        Generate Meeting ID
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateSession}>Schedule</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground">Loading sessions...</div>
                ) : sessions.length === 0 ? (
                    <div className="col-span-full text-center py-10">
                        <div className="flex justify-center mb-4">
                            <Calendar className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-medium">No sessions scheduled</h3>
                        <p className="text-muted-foreground">You haven't scheduled any classes yet.</p>
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

                                <Button className="w-full mt-2 gap-2" variant="outline" asChild>
                                    <a href={session.sessionLink} target="_blank" rel="noopener noreferrer">
                                        <Video className="w-4 h-4" /> Start Meeting
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
