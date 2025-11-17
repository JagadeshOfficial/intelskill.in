
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const tests = [
    { id: 'T01', title: 'React Fundamentals Quiz', course: 'MERN Stack Mastery', submissions: 112, status: 'Active'},
    { id: 'T02', title: 'Python Syntax Mock Exam', course: 'Python for Data Analytics', submissions: 75, status: 'Active'},
    { id: 'T03', title: 'Mid-term: API Design', course: 'MERN Stack Mastery', submissions: 0, status: 'Draft'},
]

export default function TutorTestsPage() {
  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tighter">Test Management</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Create and manage online tests, quizzes, and mock exams.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Test
        </Button>
      </header>
      <main>
        <Card>
            <CardHeader>
                <CardTitle>Existing Tests</CardTitle>
                <CardDescription>A list of tests you have created.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Associated Course</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map(test => (
                        <TableRow key={test.id}>
                            <TableCell className="font-medium">{test.title}</TableCell>
                            <TableCell>{test.course}</TableCell>
                            <TableCell>{test.submissions}</TableCell>
                            <TableCell>
                               <Badge variant={test.status === 'Active' ? 'default' : 'secondary'}>{test.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem>Edit Questions</DropdownMenuItem>
                                    <DropdownMenuItem>View Submissions</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">Delete Test</DropdownMenuItem>
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
