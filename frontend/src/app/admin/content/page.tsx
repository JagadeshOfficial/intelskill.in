
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, Video, FileText } from "lucide-react";

const content = [
  {
    id: "C001",
    title: "MERN Stack Mastery",
    type: "Course",
    author: "Dr. Evelyn Reed",
    status: "Published",
    created: "2023-01-20",
  },
  {
    id: "V001",
    title: "Introduction to React Hooks",
    type: "Video",
    author: "Kenji Tanaka",
    status: "Published",
    created: "2023-02-15",
  },
  {
    id: "D001",
    title: "Data Structures in Python",
    type: "Document",
    author: "Kenji Tanaka",
    status: "Draft",
    created: "2023-03-01",
  },
   {
    id: "C002",
    title: "Python for Data Analytics",
    type: "Course",
    author: "Kenji Tanaka",
    status: "Published",
    created: "2022-12-10",
  },
];

export default function AdminContentPage() {
  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter">Manage Content</h1>
            <p className="text-lg text-muted-foreground mt-2">
            Oversee courses, videos, and other learning materials.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Content
        </Button>
      </header>
      <main>
         <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Created Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {content.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.title}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="flex items-center w-fit gap-1">
                                        {item.type === 'Video' ? <Video className="h-3 w-3"/> : item.type === 'Document' ? <FileText className="h-3 w-3"/> : null}
                                        {item.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.author}</TableCell>
                                <TableCell>{item.created}</TableCell>
                                <TableCell>
                                     <Badge variant={item.status === 'Published' ? 'default' : 'secondary'}>{item.status}</Badge>
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
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                                            {item.status === 'Draft' && <DropdownMenuItem>Publish</DropdownMenuItem>}
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
