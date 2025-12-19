'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Calendar, Link as LinkIcon, ExternalLink } from 'lucide-react'
import { getSessions, deleteSession, Session } from '@/lib/api-sessions'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'

export default function SessionsPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadSessions()
    }, [])

    const loadSessions = async () => {
        try {
            setIsLoading(true)
            const data = await getSessions()
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

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this session?')) return

        try {
            await deleteSession(id)
            toast({
                title: "Success",
                description: "Session deleted successfully",
            })
            loadSessions()
        } catch (error) {
            console.error('Failed to delete session:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete session",
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
                    <p className="text-muted-foreground">
                        Manage scheduled classes and sessions.
                    </p>
                </div>
                <Link href="/admin/sessions/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Session
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">Loading...</div>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                            <Calendar className="h-12 w-12 mb-4 opacity-20" />
                            <p>No sessions found.</p>
                            <p className="text-sm">Create a new session to get started.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Course / Batch</TableHead>
                                    <TableHead>Tutor</TableHead>
                                    <TableHead>Schedule</TableHead>
                                    <TableHead>Meeting</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell className="font-medium">
                                            {session.title}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{session.course.title}</span>
                                                <span className="text-xs text-muted-foreground">{session.batch.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {session.tutor.firstName} {session.tutor.lastName}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span>{format(new Date(session.startTime), 'MMM d, yyyy')}</span>
                                                <span className="text-muted-foreground">
                                                    {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {session.meetingLink ? (
                                                <Button size="sm" variant="outline" className="h-8 gap-2" asChild>
                                                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                        Join Meeting
                                                    </a>
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No Link</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                                session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {session.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(session.id)}
                                                className="text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
