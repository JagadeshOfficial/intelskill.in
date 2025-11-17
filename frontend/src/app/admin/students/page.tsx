
'use client'

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";

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
    const [students, setStudents] = useState(initialStudents);

    const handleStatusChange = (studentId: string, newStatus: string) => {
        setStudents(students.map(student => 
            student.id === studentId ? { ...student, status: newStatus } : student
        ));
    };

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter">Manage Students</h1>
            <p className="text-lg text-muted-foreground mt-2">
            View, edit, and manage student accounts.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Student
        </Button>
      </header>
      <main>
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Courses Enrolled</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map(student => (
                            <TableRow key={student.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={student.avatar} alt={student.name} />
                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{student.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell className="text-center">{student.courses}</TableCell>
                                <TableCell>{student.joined}</TableCell>
                                <TableCell>
                                    <Badge variant={student.status === 'Active' ? 'default' : 'destructive'}>{student.status}</Badge>
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
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            {student.status === 'Active' ? (
                                                <DropdownMenuItem onClick={() => handleStatusChange(student.id, 'Suspended')}>
                                                    Suspend
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem onClick={() => handleStatusChange(student.id, 'Active')}>
                                                    Re-activate
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="text-destructive">Delete Account</DropdownMenuItem>
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
    </div>
  );
}
