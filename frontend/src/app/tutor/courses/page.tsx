
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const courses = [
  {
    id: "C001",
    title: "MERN Stack Mastery",
    students: 124,
    status: "Published",
  },
  {
    id: "C002",
    title: "Python for Data Analytics",
    students: 88,
    status: "Published",
  },
  {
    id: "C003",
    title: "Advanced DevOps",
    students: 0,
    status: "Draft",
  },
];

export default function TutorCoursesPage() {
  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tighter">My Courses</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage your courses and view student enrollment.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Course
        </Button>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle className="font-headline">{course.title}</CardTitle>
              <CardDescription>{course.students} students enrolled</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <Badge variant={course.status === 'Published' ? 'default' : 'secondary'}>{course.status}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild><Link href="#">Edit Course</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="#">View Submissions</Link></DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
