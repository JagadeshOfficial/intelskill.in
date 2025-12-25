"use client";

import { useState, useEffect } from "react";
import { getCourses, deleteCourse, updateCourse, createCourse } from "@/lib/api-courses";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  Plus,
  MoreVertical,
  Trash2,
  Edit,
  Search,
  Calendar,
  Users,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
  BookOpen
} from "lucide-react";
import { StudentOption } from "@/components/ui/StudentMultiSelect";

type Batch = {
  id: string | number;
  name: string;
  students?: any[];
};

type Course = {
  id: string | number;
  title: string;
  description: string;
  batches: Batch[];
};

export default function AdminCoursesPage() {
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [showManageBatches, setShowManageBatches] = useState(false);
  const [showManageTutors, setShowManageTutors] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError("");
      try {
        const data = await getCourses();
        const courseList = Array.isArray(data) ? data : [];
        setCourses(courseList);
        setFilteredCourses(courseList);
      } catch (err) {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
    } else {
      const lower = searchQuery.toLowerCase();
      setFilteredCourses(
        courses.filter(
          (c) =>
            (c.title?.toLowerCase() || "").includes(lower) ||
            (c.description?.toLowerCase() || "").includes(lower)
        )
      );
    }
  }, [searchQuery, courses]);

  // --- Sub-Components (Forms) ---

  function CreateCourseForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async () => {
      if (!title.trim()) return;
      setIsSubmitting(true);
      try {
        const newCourse = await createCourse({ title, description });
        if (!newCourse || !newCourse.id) {
          throw new Error("Invalid response from server");
        }
        const updated = [...courses, newCourse];
        setCourses(updated);
        setFilteredCourses(updated); // Update filtered list too
        setShowCreateCourse(false);
        toast({ title: "Success", description: "Course created successfully!" });
      } catch (err) {
        toast({ title: "Error", description: "Failed to create course.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>Add a new course to your curriculum.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              placeholder="e.g. Full Stack Development"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Brief summary of the course content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateCourse(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? "Creating..." : "Create Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  function CreateBatchForm() {
    const [batchName, setBatchName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateBatch = async () => {
      if (!selectedCourse || !batchName.trim()) return;
      setIsSubmitting(true);
      try {
        const { createBatch, getCourses } = await import("@/lib/api-courses");
        await createBatch(selectedCourse.id, { name: batchName });

        toast({ title: "Success", description: `Batch "${batchName}" created!` });

        // Refresh
        const data = await getCourses();
        const updatedList = Array.isArray(data) ? data : [];
        setCourses(updatedList);
        setFilteredCourses(updatedList);

        setShowCreateBatch(false);
        setBatchName("");
      } catch (err: any) {
        console.error(err);
        toast({ title: "Error", description: "Failed to create batch.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Batch</DialogTitle>
          <DialogDescription>Create a new batch for <strong>{selectedCourse?.title}</strong></DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="batchName">Batch Name</Label>
            <Input
              id="batchName"
              placeholder="e.g. Winter 2025"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateBatch(false)}>Cancel</Button>
          <Button onClick={handleCreateBatch} disabled={isSubmitting || !batchName.trim()}>
            {isSubmitting ? "Creating..." : "Create Batch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  function RenameCourseForm({ course }: { course: Course }) {
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
      setIsSubmitting(true);
      try {
        await updateCourse(course.id, { title, description });
        const updatedList = courses.map((c) => (c.id === course.id ? { ...c, title, description } : c));
        setCourses(updatedList);
        setFilteredCourses(updatedList);
        toast({ title: "Success", description: "Course updated." });
      } catch (err) {
        toast({ title: "Error", description: "Failed to update course.", variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Description</Label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    );
  }

  function ManageBatchesPopup({ onClose }: { onClose: () => void }) {
    const [selectedBatchId, setSelectedBatchId] = useState<string | number>(
      selectedCourse?.batches?.[0]?.id || ""
    );
    const [currentSearch, setCurrentSearch] = useState("");
    const [addSearch, setAddSearch] = useState("");
    const [addStudentIds, setAddStudentIds] = useState<string[]>([]);
    const [allStudents, setAllStudents] = useState<StudentOption[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
      async function fetchStudents() {
        setLoadingStudents(true);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/v1/auth/admin/students`);
          if (!res.ok) throw new Error("Failed to fetch students");
          const data = await res.json();
          const arr = Array.isArray(data) ? data : data.students || [];
          const students: StudentOption[] = arr.map((s: any) => ({
            id: String(s.id),
            name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email,
            email: s.email,
          }));
          setAllStudents(students);
        } catch (err) {
          // silent fail
        } finally {
          setLoadingStudents(false);
        }
      }
      fetchStudents();
    }, []);

    const selectedBatch = selectedCourse?.batches?.find((batch) => batch.id == selectedBatchId);
    const currentStudents = selectedBatch?.students || [];

    const refreshData = async () => {
      const { getCourses } = await import("@/lib/api-courses");
      const data = await getCourses();
      const list = Array.isArray(data) ? data : [];
      setCourses(list);
      // update local selected course ref
      const updated = list.find((c: Course) => c.id === selectedCourse?.id);
      if (updated) setSelectedCourse(updated);
    }

    async function handleDeleteStudent(studentId: string) {
      if (!selectedBatchId || !selectedCourse) return;
      try {
        const { removeStudentFromBatch } = await import("@/lib/api-courses");
        await removeStudentFromBatch(selectedCourse.id, selectedBatchId, studentId);
        toast({ title: "Removed", description: "Student removed from batch." });
        await refreshData();
      } catch (err) {
        toast({ title: "Error", description: "Failed to remove student.", variant: "destructive" });
      }
    }

    async function handleAddStudents() {
      if (!selectedBatchId || !selectedCourse || addStudentIds.length === 0) return;
      const selectedEmails = allStudents
        .filter((s) => addStudentIds.includes(s.id))
        .map((s) => s.email)
        .filter((email) => !currentStudents.some((stu: any) => stu.email === email));

      if (selectedEmails.length === 0) {
        toast({ title: "Info", description: "Selected students are already in this batch." });
        return;
      }

      await Promise.all(
        selectedEmails.map(email =>
          import("@/lib/api-courses").then(({ addStudentToBatch }) =>
            addStudentToBatch(selectedCourse.id, Number(selectedBatchId), email)
          ).catch(console.error)
        )
      );

      setAddStudentIds([]);
      setAddSearch("");
      toast({ title: "Success", description: "Students added to batch." });
      await refreshData();
    }

    return (
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden h-[80vh] flex flex-col">
        <div className="p-6 border-b bg-muted/10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Manage Batches</DialogTitle>
              <DialogDescription>Course: <span className="font-semibold text-foreground">{selectedCourse?.title}</span></DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <span className="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-[250px_1fr]">
          {/* Sidebar / Batch List */}
          <div className="border-r bg-muted/5 p-4 flex flex-col gap-4">
            <div className="font-medium text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Batches
            </div>
            {!selectedCourse?.batches?.length ? (
              <div className="text-sm text-muted-foreground italic">No batches yet.</div>
            ) : (
              <div className="flex flex-col gap-1">
                {selectedCourse.batches.map(batch => (
                  <button
                    key={batch.id}
                    onClick={() => setSelectedBatchId(batch.id)}
                    className={`text-left px-3 py-2 rounded-md text-sm transition-all ${selectedBatchId == batch.id ? 'bg-primary text-primary-foreground shadow-sm font-medium' : 'hover:bg-accent text-foreground'}`}
                  >
                    {batch.name}
                  </button>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              className="w-full mt-auto gap-2"
              onClick={() => {
                onClose();
                setShowCreateBatch(true); // Switch to create batch dialog
              }}
            >
              <Plus className="w-4 h-4" /> New Batch
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col h-full overflow-hidden">
            {!selectedBatchId ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a batch to view details
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Top Stats */}
                <div className="p-6 border-b flex justify-between items-center bg-card">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {selectedBatch?.name}
                    <Badge variant="secondary" className="ml-2">{currentStudents.length} Students</Badge>
                  </h3>
                </div>

                <div className="flex-1 overflow-hidden grid grid-rows-[1fr_auto]">
                  {/* Student List */}
                  <div className="overflow-y-auto p-6">
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">Enrolled Students</h4>
                    <div className="space-y-3">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search enrolled students..."
                          className="pl-9"
                          value={currentSearch}
                          onChange={e => setCurrentSearch(e.target.value)}
                        />
                      </div>

                      {currentStudents.length === 0 ? (
                        <div className="py-8 text-center border rounded-lg border-dashed text-muted-foreground bg-muted/10">
                          No students enrolled in this batch.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentStudents
                            .filter((s: any) => !currentSearch || s.email.toLowerCase().includes(currentSearch.toLowerCase()) || s.firstName?.toLowerCase().includes(currentSearch.toLowerCase()))
                            .map((student: any) => (
                              <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                                    {(student.firstName?.[0] || student.email?.[0] || "?").toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium truncate">{student.firstName} {student.lastName}</div>
                                    <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => handleDeleteStudent(String(student.id))}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Students Footer */}
                  <div className="border-t bg-muted/5 p-6">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" /> Add Students
                    </h4>
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        {/* Simple dropdown simulation for adding students */}
                        <div className="border rounded-md bg-background shadow-sm max-h-[150px] overflow-hidden flex flex-col">
                          <Input
                            className="border-0 focus-visible:ring-0 rounded-b-none border-b"
                            placeholder="Search student to add..."
                            value={addSearch}
                            onChange={e => setAddSearch(e.target.value)}
                          />
                          <div className="overflow-y-auto p-1 flex-1">
                            {allStudents.filter(s => !addSearch || s.name.toLowerCase().includes(addSearch.toLowerCase())).slice(0, 50).map(student => (
                              <div
                                key={student.id}
                                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-accent ${addStudentIds.includes(student.id) ? 'bg-accent/80' : ''}`}
                                onClick={() => {
                                  setAddStudentIds(prev => prev.includes(student.id) ? prev.filter(id => id !== student.id) : [...prev, student.id]);
                                }}
                              >
                                <input type="checkbox" checked={addStudentIds.includes(student.id)} readOnly className="pointer-events-none accent-primary" />
                                <span className="truncate">{student.name}</span>
                              </div>
                            ))}
                            {allStudents.length === 0 && <div className="p-2 text-xs text-center text-muted-foreground">Loading students...</div>}
                          </div>
                        </div>
                      </div>
                      <div className="w-[150px] flex flex-col justify-end">
                        <Button onClick={handleAddStudents} disabled={addStudentIds.length === 0} className="w-full">
                          Confirm Add ({addStudentIds.length})
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    );
  }

  function ManageTutorsPopup({ onClose }: { onClose: () => void }) {
    const [allTutors, setAllTutors] = useState<any[]>([]);
    const [assignedTutors, setAssignedTutors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
      async function fetchData() {
        if (!selectedCourse) return;
        setLoading(true);
        try {
          // 1. Fetch all tutors
          const resAll = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/v1/auth/admin/tutors`);
          const dataAll = await resAll.json();
          const tutorsList = dataAll.tutors || [];
          setAllTutors(tutorsList);

          // 2. Fetch assigned tutors (We don't have a direct endpoint yet, so we filter locally or rely on a new endpoint. 
          // For now, let's assume we can fetch them via the new endpoint I added to backend: /api/courses/{id}/tutors)
          const resAssigned = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/courses/${selectedCourse.id}/tutors`);
          if (resAssigned.ok) {
            const dataAssigned = await resAssigned.json();
            setAssignedTutors(Array.isArray(dataAssigned) ? dataAssigned : []);
          }
        } catch (e) {
          console.error(e);
          toast({ title: "Error", description: "Failed to load tutors", variant: "destructive" });
        } finally {
          setLoading(false);
        }
      }
      fetchData();
    }, [selectedCourse]);

    const handleToggleTutor = async (tutorId: any, isAssigned: boolean) => {
      if (!selectedCourse) return;
      try {
        if (isAssigned) {
          // Remove
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/courses/${selectedCourse.id}/tutors/${tutorId}`, { method: 'DELETE' });
          setAssignedTutors(prev => prev.filter(t => t.id !== tutorId));
          toast({ title: "Removed", description: "Tutor removed from course." });
        } else {
          // Assign
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/courses/${selectedCourse.id}/tutors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tutorId })
          });
          const tutor = allTutors.find(t => t.id === tutorId);
          if (tutor) setAssignedTutors(prev => [...prev, tutor]);
          toast({ title: "Assigned", description: "Tutor assigned to course." });
        }
      } catch (e) {
        toast({ title: "Error", description: "Failed to update tutor assignment", variant: "destructive" });
      }
    };

    const isAssigned = (tutorId: any) => assignedTutors.some(t => t.id === tutorId);

    return (
      <DialogContent className="sm:max-w-[600px] h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Tutors</DialogTitle>
          <DialogDescription>Assign tutors to <strong>{selectedCourse?.title}</strong></DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tutors..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">Loading...</div>
            ) : allTutors.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No tutors found.</div>
            ) : (
              allTutors
                .filter(t => !search || t.firstName.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()))
                .map(tutor => {
                  const assigned = isAssigned(tutor.id);
                  return (
                    <div key={tutor.id} className={`flex items-center justify-between p-3 rounded-md border ${assigned ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                          {tutor.firstName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{tutor.firstName} {tutor.lastName}</div>
                          <div className="text-xs text-muted-foreground">{tutor.email}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={assigned ? "default" : "outline"}
                        onClick={() => handleToggleTutor(tutor.id, assigned)}
                      >
                        {assigned ? "Assigned" : "Assign"}
                      </Button>
                    </div>
                  );
                })
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    );
  }

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Courses
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your curriculum, batches, and student enrollments.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-9 h-11 bg-card shadow-sm border-muted/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-11 shadow-md transition-transform hover:scale-105 active:scale-95">
                <Plus className="mr-2 h-5 w-5" /> New Course
              </Button>
            </DialogTrigger>
            <CreateCourseForm />
          </Dialog>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[200px] rounded-xl bg-muted/20 border border-muted/30"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center border-2 border-dashed border-destructive/20 rounded-xl bg-destructive/5 text-destructive font-medium">
            {error}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-3xl bg-card/50">
            <GraduationCap className="h-16 w-16 text-muted-foreground/30 mb-6" />
            <h3 className="text-xl font-semibold">No courses found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              {searchQuery ? "Try adjusting your search terms." : "Get started by creating your first course."}
            </p>
            {!searchQuery && (
              <Button
                variant="link"
                className="mt-4 text-primary"
                onClick={() => setShowCreateCourse(true)}
              >
                Create a Course
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-muted/40 bg-gradient-to-b from-card to-card/50"
              >
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 to-blue-500/80 pointer-events-none" />

                <CardHeader className="pb-3 pt-6">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary mb-3 w-fit">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2 h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="w-4 h-4 mr-2" /> Edit Details
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Edit Course</DialogTitle></DialogHeader>
                            <RenameCourseForm course={course} />
                          </DialogContent>
                        </Dialog>
                        <DropdownMenuItem onSelect={() => {
                          setSelectedCourse(course);
                          setShowManageTutors(true);
                        }}>
                          <Users className="w-4 h-4 mr-2" /> Assign Tutors
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (confirm("Delete this course?")) {
                              deleteCourse(course.id).then(() => {
                                setCourses(prev => prev.filter(c => c.id !== course.id));
                                setFilteredCourses(prev => prev.filter(c => c.id !== course.id));
                                toast({ title: "Deleted", description: "Course removed." });
                              });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-xl font-bold leading-tight line-clamp-1" title={course.title}>
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 h-[40px] mb-6">
                    {course.description || "No description provided."}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      <span>Active Batches</span>
                      <Badge variant="secondary" className="transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        {course.batches?.length || 0}
                      </Badge>
                    </div>

                    {(!course.batches || course.batches.length === 0) ? (
                      <div className="h-[60px] flex items-center justify-center rounded-md border border-dashed bg-muted/20 text-xs text-muted-foreground">
                        No batches active
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-[80px] overflow-hidden">
                        {course.batches.slice(0, 3).map((batch) => (
                          <div key={batch.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/50 border text-xs font-medium">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {batch.name}
                          </div>
                        ))}
                        {course.batches.length > 3 && (
                          <div className="px-2 py-1 text-xs text-muted-foreground font-medium flex items-center">
                            +{course.batches.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6 flex gap-3">
                  <Dialog
                    open={showManageBatches && selectedCourse?.id === course.id}
                    onOpenChange={(open) => {
                      setShowManageBatches(open);
                      if (open) setSelectedCourse(course);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors">
                        <ListIcon className="w-4 h-4 mr-2" /> Batches
                      </Button>
                    </DialogTrigger>
                    <ManageBatchesPopup onClose={() => setShowManageBatches(false)} />
                  </Dialog>

                  <Button
                    className="flex-1 shadow-sm"
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowCreateBatch(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Batch
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Global Dialogs */}
      <Dialog open={showCreateBatch} onOpenChange={setShowCreateBatch}>
        <CreateBatchForm />
      </Dialog>

      <Dialog open={showManageTutors} onOpenChange={setShowManageTutors}>
        <ManageTutorsPopup onClose={() => setShowManageTutors(false)} />
      </Dialog>
    </div>
  );
}