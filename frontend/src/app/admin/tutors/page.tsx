
'use client'

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";

const initialTutors = [
  {
    id: "T001",
    name: "Dr. Evelyn Reed",
    email: "e.reed@example.com",
    avatar: "https://i.pravatar.cc/150?u=t01",
    expertise: "React, Next.js",
    joined: "2022-11-10",
    status: "Verified",
  },
  {
    id: "T002",
    name: "Kenji Tanaka",
    email: "k.tanaka@example.com",
    avatar: "https://i.pravatar.cc/150?u=t02",
    expertise: "Python, Data Science",
    joined: "2023-01-25",
    status: "Verified",
  },
  {
    id: "T003",
    name: "Fatima Al-Sayed",
    email: "f.alsayed@example.com",
    avatar: "https://i.pravatar.cc/150?u=t03",
    expertise: "Java, Spring Boot",
    joined: "2023-05-18",
    status: "Pending",
  },
];

export default function AdminTutorsPage() {
    const [tutors, setTutors] = useState(initialTutors);

    const handleStatusChange = (tutorId: string, newStatus: string) => {
        setTutors(tutors.map(tutor => 
            tutor.id === tutorId ? { ...tutor, status: newStatus } : tutor
        ));
    };


  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter">Manage Tutors</h1>
            <p className="text-lg text-muted-foreground mt-2">
            View, edit, and manage tutor accounts.
            </p>
        </div>
         <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Tutor
        </Button>
      </header>
      <main>
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tutor</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Expertise</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tutors.map(tutor => (
                            <TableRow key={tutor.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={tutor.avatar} alt={tutor.name} />
                                            <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{tutor.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{tutor.email}</TableCell>
                                <TableCell>{tutor.expertise}</TableCell>
                                <TableCell>{tutor.joined}</TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={
                                            tutor.status === 'Verified' ? 'default' : 
                                            tutor.status === 'Pending' ? 'secondary' : 
                                            'destructive'
                                        }
                                    >
                                        {tutor.status}
                                    </Badge>
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
                                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                                             {tutor.status === 'Pending' && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(tutor.id, 'Verified')}>
                                                    Verify Tutor
                                                </DropdownMenuItem>
                                            )}
                                            {tutor.status === 'Verified' && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(tutor.id, 'Suspended')}>
                                                    Suspend
                                                </DropdownMenuItem>
                                            )}
                                            {tutor.status === 'Suspended' && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(tutor.id, 'Verified')}>
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
