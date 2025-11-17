import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, PlusCircle } from "lucide-react";

const pendingSubmissions = [
    {
        student: "Alex Johnson",
        course: "MERN Stack Mastery",
        assignment: "Final Project",
        submittedAt: "2 hours ago"
    },
    {
        student: "Maria Garcia",
        course: "Python for Data Analytics",
        assignment: "Data Cleaning Challenge",
        submittedAt: "1 day ago"
    },
]

export default function TutorDashboard() {
  return (
    <div>
    <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter">Tutor Dashboard</h1>
            <p className="text-lg text-muted-foreground mt-2">
            Review submissions and manage your courses.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Course
        </Button>
    </header>
    <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Pending Submissions</h2>
        <div className="space-y-4">
            {pendingSubmissions.map(sub => (
                <Card key={sub.student + sub.assignment}>
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
    </section>
    </div>
  );
}
