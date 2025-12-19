'use client'

import { useEffect, useState } from 'react'
import { FileText, Clock, CheckCircle2, Search, Upload, Loader2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { getAssignments } from '@/lib/api-assignments'
import { createSubmission, getStudentSubmissions } from '@/lib/api-submissions'

export default function StudentAssignmentsPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [assignments, setAssignments] = useState<any[]>([])
    const [studentSubmissions, setStudentSubmissions] = useState<any[]>([])
    const [isSubmitOpen, setIsSubmitOpen] = useState(false)
    const [selectedAsg, setSelectedAsg] = useState<any>(null)
    const [submissionContent, setSubmissionContent] = useState('')
    const [viewSub, setViewSub] = useState<any>(null)
    const [isViewOpen, setIsViewOpen] = useState(false)

    const [studentProfile, setStudentProfile] = useState<any>(null)

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('studentToken')
            if (!token) return;

            // Fetch profile to get email
            const profileRes = await fetch('http://localhost:8081/api/v1/student/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const profile = await profileRes.json()
            setStudentProfile(profile)

            const [asgData, subData] = await Promise.all([
                getAssignments(),
                getStudentSubmissions(profile.email)
            ])
            console.log("Student Profile Email:", profile.email)
            console.log("Assignments Loaded:", asgData)
            console.log("Submissions Loaded:", subData)

            setAssignments(Array.isArray(asgData) ? asgData.filter(a => a.status === 'Active') : [])
            setStudentSubmissions(Array.isArray(subData) ? subData : [])
        } catch (error) {
            console.error("Failed to load assignments", error)
        } finally {
            setLoading(false)
        }
    }

    const getSubmission = (asgId: any) => {
        return studentSubmissions.find(s => String(s.itemId) === String(asgId))
    }

    const getSubmissionStatus = (asgId: any) => {
        const sub = getSubmission(asgId)
        return sub ? sub.status : 'Pending'
    }

    const handleFileUpload = async () => {
        if (!submissionContent) {
            toast({ title: "Error", description: "Please provide your submission content.", variant: "destructive" })
            return
        }

        try {
            await createSubmission({
                studentEmail: studentProfile.email,
                studentName: (`${studentProfile.firstName || ''} ${studentProfile.lastName || ''}`).trim(),
                itemId: selectedAsg.id,
                itemTitle: selectedAsg.title,
                itemType: 'Assignment',
                course: selectedAsg.course,
                batch: selectedAsg.batch,
                content: submissionContent,
                status: 'Pending Review'
            })
            setIsSubmitOpen(false)
            setSubmissionContent('')
            loadData()
            toast({ title: "Submitted", description: "Your assignment has been turned in successfully." })
        } catch (error) {
            toast({ title: "Error", description: "Failed to submit assignment.", variant: "destructive" })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-4xl font-bold font-headline tracking-tighter text-primary">My Assignments</h1>
                <p className="text-lg text-muted-foreground mt-2">Track your progress and submit your course work.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5">
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Total Assigned</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{assignments.length}</div></CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-100">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-orange-700">Due Soon</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-orange-700">2</div></CardContent>
                </Card>
                <Card className="bg-green-50 border-green-100">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-green-700">Completed</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-green-700">{studentSubmissions.length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Assignments</CardTitle>
                    <CardDescription>Assignments from all your enrolled courses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Marks</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.map((asg) => {
                                const sub = getSubmission(asg.id);
                                const status = sub ? sub.status : 'Pending';
                                return (
                                    <TableRow key={asg.id}>
                                        <TableCell className="font-semibold">{asg.title}</TableCell>
                                        <TableCell>{asg.course}</TableCell>
                                        <TableCell><div className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {asg.dueDate}</div></TableCell>
                                        <TableCell>
                                            <Badge variant={status === 'Pending' ? 'outline' : 'default'} className={status === 'Graded' ? 'bg-green-500' : status === 'Pending Review' ? 'bg-blue-500' : ''}>
                                                {status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {sub ? (
                                                <span className="font-bold">{sub.grade !== null && sub.grade !== undefined ? `${sub.grade}/100` : '-'}</span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {status === 'Pending' ? (
                                                <Button size="sm" onClick={() => { setSelectedAsg(asg); setIsSubmitOpen(true); }}>
                                                    <Upload className="h-3 w-3 mr-1" /> Submit Work
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="sm" onClick={() => { setViewSub(sub); setIsViewOpen(true); }}>
                                                    View Work
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Assignment</DialogTitle>
                        <DialogDescription>Submit your work for "{selectedAsg?.title}"</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Submission Content / Links</Label>
                            <Textarea
                                placeholder="Paste your git link or work content here..."
                                className="min-h-[150px]"
                                value={submissionContent}
                                onChange={(e) => setSubmissionContent(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleFileUpload}>Submit Now</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>My Submission</DialogTitle>
                        <DialogDescription>Details for "{viewSub?.itemTitle}"</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1">
                            <Label className="text-xs uppercase text-muted-foreground">Status</Label>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={viewSub?.status === 'Graded' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}>
                                    {viewSub?.status}
                                </Badge>
                                {viewSub?.status === 'Graded' && (
                                    <span className="font-bold text-lg text-primary">{viewSub?.grade}/100</span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs uppercase text-muted-foreground">Submitted Content</Label>
                            <div className="p-3 bg-muted rounded-md text-sm break-all">
                                {viewSub?.content?.includes('http') ? (
                                    <a href={viewSub.content} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline italic">
                                        {viewSub.content}
                                    </a>
                                ) : (
                                    viewSub?.content
                                )}
                            </div>
                        </div>
                        {viewSub?.feedback && (
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-muted-foreground">Tutor Feedback</Label>
                                <div className="p-3 bg-orange-50 text-orange-800 rounded-md text-sm italic">
                                    "{viewSub.feedback}"
                                </div>
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label className="text-xs uppercase text-muted-foreground">Submitted At</Label>
                            <p className="text-sm text-muted-foreground">{viewSub?.submittedAt}</p>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
