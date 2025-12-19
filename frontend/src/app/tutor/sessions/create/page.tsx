'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createSession } from '@/lib/api-sessions'
import { getCoursesForTutor, getBatches } from '@/lib/api-courses'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateTutorSessionPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [courses, setCourses] = useState<any[]>([])
    const [batches, setBatches] = useState<any[]>([])

    // Auth state
    const [tutorId, setTutorId] = useState<number | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        batchId: '',
        startTime: '',
        endTime: '',
        meetingLink: '',
    })

    useEffect(() => {
        // Get logged-in tutor ID
        const storedTutorId = localStorage.getItem('tutorId')
        if (storedTutorId) {
            setTutorId(Number(storedTutorId))
            loadTutorCourses(Number(storedTutorId))
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in as a tutor to schedule sessions.'
            })
            router.push('/login')
        }
    }, [])

    const loadTutorCourses = async (id: number) => {
        try {
            const data = await getCoursesForTutor(id)
            setCourses(data)
        } catch (error) {
            console.error('Failed to load courses')
        }
    }

    const handleCourseChange = async (courseId: string) => {
        setFormData(prev => ({ ...prev, courseId, batchId: '' }))
        setBatches([])

        if (courseId) {
            try {
                const batchData = await getBatches(Number(courseId))
                setBatches(batchData)
            } catch (error) {
                console.error('Failed to load batches')
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!tutorId) return

        setLoading(true)

        try {
            await createSession({
                title: formData.title,
                description: formData.description,
                courseId: Number(formData.courseId),
                batchId: Number(formData.batchId),
                tutorId: tutorId, // Auto-use logged-in tutor ID
                startTime: new Date(formData.startTime).toISOString(),
                endTime: new Date(formData.endTime).toISOString(),
                meetingLink: formData.meetingLink, // Optional
            })
            toast({
                title: "Success",
                description: "Session scheduled successfully",
            })
            router.push('/tutor/sessions')
        } catch (error: any) {
            console.error('Failed to create session:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || 'Failed to create session',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 p-6">
            <div className="flex items-center gap-4">
                <Link href="/tutor/sessions">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Schedule New Session</h1>
                    <p className="text-muted-foreground">
                        Create a class session for one of your courses.
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="title">Session Title</Label>
                            <Input
                                id="title"
                                required
                                placeholder="e.g. Weekly Q&A"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Agenda for the session..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="course">Course</Label>
                                <Select
                                    value={formData.courseId}
                                    onValueChange={handleCourseChange}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.length > 0 ? (
                                            courses.map((course) => (
                                                <SelectItem key={course.id} value={String(course.id)}>
                                                    {course.title}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                No courses assigned
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="batch">Batch</Label>
                                <Select
                                    value={formData.batchId}
                                    onValueChange={(val) => setFormData({ ...formData, batchId: val })}
                                    disabled={!formData.courseId}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {batches.map((batch) => (
                                            <SelectItem key={batch.id} value={String(batch.id)}>
                                                {batch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Start Time</Label>
                                <Input
                                    id="startTime"
                                    type="datetime-local"
                                    required
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endTime">End Time</Label>
                                <Input
                                    id="endTime"
                                    type="datetime-local"
                                    required
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                            <Input
                                id="meetingLink"
                                type="url"
                                placeholder="https://meet.google.com/..."
                                value={formData.meetingLink}
                                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave blank to auto-generate a secure Jitsi Meet link.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link href="/tutor/sessions">
                                <Button variant="outline" type="button">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Schedule Session
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
