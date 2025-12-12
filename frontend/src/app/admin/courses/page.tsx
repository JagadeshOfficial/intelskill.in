"use client";

import { useState, useEffect } from "react";
import { getCourses, deleteCourse, updateCourse, createCourse } from "@/lib/api-courses";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentMultiSelect, StudentOption } from "@/components/ui/StudentMultiSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Batch = {
  id: string | number;
  name: string;
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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError("");
      try {
        const data = await getCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Create Course Form
  function CreateCourseForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
      setLoading(true);
      try {
        const newCourse = await createCourse({ title, description });
        setCourses((prev) => [...prev, newCourse]);
        setShowCreateCourse(false);
        toast({ title: "Course created successfully!" });
      } catch (err) {
        toast({ title: "Failed to create course", description: String(err), });
      } finally {
        setLoading(false);
      }
    };

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="border rounded px-3 py-2 w-full"
            placeholder="Course Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            type="button"
            onClick={handleCreate}
            disabled={loading || !title.trim()}
          >
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </DialogContent>
    );
  }

  // Create Batch Form
  function CreateBatchForm() {
    const [batchName, setBatchName] = useState("");

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Batch</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Batch Name (e.g. 2025 Jan)"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
          <Button
            onClick={() => {
              // TODO: Implement actual create batch
              setShowCreateBatch(false);
            }}
          >
            Create Batch
          </Button>
        </div>
      </DialogContent>
    );
  }

  // Manage Batches Popup
  function ManageBatchesPopup({ onClose }: { onClose: () => void }) {
    const [selectedBatchId, setSelectedBatchId] = useState<string | number>(
      selectedCourse?.batches?.[0]?.id || ""
    );
    const [currentSearch, setCurrentSearch] = useState("");
    const [addSearch, setAddSearch] = useState("");
    const [addStudentIds, setAddStudentIds] = useState<string[]>([]);
    const [allStudents, setAllStudents] = useState<StudentOption[]>([]);

    // Fetch all students for the "Add" list
    useEffect(() => {
      async function fetchStudents() {
        try {
          const res = await fetch("http://localhost:8081/api/v1/auth/admin/students");
          if (!res.ok) throw new Error("Failed to fetch students");
          const data = await res.json();
          // Support both {students: [...]} and [...]
          const arr = Array.isArray(data) ? data : data.students || [];
          const students: StudentOption[] = arr.map((s: any) => ({
            id: String(s.id),
            name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email,
            email: s.email,
          }));
          setAllStudents(students);
        } catch (err) {
          setAllStudents([]);
        }
      }
      fetchStudents();
    }, []);

    // Derived State
    const selectedBatch = selectedCourse?.batches?.find(
      (batch) => batch.id == selectedBatchId
    );
    const currentStudents = selectedBatch?.students || [];

    // Handlers
    async function handleDeleteStudent(studentId: string) {
      if (!selectedBatchId || !selectedCourse) return;
      try {
        await import("@/lib/api-courses").then(({ removeStudentFromBatch }) =>
          removeStudentFromBatch(selectedCourse.id, selectedBatchId, studentId)
        );
        toast({ title: "Student removed from batch" });

        // Refresh data
        const updatedCourses = await getCourses();
        const coursesList = Array.isArray(updatedCourses) ? updatedCourses : [];
        setCourses(coursesList);
        // Update local selected course to reflect changes immediately
        const updatedSelected = coursesList.find((c: Course) => c.id === selectedCourse.id);
        if (updatedSelected) setSelectedCourse(updatedSelected);

      } catch (err) {
        toast({ title: "Failed to delete student", description: String(err) });
      }
    }

    async function handleAddStudents() {
      if (!selectedBatchId || !selectedCourse || addStudentIds.length === 0) return;

      const selectedEmails = allStudents
        .filter((s) => addStudentIds.includes(s.id))
        .map((s) => s.email)
        // Prevent duplicates if API doesn't handle them (API does handle, but good to check)
        .filter((email) => !currentStudents.some((stu: any) => stu.email === email));

      if (selectedEmails.length === 0) {
        toast({ title: "No new students selected", description: "Selected students are already in the batch." });
        return;
      }

      let successCount = 0;
      let errorMessages = [];

      for (const email of selectedEmails) {
        try {
          const result = await import("@/lib/api-courses").then(({ addStudentToBatch }) =>
            addStudentToBatch(selectedCourse.id, Number(selectedBatchId), email)
          );
          if (result && result.success) {
            successCount++;
          } else if (result && result.message && !result.message.includes("already in batch")) {
            errorMessages.push(result.message);
          }
        } catch (err) {
          errorMessages.push(`Error adding ${email}`);
        }
      }

      setAddStudentIds([]);
      setAddSearch("");

      // Refresh data
      const updatedCourses = await getCourses();
      const coursesList = Array.isArray(updatedCourses) ? updatedCourses : [];
      setCourses(coursesList);
      const updatedSelected = coursesList.find((c: Course) => c.id === selectedCourse.id);
      if (updatedSelected) setSelectedCourse(updatedSelected);

      if (successCount > 0) toast({ title: `${successCount} students added!` });
      if (errorMessages.length > 0) toast({ title: "Errors occurred", description: errorMessages.join(", ") });
    }

    return (
      <DialogContent className="p-0 overflow-hidden max-w-2xl gap-0 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b">
          <DialogTitle>Manage Batches - {selectedCourse?.title}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">Add or remove students from your course batches.</p>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {!selectedCourse?.batches || selectedCourse.batches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No batches found for this course.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Batch Selector */}
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Select Batch</Label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                >
                  {selectedCourse.batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>{batch.name}</option>
                  ))}
                </select>
              </div>

              {selectedBatchId && (
                <>
                  {/* Current Students List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Current Students</Label>
                      <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold">
                        {currentStudents.length} enrolled
                      </Badge>
                    </div>

                    <div className="relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                      <Input
                        type="text"
                        className="pl-9 bg-accent/20"
                        placeholder="Filter current students..."
                        value={currentSearch}
                        onChange={(e) => setCurrentSearch(e.target.value)}
                      />
                    </div>

                    <div className="border rounded-md overflow-hidden max-h-[200px] overflow-y-auto bg-card">
                      {currentStudents.length === 0 ? (
                        <div className="text-muted-foreground text-sm p-4 text-center bg-muted/30">No students in this batch yet.</div>
                      ) : (
                        <div className="divide-y">
                          {currentStudents
                            .filter((s: any) =>
                              !currentSearch ||
                              (s.email && s.email.toLowerCase().includes(currentSearch.toLowerCase())) ||
                              (s.firstName && s.firstName.toLowerCase().includes(currentSearch.toLowerCase())) ||
                              (s.lastName && s.lastName.toLowerCase().includes(currentSearch.toLowerCase()))
                            )
                            .map((student: any) => (
                              <div key={student.id} className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase shrink-0">
                                    {(student.email || "?").substring(0, 2)}
                                  </div>
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="text-sm font-medium truncate">
                                      {student.firstName && student.lastName
                                        ? `${student.firstName} ${student.lastName}`
                                        : student.email}
                                    </span>
                                    <span className="text-xs text-muted-foreground truncate">{student.email}</span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                                  onClick={() => handleDeleteStudent(String(student.id))} // Use String casting if calling delete endpoint via ID
                                // Note: original delete used `email` but updated API might accept ID? 
                                // Actually, original code used student.id for delete: `handleDeleteStudent(student.id)`
                                // And `handleDeleteStudent` calls `removeStudentFromBatch` which takes ID.
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-1 1-1h6c1 0 1 1 1 1v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Students Section */}
                  <div className="space-y-3 pt-2 border-t">
                    <Label className="text-sm font-medium flex items-center gap-2 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                      Add New Students
                    </Label>

                    <div className="border rounded-md shadow-sm bg-card">
                      <div className="p-2 border-b bg-muted/30">
                        <Input
                          type="text"
                          className="h-9 border-none bg-transparent shadow-none focus-visible:ring-0 px-2 placeholder:text-muted-foreground/70"
                          placeholder="Search available students..."
                          value={addSearch}
                          onChange={(e) => setAddSearch(e.target.value)}
                        />
                      </div>
                      <div className="max-h-[220px] overflow-y-auto p-1 space-y-0.5">
                        {allStudents
                          .filter((student) =>
                            !addSearch ||
                            student.name.toLowerCase().includes(addSearch.toLowerCase()) ||
                            student.email.toLowerCase().includes(addSearch.toLowerCase())
                          )
                          .map((student) => (
                            <label
                              key={student.id}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all ${addStudentIds.includes(student.id) ? 'bg-primary/10 border-primary/20' : 'hover:bg-accent'}`}
                            >
                              <div className="relative flex items-center">
                                <input
                                  type="checkbox"
                                  className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 accent-primary"
                                  checked={addStudentIds.includes(student.id)}
                                  onChange={(e) => {
                                    setAddStudentIds((ids) =>
                                      e.target.checked
                                        ? [...ids, student.id]
                                        : ids.filter((id) => id !== student.id)
                                    );
                                  }}
                                />
                              </div>
                              <div className="flex flex-col text-sm">
                                <span className="font-medium leading-none">{student.name}</span>
                                <span className="text-xs text-muted-foreground mt-0.5">{student.email}</span>
                              </div>
                            </label>
                          ))}

                        {allStudents.filter(s => !addSearch || s.name.toLowerCase().includes(addSearch.toLowerCase())).length === 0 && (
                          <div className="py-8 text-center text-xs text-muted-foreground italic">No new students found</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">{addStudentIds.length} students selected</span>
                      <Button
                        size="sm"
                        disabled={addStudentIds.length === 0}
                        className="gap-2 transition-all hover:scale-105 active:scale-95"
                        onClick={handleAddStudents}
                      >
                        Add Students
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/10 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    );
  }

  // Rename Course Form
  function RenameCourseForm({ course }: { course: Course }) {
    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
      setLoading(true);
      try {
        await updateCourse(course.id, { title, description });
        setCourses((prev) =>
          prev.map((c) => (c.id === course.id ? { ...c, title, description } : c))
        );
        toast({ title: "Course updated successfully!" });
      } catch (err) {
        toast({ title: "Failed to update course", description: String(err) });
      }
      setLoading(false);
    };

    return (
      <div className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    );
  }

  const handleDeleteCourse = async (courseId: string | number) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(courseId);
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        toast({ title: "Course deleted successfully!" });
      } catch (err) {
        toast({ title: "Failed to delete course", description: String(err) });
      }
    }
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-2">
            Manage all courses and their batches.
          </p>
        </div>

        <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
          <DialogTrigger asChild>
            <Button>Create Course</Button>
          </DialogTrigger>
          <CreateCourseForm />
        </Dialog>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading courses...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : courses.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center">
            No courses yet. Create your first one!
          </p>
        ) : (
          courses.map((course) => (
            <Card key={course.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{course.title}</CardTitle>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost">
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rename Course</DialogTitle>
                      </DialogHeader>
                      <RenameCourseForm course={course} />
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground">{course.description}</p>

                {/* Display batches directly under each course */}
                {course.batches && course.batches.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Batches:</h4>
                    <ul className="list-disc ml-6">
                      {course.batches.map((batch) => (
                        <li key={batch.id}>{batch.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Dialog
                    open={showManageBatches && selectedCourse?.id === course.id}
                    onOpenChange={(open) => {
                      setShowManageBatches(open);
                      if (open) setSelectedCourse(course);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Manage Batches ({course.batches.length})
                      </Button>
                    </DialogTrigger>
                    <ManageBatchesPopup onClose={() => setShowManageBatches(false)} />
                  </Dialog>

                  <Dialog open={showCreateBatch} onOpenChange={setShowCreateBatch}>
                    <DialogTrigger asChild>
                      <Button size="sm">Create Batch</Button>
                    </DialogTrigger>
                    <CreateBatchForm />
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}