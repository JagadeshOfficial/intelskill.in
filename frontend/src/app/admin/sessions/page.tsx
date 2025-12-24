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
import { Calendar, Clock, Video, Plus, Link as LinkIcon, Users, User, Edit, Trash2 } from 'lucide-react'
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

interface Tutor {
    id: number
    firstName: string
    lastName: string
}

export default function AdminSessionsPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [batches, setBatches] = useState<Batch[]>([])
    const [tutors, setTutors] = useState<Tutor[]>([])
    const [courses, setCourses] = useState<any[]>([]) // To derive batches
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [editingSessionId, setEditingSessionId] = useState<number | null>(null)

    // Form State
    const [newSession, setNewSession] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '', // Explicit end time
        sessionLink: '',
        batchId: '',
        tutorId: ''
    })

    useEffect(() => {
        fetchSessions()
        fetchMetadata()
    }, [])

    const fetchSessions = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            // Using auth-service URL (8081)
            const res = await fetch('http://localhost:8081/sessions', {
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

    const fetchMetadata = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const headers = { "Authorization": `Bearer ${token}` };

            // Fetch Courses to get Batches
            const coursesRes = await fetch('http://localhost:8081/api/courses', { headers })
            if (coursesRes.ok) {
                const coursesData = await coursesRes.json()
                setCourses(coursesData)
                // Flatten batches
                const allBatches: Batch[] = []
                coursesData.forEach((c: any) => {
                    if (c.batches) {
                        c.batches.forEach((b: any) => allBatches.push({ id: b.id, name: `${c.title} - ${b.name}`, courseId: c.id }))
                    }
                })
                setBatches(allBatches)
            }

            // Fetch Tutors
            const tutorsRes = await fetch('http://localhost:8081/api/v1/auth/admin/tutors', { headers })
            if (tutorsRes.ok) {
                const tutorsData = await tutorsRes.json()
                setTutors(tutorsData.tutors)
            }
        } catch (error) {
            console.error('Failed to fetch metadata', error)
        }
    }

    const handleCreateSession = async () => {
        try {
            const token = localStorage.getItem("adminToken");
            const startTime = new Date(newSession.startTime)
            const endTime = new Date(newSession.endTime)

            // Format End Time for Backend (Local ISO without timezone)
            const endDateTimeLocal = endTime.toISOString().slice(0, 19);

            const payload = {
                title: newSession.title,
                description: newSession.description,
                sessionLink: newSession.sessionLink,
                startTime: newSession.startTime,
                endTime: endDateTimeLocal,
                batchId: parseInt(newSession.batchId),
                tutorId: parseInt(newSession.tutorId)
            }

            const url = editingSessionId
                ? `http://localhost:8081/sessions/${editingSessionId}`
                : 'http://localhost:8081/sessions';

            const method = editingSessionId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                setIsCreateOpen(false)
                fetchSessions()
                // Reset form
                setNewSession({
                    title: '',
                    description: '',
                    startTime: '',
                    endTime: '',
                    sessionLink: '',
                    batchId: '',
                    tutorId: ''
                })
                setEditingSessionId(null)
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error("Server Error:", errData);
                alert(`Failed to ${editingSessionId ? 'update' : 'create'} session: ${errData.message || res.statusText || "Unknown error"}`);
            }
        } catch (error) {
            console.error('Failed to save session', error)
            alert("An execution error occurred. Check console for details.");
        }
    }

    const handleDeleteSession = async (id: number) => {
        if (!confirm("Are you sure you want to delete this session?")) return;
        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`http://localhost:8081/sessions/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                fetchSessions();
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error("Delete failed:", errData);
                if (res.status === 404) {
                    alert("Error 404: The delete endpoint was not found. \n\nIt looks like the backend server is running an older version of the code.\n\nPLEASE RESTART THE BACKEND SERVER (mvn spring-boot:run) to apply the recent changes.");
                } else {
                    alert(`Failed to delete session (Status: ${res.status}): ${errData.message || res.statusText || "Unknown error"}`);
                }
            }
        } catch (error) {
            console.error("Failed to delete session", error);
            alert("Execution error during delete. Ensure backend is running.");
        }
    }

    const handleEditSession = (session: Session) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);

        // Helper to format date for datetime-local input
        const pad = (n: number) => n < 10 ? '0' + n : n;
        const toLocalISO = (d: Date) => {
            return d.getFullYear() + '-' +
                pad(d.getMonth() + 1) + '-' +
                pad(d.getDate()) + 'T' +
                pad(d.getHours()) + ':' +
                pad(d.getMinutes());
        }

        setNewSession({
            title: session.title,
            description: session.description,
            startTime: toLocalISO(start),
            endTime: toLocalISO(end),
            sessionLink: session.sessionLink,
            batchId: session.batchId.toString(),
            tutorId: session.tutorId.toString()
        });
        setEditingSessionId(session.id);
        setIsCreateOpen(true);
    }

    // Reset form when dialog closes
    const handleOpenChange = (open: boolean) => {
        setIsCreateOpen(open);
        if (!open) {
            setNewSession({
                title: '',
                description: '',
                startTime: '',
                endTime: '',
                sessionLink: '',
                batchId: '',
                tutorId: ''
            });
            setEditingSessionId(null);
        }
    }

    const generateMeetingLink = () => {
        // Generate a unique room ID
        const roomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const origin = window.location.origin;
        setNewSession({ ...newSession, sessionLink: `${origin}/meeting/${roomId}` })
    }

    const calculateDuration = (start: string, end: string) => {
        if (!start || !end) return '';
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        if (isNaN(startTime) || isNaN(endTime)) return '';

        const diffMs = endTime - startTime;
        if (diffMs < 0) return '(Invalid range)';

        const diffMins = Math.round(diffMs / 60000);
        if (diffMins < 60) return `${diffMins} mins`;

        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
        return `${hours} hr ${mins} min`;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Online Sessions</h1>
                    <p className="text-muted-foreground mt-2">Schedule and manage virtual classrooms</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Schedule New Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingSessionId ? 'Update Meeting' : 'Schedule Meeting'}</DialogTitle>
                            <DialogDescription>
                                {editingSessionId ? 'Update details for this session.' : 'Create a new online session for a batch.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Topic</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Advanced Java Concepts"
                                    value={newSession.title}
                                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description (Optional)</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Agenda for the meeting..."
                                    value={newSession.description}
                                    onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Time Limit (Duration)</Label>
                                <Select onValueChange={(val) => {
                                    const minutes = parseInt(val);
                                    let start = newSession.startTime ? new Date(newSession.startTime) : new Date();
                                    // Round to next 15 min if calculating from now
                                    if (!newSession.startTime) {
                                        const ms = 1000 * 60 * 15;
                                        start = new Date(Math.ceil(start.getTime() / ms) * ms);
                                    }

                                    const end = new Date(start.getTime() + minutes * 60000);

                                    // Format to local ISO for inputs
                                    const pad = (n: number) => n < 10 ? '0' + n : n;
                                    const toMsg = (d: Date) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());

                                    setNewSession({
                                        ...newSession,
                                        startTime: toMsg(start),
                                        endTime: toMsg(end)
                                    });
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select limit (e.g. 1 hour)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="30">30 Minutes</SelectItem>
                                        <SelectItem value="60">1 Hour</SelectItem>
                                        <SelectItem value="120">2 Hours</SelectItem>
                                        <SelectItem value="180">3 Hours</SelectItem>
                                        <SelectItem value="300">5 Hours</SelectItem>
                                        <SelectItem value="480">8 Hours</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                    <Label htmlFor="end">Expire Date</Label>
                                    <Input
                                        id="end"
                                        type="datetime-local"
                                        value={newSession.endTime}
                                        onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                                    />
                                </div>
                            </div>
                            {newSession.startTime && newSession.endTime && (
                                <div className="text-sm text-muted-foreground text-right">
                                    Duration: <span className="font-medium text-foreground">{calculateDuration(newSession.startTime, newSession.endTime)}</span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
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
                                    <Label htmlFor="tutor">Tutor</Label>
                                    <Select
                                        value={newSession.tutorId}
                                        onValueChange={(val) => setNewSession({ ...newSession, tutorId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Tutor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tutors.map(t => (
                                                <SelectItem key={t.id} value={t.id.toString()}>{t.firstName} {t.lastName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
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
                            <Button onClick={handleCreateSession}>{editingSessionId ? 'Update' : 'Schedule'}</Button>
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
                        <p className="text-muted-foreground">Get started by scheduling a new session.</p>
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
                                        {new Date(session.startTime).toLocaleDateString()} • {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <span className="ml-2 font-medium">({calculateDuration(session.startTime, session.endTime)})</span>
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

                                <div className="flex gap-2 mt-2">
                                    <Button className="flex-1 gap-2" variant="outline" asChild>
                                        <a href={session.sessionLink} target="_blank" rel="noopener noreferrer">
                                            <Video className="w-4 h-4" /> Join Meeting
                                        </a>
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => handleEditSession(session)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-9 w-9 text-destructive hover:text-destructive" onClick={() => handleDeleteSession(session.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div >
    )
}
