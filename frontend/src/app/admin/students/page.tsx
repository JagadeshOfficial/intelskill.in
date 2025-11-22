"use client"

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthAvatar from "@/components/layout/auth-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialStudents = [
  {
    id: "S001",
    name: "Alex Johnson",
    email: "alex.j@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    joined: "2023-01-15",
    courses: 3,
    status: "Active",
  },
  {
    id: "S002",
    name: "Maria Garcia",
    email: "maria.g@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e290267072",
    joined: "2023-02-20",
    courses: 5,
    status: "Active",
  },
  {
    id: "S003",
    name: "Sam Chen",
    email: "sam.c@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707e",
    joined: "2023-03-10",
    courses: 2,
    status: "Suspended",
  },
  {
    id: "S004",
    name: "Emily White",
    email: "emily.w@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026708a",
    joined: "2023-04-05",
    courses: 1,
    status: "Active",
  },
];

export default function AdminStudentsPage() {
  interface Student {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    joined?: string;
    courses?: number;
    status?: string;
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [newStudent, setNewStudent] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    status: "APPROVED",
  });

  const formatDateFromArray = (arr: any): string | undefined => {
    try {
      if (!arr || !Array.isArray(arr)) return undefined;
      const [year, month, day] = arr;
      const d = new Date(year, (month || 1) - 1, day || 1);
      return d.toISOString().slice(0, 10);
    } catch (e) {
      return undefined;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/admin/students`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      const list = data?.students || [];
      if (list.length) {
        const mapped = list.map((s: any) => ({
          id: String(s.id),
          name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email,
          email: s.email,
          avatar: s.photoUrl || null,
          joined: formatDateFromArray(s.createdAt),
          courses: s.courses || 0,
          status: s.status ? (s.status === "APPROVED" || s.status === "ACTIVE" ? "Active" : s.status) : "Active",
        }));
        setStudents(mapped);
      }
    } catch (err) {
      console.warn("Could not load students from API, using static data.", err);
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (studentId: string | number, newStatus: string) => {
    try {
      setStudents((prev) => prev.map((s) => (s.id === String(studentId) ? { ...s, status: newStatus } : s)));
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/admin/students/${studentId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      fetchStudents();
    } catch (err) {
      console.error("Error updating status", err);
      setError(err instanceof Error ? err.message : "Failed to update status");
      fetchStudents();
    }
  };

  const handleViewClick = async (id: string | number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/admin/students/${id}`);
      if (!res.ok) throw new Error("Failed to fetch student");
      const data = await res.json();
      setSelectedStudent({
        id: String(data.id),
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        email: data.email,
        avatar: data.photoUrl || null,
        joined: Array.isArray(data.createdAt)
          ? `${data.createdAt[0]}-${String(data.createdAt[1]).padStart(2, "0")}-${String(data.createdAt[2]).padStart(2, "0")}`
          : undefined,
        courses: data.courses || 0,
        status: data.status || "APPROVED",
      });
      setViewDialogOpen(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load student details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    try {
      setFormLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/admin/students/${selectedStudent.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete student");
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete student");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      setFormLoading(true);
      const payload = {
        email: newStudent.email,
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        phoneNumber: newStudent.phoneNumber,
        password: newStudent.password,
        status: newStudent.status,
      };
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/admin/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to create student");
      setAddDialogOpen(false);
      setNewStudent({ email: "", firstName: "", lastName: "", phoneNumber: "", password: "", status: "APPROVED" });
      fetchStudents();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create student");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tighter">Manage Students</h1>
          <p className="text-lg text-muted-foreground mt-2">View, edit, and manage student accounts.</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Student
        </Button>
      </header>

      <main>
        <Card>
          <CardContent className="pt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Courses Enrolled</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {student.avatar ? (
                            <>
                              <AuthAvatar src={student.avatar} alt={student.name} />
                              <AvatarFallback>{(student.name || "").charAt(0)}</AvatarFallback>
                            </>
                          ) : (
                            <>
                              <AvatarImage src={`https://i.pravatar.cc/150?u=${student.email}`} />
                              <AvatarFallback>{(student.name || "").charAt(0)}</AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell className="text-center">{student.courses}</TableCell>
                    <TableCell>{student.joined}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "Active" ? "default" : "destructive"}>{student.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewClick(student.id)}>View Details</DropdownMenuItem>
                          {student.status === "Active" ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(student.id, "SUSPENDED")}>Suspend</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(student.id, "APPROVED")}>Re-activate</DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedStudent(student);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            Delete Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>Details for the selected student.</DialogDescription>
          </DialogHeader>
          {selectedStudent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  {selectedStudent.avatar ? (
                    <AuthAvatar src={selectedStudent.avatar} alt={selectedStudent.name} />
                  ) : (
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${selectedStudent.email}`} />
                  )}
                  <AvatarFallback>{(selectedStudent.name || "").charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{selectedStudent.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedStudent.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-medium">{selectedStudent.status}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Courses</div>
                  <div className="font-medium">{selectedStudent.courses}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Joined</div>
                  <div className="font-medium">{selectedStudent.joined}</div>
                </div>
              </div>
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Create a new student account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4">
            {formError && <div className="text-sm text-red-600">{formError}</div>}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={newStudent.firstName} onChange={(e) => setNewStudent((p) => ({ ...p, firstName: e.target.value }))} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={newStudent.lastName} onChange={(e) => setNewStudent((p) => ({ ...p, lastName: e.target.value }))} required />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={newStudent.email} onChange={(e) => setNewStudent((p) => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={newStudent.phoneNumber} onChange={(e) => setNewStudent((p) => ({ ...p, phoneNumber: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="password">Password (optional)</Label>
              <Input id="password" type="password" value={newStudent.password} onChange={(e) => setNewStudent((p) => ({ ...p, password: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={newStudent.status} onValueChange={(v) => setNewStudent((p) => ({ ...p, status: v }))}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={formLoading}>{formLoading ? 'Creating...' : 'Create Student'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete Student?</DialogTitle>
            <DialogDescription>Are you sure you want to delete this student account? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white" onClick={handleDeleteStudent} disabled={formLoading}>{formLoading ? 'Deleting...' : 'Delete'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// tsserver-refresh
