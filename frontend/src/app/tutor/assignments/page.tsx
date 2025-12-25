'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, FileText, Users, Clock, CheckCircle2, MoreVertical, Download, BarChart3, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useToast } from '@/hooks/use-toast'
import { getCoursesForTutor } from '@/lib/api-courses'
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from '@/lib/api-assignments'
import { getSubmissions, updateSubmission } from '@/lib/api-submissions'

export default function TutorAssignmentsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const { toast } = useToast()

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isArchiveOpen, setIsArchiveOpen] = useState(false)
    const [isGradeOpen, setIsGradeOpen] = useState(false)
    const [selectedAsg, setSelectedAsg] = useState<any>(null)
    const [selectedSub, setSelectedSub] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [assignments, setAssignments] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [submissions, setSubmissions] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [availableBatches, setAvailableBatches] = useState<any[]>([])

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        course: '',
        batch: '',
        dueDate: '',
        description: ''
    })

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const tutorId = localStorage.getItem('tutorId')
            const courseData = tutorId ? await getCoursesForTutor(tutorId) : []
            setCourses(Array.isArray(courseData) ? courseData : [])

            const courseTitles = Array.isArray(courseData) ? courseData.map((c: any) => c.title) : []

            const [asgData, subData, studentRes] = await Promise.all([
                getAssignments(undefined, courseTitles),
                getSubmissions(),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/v1/auth/admin/students`)
            ])
            setAssignments(Array.isArray(asgData) ? asgData : [])
            setSubmissions(Array.isArray(subData) ? subData.filter(s => s.itemType === 'Assignment') : [])

            const studentData = await studentRes.json()
            setStudents(studentData.students || [])
        } catch (error) {
            console.error("Failed to load data", error)
            toast({ title: "Error", description: "Failed to connect to backend service.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const refreshAssignments = async () => {
        const tutorId = localStorage.getItem('tutorId')
        const courseTitles = courses.map((c: any) => c.title)
        const [asgData, subData] = await Promise.all([
            getAssignments(undefined, courseTitles),
            getSubmissions()
        ])
        setAssignments(Array.isArray(asgData) ? asgData : [])
        setSubmissions(Array.isArray(subData) ? subData.filter(s => s.itemType === 'Assignment') : [])
    }

    const filteredAssignments = assignments.filter(asg =>
        asg.status !== 'Archived' && (
            asg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asg.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asg.batch?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    )

    const filteredSubmissions = submissions.filter(sub =>
        sub.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.itemTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Dynamic Stats
    const totalAssignments = filteredAssignments.length
    const pendingReviewsCount = submissions.filter(s => s.status !== 'Graded').length
    const completedCount = submissions.filter(s => s.status === 'Graded').length

    const getGradeDistribution = () => {
        const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 }
        submissions.filter(s => s.status === 'Graded').forEach(s => {
            const g = s.grade
            if (g >= 90) counts.A++
            else if (g >= 80) counts.B++
            else if (g >= 70) counts.C++
            else if (g >= 60) counts.D++
            else counts.F++
        })
        const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
        return [
            { label: 'A', value: Math.round((counts.A / total) * 100), color: 'bg-green-500' },
            { label: 'B', value: Math.round((counts.B / total) * 100), color: 'bg-blue-500' },
            { label: 'C', value: Math.round((counts.C / total) * 100), color: 'bg-yellow-500' },
            { label: 'D', value: Math.round((counts.D / total) * 100), color: 'bg-orange-500' },
            { label: 'F', value: Math.round((counts.F / total) * 100), color: 'bg-red-500' },
        ]
    }
    const gradeDist = getGradeDistribution()

    // Dynamic Pending Submissions Calculation
    const getPendingSubmissions = () => {
        const pending: any[] = []
        assignments.filter(a => a.status === 'Active').forEach(asg => {
            const enrolled = students.filter(s => {
                const courses = Array.isArray(s.enrolledCourses) ? s.enrolledCourses : []
                return courses.some((c: any) => c.courseName === asg.course && c.batchName === asg.batch)
            })

            enrolled.forEach(student => {
                const hasSubmitted = submissions.some(sub =>
                    String(sub.itemId) === String(asg.id) && sub.studentEmail === student.email
                )
                if (!hasSubmitted) {
                    pending.push({
                        name: `${student.firstName} ${student.lastName}`,
                        asg: asg.title,
                        due: asg.dueDate || 'No date'
                    })
                }
            })
        })
        return pending.slice(0, 5)
    }
    const pendingList = getPendingSubmissions()

    const handleCreateAssignment = async () => {
        if (!formData.title || !formData.course || !formData.batch) {
            toast({ title: "Error", description: "Title, Course, and Batch are required.", variant: "destructive" })
            return
        }

        try {
            const tutorId = localStorage.getItem('tutorId')
            await createAssignment({
                ...formData,
                status: 'Active',
                totalSubmissions: 0,
                pendingReviews: 0,
                creatorId: tutorId
            })
            setIsCreateOpen(false)
            setFormData({ title: '', course: '', batch: '', dueDate: '', description: '' })
            setAvailableBatches([])
            await refreshAssignments()
            toast({ title: "Success", description: "New assignment published successfully." })
        } catch (error) {
            toast({ title: "Error", description: "Failed to create assignment.", variant: "destructive" })
        }
    }

    const handleEditAssignment = async () => {
        if (!selectedAsg) return
        try {
            await updateAssignment(selectedAsg.id, selectedAsg)
            setIsEditOpen(false)
            await refreshAssignments()
            toast({ title: "Updated", description: "Assignment updated successfully." })
        } catch (error) {
            toast({ title: "Error", description: "Failed to update assignment.", variant: "destructive" })
        }
    }

    const handleArchive = async () => {
        if (selectedAsg) {
            try {
                await updateAssignment(selectedAsg.id, {
                    ...selectedAsg,
                    status: 'Deletion Requested'
                })
                setIsArchiveOpen(false)
                await refreshAssignments()
                toast({ title: "Request Sent", description: "Deletion request sent to admin for approval." })
            } catch (error) {
                toast({ title: "Error", description: "Failed to send deletion request.", variant: "destructive" })
            }
        }
    }

    const handleGrade = (sub: any) => {
        setSelectedSub({ ...sub })
        setIsGradeOpen(true)
    }

    const handleSaveGrade = async () => {
        if (!selectedSub) return
        try {
            await updateSubmission(selectedSub.id, {
                ...selectedSub,
                status: 'Graded'
            })
            setIsGradeOpen(false)
            await refreshAssignments()
            toast({
                title: "Graded",
                description: "Student submission has been graded successfully.",
            })
        } catch (error) {
            toast({ title: "Error", description: "Failed to save grade.", variant: "destructive" })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Loading assignments...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-headline tracking-tighter text-primary">Assignment Center</h1>
                    <p className="text-lg text-muted-foreground mt-2 text-primary/80">Manage your course assignments and student submissions.</p>
                </div>
                <div className="flex gap-4">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4 pointer-events-none" /> Create Assignment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Create New Assignment</DialogTitle>
                                <DialogDescription>Assign tasks to your students for specific courses and batches.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">Title</Label>
                                    <Input id="title" placeholder="e.g. React Components Lab" className="col-span-3" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="course" className="text-right">Course</Label>
                                    <Select onValueChange={(val) => {
                                        const selectedCourse = courses.find(c => c.title === val)
                                        setFormData({ ...formData, course: val, batch: '' })
                                        setAvailableBatches(selectedCourse?.batches || [])
                                    }}>
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select Course" /></SelectTrigger>
                                        <SelectContent>
                                            {courses.map(course => <SelectItem key={course.id} value={course.title}>{course.title}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="batch" className="text-right">Batch</Label>
                                    <Select disabled={!formData.course} onValueChange={(val) => setFormData({ ...formData, batch: val })} value={formData.batch}>
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder={formData.course ? "Select Batch" : "Select course first"} /></SelectTrigger>
                                        <SelectContent>
                                            {availableBatches.map(batch => <SelectItem key={batch.id} value={batch.name}>{batch.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                                    <Input id="dueDate" type="date" className="col-span-3" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">Instructions</Label>
                                    <Textarea id="description" placeholder="Detailed assignment instructions..." className="col-span-3 min-h-[100px]" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                            </div>
                            <DialogFooter><Button onClick={handleCreateAssignment}>Publish to Students</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">My Total Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAssignments}</div>
                        <p className="text-xs text-muted-foreground">Active and Published</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingReviewsCount}</div>
                        <p className="text-xs text-muted-foreground">Submissions to grade</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Graded Work</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCount}</div>
                        <p className="text-xs text-muted-foreground">Successfully reviewed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Class Performance
                        </CardTitle>
                        <CardDescription>Grade distribution for graded submissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-4 h-48 pt-4">
                            {gradeDist.map((item) => (
                                <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className={`${item.color} w-full rounded-t-sm transition-all hover:opacity-80`}
                                        style={{ height: `${item.value}%` }}
                                        title={`${item.value}%`}
                                    />
                                    <span className="text-xs font-bold">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Pending Submissions
                        </CardTitle>
                        <CardDescription>Recent activity overview.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingList.map((student, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex gap-3 items-center">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-xs uppercase text-primary/70">
                                            {student.name.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="font-medium">{student.name}</p>
                                            <p className="text-xs text-muted-foreground">{student.asg}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-orange-600 bg-orange-50 border-orange-200">
                                        {student.due}
                                    </Badge>
                                </div>
                            ))}
                            {pendingList.length === 0 && (
                                <p className="text-sm text-center text-muted-foreground py-10">No pending work! 🎉</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="all">Active Assignments</TabsTrigger>
                        <TabsTrigger value="submissions">Student Work</TabsTrigger>
                    </TabsList>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input placeholder="Search..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <TabsContent value="all" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Assignments</CardTitle>
                            <CardDescription>View and manage assignments you have assigned.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAssignments.map((asg) => (
                                        <TableRow key={asg.id}>
                                            <TableCell className="font-semibold">{asg.title}</TableCell>
                                            <TableCell>{asg.course}</TableCell>
                                            <TableCell><Badge variant="outline">{asg.batch}</Badge></TableCell>
                                            <TableCell>{asg.dueDate}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4 pointer-events-none" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => { setSelectedAsg(asg); setIsEditOpen(true); }}>Edit</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedAsg(asg); setIsArchiveOpen(true); }}>Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredAssignments.length === 0 && (
                                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No assignments found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="submissions">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Submissions</CardTitle>
                            <CardDescription>Track student progress and grade their work.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Assignment</TableHead>
                                        <TableHead>Submitted At</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSubmissions.map((sub) => (
                                        <TableRow key={sub.id}>
                                            <TableCell className="font-medium">{sub.studentName}</TableCell>
                                            <TableCell>{sub.itemTitle}</TableCell>
                                            <TableCell>{sub.submittedAt}</TableCell>
                                            <TableCell><Badge className={sub.status === 'Graded' ? 'bg-green-500' : 'bg-orange-500'}>{sub.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleGrade(sub)}>
                                                    {sub.status === 'Graded' ? 'Edit Grade' : 'Review & Grade'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredSubmissions.length === 0 && (
                                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No submissions found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Review & Grade Dialog */}
            <Dialog open={isGradeOpen} onOpenChange={setIsGradeOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Review & Grade Submission</DialogTitle>
                        <DialogDescription>
                            Review the student's work and provide a grade and feedback.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSub && (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-muted-foreground">Student</Label>
                                <p className="font-medium text-sm">{selectedSub.studentName} ({selectedSub.studentEmail})</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-muted-foreground">Assignment</Label>
                                <p className="font-medium text-sm">{selectedSub.itemTitle}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-muted-foreground">Submitted Content</Label>
                                <div className="p-3 bg-muted rounded-md text-sm break-all max-h-[150px] overflow-auto">
                                    {selectedSub.content?.includes('http') ? (
                                        <a href={selectedSub.content} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline italic">
                                            {selectedSub.content}
                                        </a>
                                    ) : (
                                        selectedSub.content || "No content submitted"
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="grade-tutor" className="text-right">Grade (0-100)</Label>
                                <Input
                                    id="grade-tutor"
                                    type="number"
                                    value={selectedSub.grade || ''}
                                    onChange={(e) => setSelectedSub({ ...selectedSub, grade: parseInt(e.target.value) })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="feedback-tutor" className="text-right">Feedback</Label>
                                <Textarea
                                    id="feedback-tutor"
                                    placeholder="Provide constructive feedback..."
                                    className="col-span-3 min-h-[100px]"
                                    value={selectedSub.feedback || ''}
                                    onChange={(e) => setSelectedSub({ ...selectedSub, feedback: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsGradeOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveGrade}>Save Grade</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Deletion Request Confirmation */}
            <AlertDialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Request Deletion?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will send a request to the admin to delete "{selectedAsg?.title}".
                            You cannot undo this request once sent.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleArchive} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Send Request
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Assignment Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Assignment</DialogTitle>
                        <DialogDescription>Modify the details of the assignment.</DialogDescription>
                    </DialogHeader>
                    {selectedAsg && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="asg-title" className="text-right">Title</Label>
                                <Input id="asg-title" className="col-span-3" value={selectedAsg.title} onChange={(e) => setSelectedAsg({ ...selectedAsg, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="asg-dueDate" className="text-right">Due Date</Label>
                                <Input id="asg-dueDate" type="date" className="col-span-3" value={selectedAsg.dueDate} onChange={(e) => setSelectedAsg({ ...selectedAsg, dueDate: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="asg-desc" className="text-right">Instructions</Label>
                                <Textarea id="asg-desc" className="col-span-3 min-h-[100px]" value={selectedAsg.description} onChange={(e) => setSelectedAsg({ ...selectedAsg, description: e.target.value })} />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditAssignment}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
