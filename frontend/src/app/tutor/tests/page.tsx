'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Trophy, Users, Timer, MoreVertical, BarChart3, Loader2, FileText, Clock, AlertCircle } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

import { useToast } from '@/hooks/use-toast'
import { getCoursesForTutor } from '@/lib/api-courses'
import { getTests, deleteTest } from '@/lib/api-tests'

export default function TutorTestsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tests, setTests] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const tutorId = localStorage.getItem('tutorId')
      const courseData = tutorId ? await getCoursesForTutor(tutorId) : []
      setCourses(Array.isArray(courseData) ? courseData : [])

      const courseTitles = Array.isArray(courseData) ? courseData.map((c: any) => c.title) : []

      const testData = await getTests(undefined, courseTitles)
      setTests(Array.isArray(testData) ? testData : [])
    } catch (error) {
      console.error("Failed to load tests", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTests = tests.filter(test =>
    (test.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (test.course?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (test.courseId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (testId: string) => {
    if (!confirm("Are you sure you want to delete this test? This action cannot be undone.")) return;

    try {
      await deleteTest(testId);
      setTests(tests.filter(t => t.id !== testId));
      toast({ title: "Test Deleted", description: "The test has been successfully removed." });
    } catch (error) {
      console.error("Delete failed", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to delete test." });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tighter text-primary">Test & Quiz Manager</h1>
          <p className="text-lg text-muted-foreground mt-2 text-primary/80">Configure assessments and track student performance.</p>
        </div>
        <Button asChild className="gap-2 shadow-lg hover:shadow-xl transition-all">
          <Link href="/tutor/tests/create">
            <Plus className="h-5 w-5" /> Create New Test
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative w-64 ml-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search tests..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Test Details</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Configuration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.map((test) => (
                <TableRow key={test.id} className="group hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">{test.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] font-normal">{test.type || 'Assessment'}</Badge>
                          <span className="text-xs text-slate-400">• Created {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'Recently'}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-700">{test.course || test.courseId || 'General'}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Users className="h-3 w-3" /> Batch: {test.batch || test.batchId || 'All'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> {test.duration} mins
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-slate-400" /> {test.questions?.length || test.questionsCount || 0} Questions
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={test.status === 'Published' || test.status === 'Active' ? 'default' : 'secondary'}>
                      {test.status || 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                          <MoreVertical className="h-4 w-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/tutor/tests/${test.id}/results`} className="cursor-pointer flex items-center">
                            <BarChart3 className="mr-2 h-4 w-4" /> View Results
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/tutor/tests/${test.id}/edit`} className="cursor-pointer">
                            Edit Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/tutor/tests/${test.id}/edit`} className="cursor-pointer">
                            Manage Questions
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(test.id)} className="text-red-600 focus:text-red-600">
                          Delete Test
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
