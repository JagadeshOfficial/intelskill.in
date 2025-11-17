import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, MessageSquare, PlayCircle } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const enrolledCourses = [
    {
        title: "MERN Stack Mastery",
        progress: 75,
        href: "/courses/course_mern"
    },
    {
        title: "Python for Data Analytics",
        progress: 40,
        href: "/courses/course_analytics"
    }
];

const upcomingSessions = [
    {
        title: "Live Q&A: MERN Stack",
        course: "MERN Stack Mastery",
        time: "Tomorrow at 4:00 PM"
    }
]

export default function StudentDashboard() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Welcome back, Alex!</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Continue your learning journey and track your progress.
        </p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-headline font-semibold">My Courses</h2>
            {enrolledCourses.map(course => (
                <Card key={course.title}>
                    <CardHeader>
                        <CardTitle>{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Progress value={course.progress} className="w-full" />
                            <span className="text-sm font-semibold">{course.progress}%</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button asChild>
                            <Link href={course.href}>
                                Continue Learning
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}

            <h2 className="text-2xl font-headline font-semibold mt-8">Upcoming Sessions</h2>
            {upcomingSessions.map(session => (
                <Card key={session.title} className="bg-primary/10 border-primary/40">
                    <CardHeader>
                        <CardTitle>{session.title}</CardTitle>
                        <CardDescription>{session.course}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{session.time}</p>
                    </CardContent>
                    <CardFooter>
                         <Button variant="secondary">
                            <PlayCircle className="mr-2 h-4 w-4"/>
                            Join Session
                        </Button>
                    </CardFooter>
                </Card>
            ))}

        </div>
        <aside className="space-y-6">
             <h2 className="text-2xl font-headline font-semibold">My Stats</h2>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Courses Completed</CardTitle>
                    <Award className="h-6 w-6 text-primary"/>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">5</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Forum Posts</CardTitle>
                    <MessageSquare className="h-6 w-6 text-primary"/>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">12</p>
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
}
