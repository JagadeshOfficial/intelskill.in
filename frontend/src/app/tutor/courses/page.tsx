'use client'

import { useState, useEffect } from 'react'
import { getBatches } from '@/lib/api-courses'
import { getFolders, createFolder, deleteFolder, updateFolder } from '@/lib/api-folders'
import { getFiles } from '@/lib/api-files'
import { tutorStudents } from '../content/data'
import CourseList from '../content/components/course-list'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { coursesData } from '@/lib/placeholder-data'

export default function TutorCoursesPage() {
  // Modal and form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseTutor, setNewCourseTutor] = useState('');
  const [newCourseImage, setNewCourseImage] = useState<string | null>(null);
  const [newCourseImageName, setNewCourseImageName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [manageBatchesCourse, setManageBatchesCourse] = useState<any>(null)
  const [batches, setBatches] = useState<any[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)
  const [batchStudents, setBatchStudents] = useState<any[]>([])
  const [studentSearch, setStudentSearch] = useState("")
  const [showManageBatches, setShowManageBatches] = useState(false)
  const router = useRouter()

  // Backend tutor courses state
  const [tutorCourses, setTutorCourses] = useState<any[]>([])
  const [tutorId, setTutorId] = useState<string | null>(null);

  // Get tutorId from localStorage on mount
  useEffect(() => {
    const storedTutorId = localStorage.getItem('tutorId');
    if (storedTutorId) {
      setTutorId(storedTutorId);
    }
  }, []);

  // Fetch courses from backend when tutorId is available
  useEffect(() => {
    fetch('http://localhost:8081/api/courses')
      .then(res => res.json())
      .then(data => setTutorCourses(Array.isArray(data) ? data : []));
  }, []);


  // Fetch batches for manage batches modal
  useEffect(() => {
    if (manageBatchesCourse) {
      getBatches(manageBatchesCourse.id).then((data) => {
        setBatches(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedBatchId(data[0].id);
        }
      });
    }
  }, [manageBatchesCourse]);

  // Fetch students for selected batch with error handling (SQL-based endpoint)
  useEffect(() => {
    if (manageBatchesCourse && selectedBatchId) {
      fetch(`http://localhost:8081/api/tutor/courses/${manageBatchesCourse.id}/batches/${selectedBatchId}/students`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch students');
          return res.json();
        })
        .then(students => setBatchStudents(Array.isArray(students) ? students : []))
        .catch(() => setBatchStudents([]));
    }
  }, [manageBatchesCourse, selectedBatchId]);

  // Main content rendering
  return (
    <div className="max-w-7xl mx-auto py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">View your assigned courses and batches.</p>
        </div>
      </header>

      {/* Courses as cards with batch list and actions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorCourses.map((course: any) => (
            <div key={course.id} className="bg-card border rounded p-6 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold mb-1">{course.title}</h3>
                  <div className="text-muted-foreground text-sm mb-2">{course.description || 'No description'}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold mb-1">Batches:</div>
                <ul className="list-disc ml-5 mb-2">
                  {(course.batches || []).map((batch: any) => (
                    <li key={batch.id}>{batch.name}</li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setManageBatchesCourse(course);
                    setShowManageBatches(true);
                  }}>
                    Manage Batches ({course.batches ? course.batches.length : 0})
                  </Button>
                  {/* Manage Batches Modal */}
                  {showManageBatches && manageBatchesCourse && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 animate-in fade-in duration-200">
                      <div className="absolute inset-0" onClick={() => {
                        setShowManageBatches(false);
                        setManageBatchesCourse(null);
                        setBatches([]);
                        setBatchStudents([]);
                        setSelectedBatchId(null);
                        setStudentSearch("");
                        setStudentSearch("");
                      }} />
                      <div className="relative bg-card text-card-foreground rounded-xl shadow-2xl p-0 w-full max-w-2xl z-10 border overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b">
                          <h3 className="text-xl font-bold tracking-tight">Manage Batches - {manageBatchesCourse.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Add or remove students from your course batches.</p>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                          {batches.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                              <div className="bg-muted rounded-full p-4 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>
                              </div>
                              <p>No batches found for this course.</p>
                              <Button size="sm" variant="outline" className="mt-4" onClick={() => {/* TODO: Call Create Batch logic */ }}>Create First Batch</Button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="grid gap-2">
                                <Label className="text-sm font-medium">Select Batch</Label>
                                <select
                                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  value={selectedBatchId || ""}
                                  onChange={e => setSelectedBatchId(e.target.value)}
                                >
                                  {batches.map((batch: any) => (
                                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium">Current Students</Label>
                                  <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold">{batchStudents.length} enrolled</Badge>
                                </div>

                                <div className="relative">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                                  <Input
                                    type="text"
                                    className="pl-9 bg-accent/20"
                                    placeholder="Filter current students..."
                                    value={studentSearch}
                                    onChange={e => setStudentSearch(e.target.value)}
                                  />
                                </div>

                                <div className="border rounded-md overflow-hidden max-h-[200px] overflow-y-auto">
                                  {batchStudents.length === 0 ? (
                                    <div className="text-muted-foreground text-sm p-4 text-center bg-muted/30">No students in this batch yet.</div>
                                  ) : (
                                    <div className="divide-y">
                                      {batchStudents
                                        .filter((student: any) =>
                                          !studentSearch || (student.email && student.email.toLowerCase().includes(studentSearch.toLowerCase()))
                                        )
                                        .map((student: any) => (
                                          <div key={student.id} className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase shrink-0">
                                                {(student.email || "?").substring(0, 2)}
                                              </div>
                                              <div className="flex flex-col overflow-hidden text-left">
                                                <span className="text-sm truncate font-medium">
                                                  {(student.firstName || student.lastName) ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : student.email}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate">{student.email}</span>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              </div>


                            </div>
                          )}
                        </div>

                        <div className="p-4 border-t bg-muted/10 flex justify-end">
                          <Button variant="outline" onClick={() => {
                            setShowManageBatches(false);
                            setManageBatchesCourse(null);
                            setBatches([]);
                            setBatchStudents([]);
                            setSelectedBatchId(null);
                            setStudentSearch("");
                            setStudentSearch("");
                          }}>Close</Button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ))}
        </div>
      </div >

      {/* ...existing code for Add Course Modal... */}
      {
        showAddModal && (
          // ...existing code for Add Course Modal...
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddModal(false)} />
            <div className="relative bg-card rounded p-6 w-full max-w-md z-10">
              <h3 className="text-lg font-semibold mb-4">Add New Course</h3>
              <div className="grid gap-3">
                <div>
                  <Label htmlFor="new-course-title">Course Title</Label>
                  <Input id="new-course-title" value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="new-course-tutor">Tutor Name</Label>
                  <Input id="new-course-tutor" value={newCourseTutor} onChange={e => setNewCourseTutor(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="new-course-image">Course Image (optional)</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragActive ? 'border-primary bg-primary/10' : 'border-muted'}`}
                    onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                    onDrop={e => {
                      e.preventDefault();
                      setDragActive(false);
                      const file = e.dataTransfer.files?.[0]
                      if (file && file.type.startsWith('image/')) {
                        setNewCourseImageName(file.name)
                        const reader = new FileReader()
                        reader.onload = () => {
                          const result = reader.result as string | null
                          if (result) setNewCourseImage(result)
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    onClick={() => document.getElementById('new-course-image-input')?.click()}
                  >
                    {newCourseImage ? (
                      <img src={newCourseImage} alt="Preview" className="mx-auto h-32 object-contain rounded" />
                    ) : (
                      <span className="text-muted-foreground">Drag & drop or click to upload</span>
                    )}
                    <input
                      id="new-course-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (!file) return
                        setNewCourseImageName(file.name)
                        const reader = new FileReader()
                        reader.onload = () => {
                          const result = reader.result as string | null
                          if (result) setNewCourseImage(result)
                        }
                        reader.readAsDataURL(file)
                      }}
                    />
                  </div>
                  {newCourseImageName && <div className="text-xs text-muted-foreground mt-1">{newCourseImageName}</div>}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button onClick={async () => {
                  const title = newCourseTitle.trim();
                  if (!title) return;
                  // Get tutorId from localStorage
                  const tutorId = localStorage.getItem('tutorId');
                  if (!tutorId) {
                    alert('Tutor ID not found. Please log in again.');
                    return;
                  }
                  // Prepare course data for backend
                  const courseData = {
                    title,
                    tutorName: newCourseTutor,
                    tutorId,
                    image: newCourseImage || undefined
                  };
                  try {
                    const res = await fetch('http://localhost:8081/courses', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(courseData)
                    });
                    if (!res.ok) {
                      throw new Error('Failed to add course');
                    }
                    // Refresh courses (fetch by tutorId)
                    setNewCourseTitle('');
                    setNewCourseTutor('');
                    setNewCourseImage('');
                    setNewCourseImageName(null);
                    setShowAddModal(false);
                    // Optionally, reload the page or refetch courses here
                  } catch (err) {
                    alert('Error adding course. Please check your backend and network.');
                  }
                }}>Create</Button>
              </div>
            </div>
          </div>
        )
      }

      {/* ...existing code for course cards and list... */}
    </div >
  );
}
