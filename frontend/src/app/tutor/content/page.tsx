
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Video, FileText, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { UploadContentDialog } from "./components/upload-content-dialog";
import { tutorCourses, tutorStudents } from "./data";

const uploadedContent = [
    { id: 'V001', title: 'Introduction to React Hooks', type: 'Video', date: '2023-10-26', course: 'MERN Stack Mastery' },
    { id: 'D001', title: 'Advanced CSS Selectors (PDF)', type: 'Document', date: '2023-10-24', course: 'MERN Stack Mastery'},
    { id: 'V002', title: 'Building a REST API with Express', type: 'Video', date: '2023-10-22', course: 'MERN Stack Mastery' },
    { id: 'D002', title: 'State Management Patterns (PPT)', type: 'Document', date: '2023-10-20', course: 'Python for Data Analytics' },
]

export default function TutorContentPage() {
  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tighter">Content Management</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Upload and manage your video lectures and reference materials.
          </p>
        </div>
        <div className="flex gap-2">
            <UploadContentDialog 
                uploadType="Document" 
                courses={tutorCourses} 
                students={tutorStudents}
            >
                <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Upload Document
                </Button>
            </UploadContentDialog>
            <UploadContentDialog 
                uploadType="Video" 
                courses={tutorCourses} 
                students={tutorStudents}
            >
                <Button>
                    <Video className="mr-2 h-4 w-4" />
                    Upload Video
                </Button>
            </UploadContentDialog>
        </div>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Content</CardTitle>
            <CardDescription>A list of your recently uploaded materials.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedContent.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center w-fit gap-1">
                        {item.type === 'Video' ? <Video className="h-3 w-3"/> : <FileText className="h-3 w-3"/>}
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.course}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
