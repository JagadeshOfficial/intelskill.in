
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const assignmentSubmissions = [
    {
        id: "SUB001",
        student: "Alex Johnson",
        course: "MERN Stack Mastery",
        assignment: "Final Project",
        submittedAt: "2 hours ago"
    },
    {
        id: "SUB002",
        student: "Maria Garcia",
        course: "Python for Data Analytics",
        assignment: "Data Cleaning Challenge",
        submittedAt: "1 day ago"
    },
     {
        id: "SUB003",
        student: "Sam Chen",
        course: "MERN Stack Mastery",
        assignment: "API Integration",
        submittedAt: "3 days ago"
    },
];

const testSubmissions = [
    {
        id: "TSUB001",
        student: "Emily White",
        course: "MERN Stack Mastery",
        test: "React Fundamentals Quiz",
        score: "92/100",
        submittedAt: "4 hours ago"
    },
     {
        id: "TSUB002",
        student: "Alex Johnson",
        course: "MERN Stack Mastery",
        test: "React Fundamentals Quiz",
        score: "85/100",
        submittedAt: "5 hours ago"
    },
]

export default function TutorSubmissionsPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Review Submissions</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Grade assignments and review test results for your students.
        </p>
      </header>
      <main>
        <Tabs defaultValue="assignments">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
                <TabsTrigger value="tests">Tests</TabsTrigger>
            </TabsList>
            <TabsContent value="assignments">
                <div className="space-y-4">
                    {assignmentSubmissions.map(sub => (
                    <Card key={sub.id}>
                        <CardHeader>
                            <CardTitle>{sub.assignment}</CardTitle>
                            <CardDescription>{sub.student} - {sub.course}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Clock className="mr-2 h-4 w-4" />
                                Submitted {sub.submittedAt}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline">View Submission</Button>
                            <Button variant="destructive">
                                <X className="mr-2 h-4 w-4" />
                                Needs Revision
                            </Button>
                            <Button>
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
            </TabsContent>
            <TabsContent value="tests">
                <div className="space-y-4">
                    {testSubmissions.map(sub => (
                        <Card key={sub.id}>
                            <CardHeader>
                                <CardTitle>{sub.test}</CardTitle>
                                <CardDescription>{sub.student} - {sub.course}</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="mr-2 h-4 w-4" />
                                    Submitted {sub.submittedAt}
                                </div>
                                <p className="text-2xl font-bold mt-4">Score: {sub.score}</p>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button variant="outline">View Details</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
