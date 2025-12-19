'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, FileText, Users, Clock, CheckCircle2, MoreVertical, Filter, Download, BarChart3, Loader2 } from 'lucide-react'
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
import { getCourses } from '@/lib/api-courses'
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from '@/lib/api-assignments'
import { getSubmissions, updateSubmission } from '@/lib/api-submissions'

const submissionsData = [
    {
        id: 'SUB-101',
        student: 'John Doe',
        assignment: 'React Hooks Implementation',
        submittedAt: '2025-12-18 10:30 AM',
        status: 'Pending Review',
        grade: '-',
    },
    {
        id: 'SUB-102',
        student: 'Jane Smith',
        assignment: 'React Hooks Implementation',
        submittedAt: '2025-12-18 11:15 AM',
        status: 'Graded',
        grade: 'A',
    },
    {
        id: 'SUB-103',
        student: 'Mike Johnson',
        assignment: 'Node.js Middleware Task',
        submittedAt: '2025-12-17 09:45 PM',
        status: 'Graded',
        grade: 'B+',
    },
]

export default function AssignmentsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const { toast } = useToast()

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isArchiveOpen, setIsArchiveOpen] = useState(false)
    const [isGradeOpen, setIsGradeOpen] = useState(false)
    const [isDelegateOpen, setIsDelegateOpen] = useState(false)
    const [selectedAsg, setSelectedAsg] = useState<any>(null)
    const [selectedSub, setSelectedSub] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [assignments, setAssignments] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [submissions, setSubmissions] = useState<any[]>([])
    const [tutors, setTutors] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])
    const [selectedTutorId, setSelectedTutorId] = useState<string>('')

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        course: '',
        batch: '',
        dueDate: '',
        description: ''
    })
    const [availableBatches, setAvailableBatches] = useState<any[]>([])

    useEffect(() => {
        const loadData = async () => {
            setLoading(true)
            try {
                const [asgData, courseData, subData] = await Promise.all([
                    getAssignments(),
                    getCourses(),
                    getSubmissions()
                ])
                setAssignments(Array.isArray(asgData) ? asgData : [])
                setCourses(Array.isArray(courseData) ? courseData : [])
                setSubmissions(Array.isArray(subData) ? subData.filter(s => s.itemType === 'Assignment') : [])

                // Fetch Tutors for delegation
                const tutorRes = await fetch('http://localhost:8081/api/v1/auth/admin/tutors')
                const tutorData = await tutorRes.json()
                setTutors(tutorData.tutors || [])

                // Fetch Students for pending list
                const studentRes = await fetch('http://localhost:8081/api/v1/auth/admin/students')
                const studentData = await studentRes.json()
                setStudents(studentData.students || [])
            } catch (error) {
                console.error("Failed to load data", error)
                toast({
                    title: "Error",
                    description: "Failed to connect to backend service.",
                    variant: "destructive"
                })
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const refreshAssignments = async () => {
        const [asgData, subData] = await Promise.all([
            getAssignments(),
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
    const pendingReviewsCount = submissions.filter(s => s.status !== 'Graded').length
    const completedCount = submissions.filter(s => s.status === 'Graded').length

    // Grade Distribution Calculation
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
            // Find students enrolled in this course/batch
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
        return pending.slice(0, 5) // Show top 5
    }

    const pendingList = getPendingSubmissions()

    const handleCreateAssignment = async () => {
        if (!formData.title || !formData.course || !formData.batch) {
            toast({ title: "Error", description: "Title, Course, and Batch are required.", variant: "destructive" })
            return
        }

        try {
            await createAssignment({
                ...formData,
                status: 'Active',
                totalSubmissions: 0,
                pendingReviews: 0
            })
            setIsCreateOpen(false)
            setFormData({ title: '', course: '', batch: '', dueDate: '', description: '' })
            setAvailableBatches([])
            await refreshAssignments()
            toast({
                title: "Success",
                description: "New assignment has been created and saved successfully.",
            })
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
            toast({
                title: "Updated",
                description: "Assignment details have been updated successfully.",
            })
        } catch (error) {
            toast({ title: "Error", description: "Failed to update assignment.", variant: "destructive" })
        }
    }

    const handleArchive = async () => {
        if (selectedAsg) {
            try {
                // Soft delete: move to Archived status
                await updateAssignment(selectedAsg.id, {
                    ...selectedAsg,
                    status: 'Archived'
                })
                setIsArchiveOpen(false)
                await refreshAssignments()
                toast({
                    title: "Action Approved",
                    description: "Assignment has been moved to Archives registry.",
                })
            } catch (error) {
                toast({ title: "Error", description: "Failed to process request.", variant: "destructive" })
            }
        }
    }

    const handleViewSubmissions = (title: string) => {
        setSearchTerm(title)
        setActiveTab('submissions')
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

    const getTutorName = (id: any) => {
        const tutor = tutors.find(t => String(t.id) === String(id));
        return tutor ? `${tutor.firstName} ${tutor.lastName}` : (id || 'Admin');
    };

    const handleDelegate = async () => {
        if (!selectedAsg || !selectedTutorId) return
        try {
            await updateAssignment(selectedAsg.id, {
                ...selectedAsg,
                creatorId: selectedTutorId
            })
            setIsDelegateOpen(false)
            await refreshAssignments()
            toast({ title: "Delegated", description: "Assignment has been delegated to the selected tutor." })
        } catch (error) {
            toast({ title: "Error", description: "Failed to delegate assignment.", variant: "destructive" })
        }
    }

    const handleRejectDeletion = async (asg: any) => {
        try {
            await updateAssignment(asg.id, {
                ...asg,
                status: 'Active'
            })
            await refreshAssignments()
            toast({ title: "Request Rejected", description: "Deletion request has been rejected. Assignment is now active." })
        } catch (error) {
            toast({ title: "Error", description: "Failed to reject deletion request.", variant: "destructive" })
        }
    }

    const handleExport = () => {
        toast({
            title: "Exporting...",
            description: "Generating your report. Please wait.",
        })
    }

    const handleRemind = () => {
        toast({
            title: "Reminders Sent",
            description: "Notifications sent to all pending students.",
        })
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
                    <h1 className="text-4xl font-bold font-headline tracking-tighter">Assignments</h1>
                    <p className="text-lg text-muted-foreground mt-2">Create and manage student assignments and track submissions.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
                        <Download className="h-4 w-4 pointer-events-none" /> Export Report
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4 pointer-events-none" /> Create Assignment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Create New Assignment</DialogTitle>
                                <DialogDescription>
                                    Fill in the details to create a new assignment for your students.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Assignment Title"
                                        className="col-span-3"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="course" className="text-right">Course</Label>
                                    <Select onValueChange={(val) => {
                                        const selectedCourse = courses.find(c => c.title === val)
                                        setFormData({ ...formData, course: val, batch: '' })
                                        setAvailableBatches(selectedCourse?.batches || [])
                                    }}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select Course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map(course => (
                                                <SelectItem key={course.id} value={course.title}>
                                                    {course.title}
                                                </SelectItem>
                                            ))}
                                            {courses.length === 0 && (
                                                <SelectItem value="none" disabled>No courses available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="batch" className="text-right">Batch</Label>
                                    <Select
                                        disabled={!formData.course}
                                        onValueChange={(val) => setFormData({ ...formData, batch: val })}
                                        value={formData.batch}
                                    >
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder={formData.course ? "Select Batch" : "Select a course first"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableBatches.map(batch => (
                                                <SelectItem key={batch.id} value={batch.name}>
                                                    {batch.name}
                                                </SelectItem>
                                            ))}
                                            {availableBatches.length === 0 && formData.course && (
                                                <SelectItem value="none" disabled>No batches available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        className="col-span-3"
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Assignment instructions..."
                                        className="col-span-3 min-h-[100px]"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="file" className="text-right">Attachments</Label>
                                    <Input id="file" type="file" className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateAssignment}>Publish Assignment</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground pointer-events-none" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignments.length}</div>
                        <p className="text-xs text-muted-foreground">+2 from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500 pointer-events-none" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingReviewsCount}</div>
                        <p className="text-xs text-muted-foreground">Needs grading</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500 pointer-events-none" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCount}</div>
                        <p className="text-xs text-muted-foreground">Submissions graded</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary pointer-events-none" />
                            Grade Distribution
                        </CardTitle>
                        <CardDescription>Visualizing performance based on {completedCount} graded items.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-4 h-48 pt-4">
                            {gradeDist.map((item) => (
                                <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className={`${item.color} w-full rounded-t-sm transition-all hover:opacity-80 cursor-help`}
                                        style={{ height: `${item.value}%` }}
                                        title={`${item.value}% students received ${item.label}`}
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
                            <Users className="h-5 w-5 text-primary pointer-events-none" />
                            Pending Submissions
                        </CardTitle>
                        <CardDescription>Students who haven't turned in their work yet.</CardDescription>
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
                                <p className="text-sm text-center text-muted-foreground py-4">All students caught up! 🎉</p>
                            )}
                            {pendingList.length > 0 && (
                                <Button variant="link" className="w-full text-xs" size="sm" onClick={handleRemind}>
                                    Send reminders to all
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="all">Active Assignments</TabsTrigger>
                        <TabsTrigger value="submissions">Submissions</TabsTrigger>
                        <TabsTrigger value="requests">Deletion Requests</TabsTrigger>
                        <TabsTrigger value="archived">Archived</TabsTrigger>
                    </TabsList>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="all" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Assignments</CardTitle>
                            <CardDescription>Overview of currently active tasks for students.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Assignment Title</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Batch</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead>Submissions</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAssignments.map((asg) => (
                                        <TableRow key={asg.id}>
                                            <TableCell className="font-medium">{asg.title}</TableCell>
                                            <TableCell>{asg.course}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal">
                                                    {asg.batch || 'All Batches'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{asg.dueDate}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-muted-foreground pointer-events-none" />
                                                    {asg.totalSubmissions} ({asg.pendingReviews} pending)
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={asg.status === 'Active' ? 'default' : 'secondary'}>
                                                    {asg.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4 pointer-events-none" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleViewSubmissions(asg.title)}>View Submissions</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedAsg(asg);
                                                            const course = courses.find(c => c.title === asg.course);
                                                            setAvailableBatches(course?.batches || []);
                                                            setIsEditOpen(true);
                                                        }}>Edit Assignment</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                            setSelectedAsg(asg);
                                                            setIsDelegateOpen(true);
                                                        }}>Delegate Assignment</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedAsg(asg); setIsArchiveOpen(true); }}>Archive</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredAssignments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                                No assignments found matching your search.
                                            </TableCell>
                                        </TableRow>
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
                            <CardDescription>Track and grade student work.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Assignment</TableHead>
                                        <TableHead>Submitted At</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredSubmissions.map((sub) => (
                                        <TableRow key={sub.id}>
                                            <TableCell className="font-medium">{sub.studentName}</TableCell>
                                            <TableCell>{sub.itemTitle}</TableCell>
                                            <TableCell>{sub.submittedAt}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={sub.status === 'Pending Review' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-green-100 text-green-700 border-green-200'}>
                                                    {sub.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold">{sub.grade || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleGrade(sub)}>
                                                    {sub.status === 'Graded' ? 'Edit Grade' : 'Review & Grade'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredSubmissions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                No submissions found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requests" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tutor Deletion Requests</CardTitle>
                            <CardDescription>Assignments that tutors have requested to delete.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Assignment</TableHead>
                                        <TableHead>Requested By</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments.filter(a => a.status === 'Deletion Requested').map(asg => (
                                        <TableRow key={asg.id}>
                                            <TableCell className="font-medium">{asg.title}</TableCell>
                                            <TableCell>{getTutorName(asg.creatorId)}</TableCell>
                                            <TableCell>Tutor requested deletion</TableCell>
                                            <TableCell className="text-right flex justify-end gap-2">
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleRejectDeletion(asg)}>Reject</Button>
                                                <Button size="sm" variant="destructive" onClick={() => { setSelectedAsg(asg); setIsArchiveOpen(true); }}>Approve Delete</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {assignments.filter(a => a.status === 'Deletion Requested').length === 0 && (
                                        <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No pending deletion requests.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="archived" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Archived Registry</CardTitle>
                            <CardDescription>Historical record of assignments that have been retired or deleted.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Was Under</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead>Archived Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments.filter(a => a.status === 'Archived').map(asg => (
                                        <TableRow key={asg.id}>
                                            <TableCell className="font-semibold">{asg.title}</TableCell>
                                            <TableCell>{asg.course}</TableCell>
                                            <TableCell>{getTutorName(asg.creatorId)}</TableCell>
                                            <TableCell>{asg.dueDate || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {assignments.filter(a => a.status === 'Archived').length === 0 && (
                                        <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground">
                                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                            No assignments in the archives yet.
                                        </TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Assignment Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Assignment</DialogTitle>
                        <DialogDescription>
                            Modify the details of the assignment.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAsg && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-title" className="text-right">Title</Label>
                                <Input
                                    id="edit-title"
                                    value={selectedAsg.title}
                                    onChange={(e) => setSelectedAsg({ ...selectedAsg, title: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-course" className="text-right">Course</Label>
                                <Select
                                    value={selectedAsg.course}
                                    onValueChange={(val) => {
                                        const selectedCourse = courses.find(c => c.title === val)
                                        setSelectedAsg({ ...selectedAsg, course: val, batch: '' })
                                        setAvailableBatches(selectedCourse?.batches || [])
                                    }}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(course => (
                                            <SelectItem key={course.id} value={course.title}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-batch" className="text-right">Batch</Label>
                                <Select
                                    onValueChange={(val) => setSelectedAsg({ ...selectedAsg, batch: val })}
                                    value={selectedAsg.batch}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select Batch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableBatches.map(batch => (
                                            <SelectItem key={batch.id} value={batch.name}>
                                                {batch.name}
                                            </SelectItem>
                                        ))}
                                        {availableBatches.length === 0 && (
                                            <SelectItem value="none" disabled>No batches available</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-dueDate" className="text-right">Due Date</Label>
                                <Input
                                    id="edit-dueDate"
                                    type="date"
                                    value={selectedAsg.dueDate}
                                    onChange={(e) => setSelectedAsg({ ...selectedAsg, dueDate: e.target.value })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-description" className="text-right">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    placeholder="Assignment instructions..."
                                    className="col-span-3 min-h-[100px]"
                                    value={selectedAsg.description}
                                    onChange={(e) => setSelectedAsg({ ...selectedAsg, description: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditAssignment}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                                <Label htmlFor="grade" className="text-right">Grade (0-100)</Label>
                                <Input
                                    id="grade"
                                    type="number"
                                    value={selectedSub.grade || ''}
                                    onChange={(e) => setSelectedSub({ ...selectedSub, grade: parseInt(e.target.value) })}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="feedback" className="text-right">Feedback</Label>
                                <Textarea
                                    id="feedback"
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

            {/* Archive Confirmation */}
            <AlertDialog open={isArchiveOpen} onOpenChange={setIsArchiveOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will move the assignment "{selectedAsg?.title}" to the archived list. It will no longer be visible to students.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleArchive} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Archive Assignment
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delegate Assignment Dialog */}
            <Dialog open={isDelegateOpen} onOpenChange={setIsDelegateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delegate Assignment</DialogTitle>
                        <DialogDescription>Assign this task to a different tutor.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Tutor</Label>
                            <Select onValueChange={setSelectedTutorId}>
                                <SelectTrigger><SelectValue placeholder="Choose a tutor..." /></SelectTrigger>
                                <SelectContent>
                                    {tutors.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.firstName} {t.lastName} ({t.expertise})
                                        </SelectItem>
                                    ))}
                                    {tutors.length === 0 && <SelectItem value="none" disabled>No tutors found</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDelegateOpen(false)}>Cancel</Button>
                        <Button onClick={handleDelegate}>Confirm Delegation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

    )
}
