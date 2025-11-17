
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const students = [
  {
    id: "S001",
    name: "Alex Johnson",
    email: "alex.j@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    enrolledIn: ["MERN Stack Mastery", "Python for Data Analytics"],
  },
  {
    id: "S002",
    name: "Maria Garcia",
    email: "maria.g@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e290267072",
    enrolledIn: ["Python for Data Analytics"],
  },
  {
    id: "S003",
    name: "Sam Chen",
    email: "sam.c@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026707e",
    enrolledIn: ["MERN Stack Mastery"],
  },
];

export default function TutorStudentsPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">My Students</h1>
        <p className="text-lg text-muted-foreground mt-2">
          View and manage the students enrolled in your courses.
        </p>
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
                            <TableHead className="text-right">Actions</TableHead>
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
                                <TableCell>{student.enrolledIn.join(', ')}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">Message</Button>
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
