
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tests = [
    {
        id: 'T01',
        title: 'React Fundamentals Quiz',
        course: 'MERN Stack Mastery',
        status: 'Not Attempted',
        questions: 20
    },
    {
        id: 'T02',
        title: 'Python Syntax Mock Exam',
        course: 'Python for Data Analytics',
        status: 'Completed',
        score: '85/100'
    },
    {
        id: 'T03',
        title: 'Mid-term: API Design',
        course: 'MERN Stack Mastery',
        status: 'Not Attempted',
        questions: 30
    },
];

export default function StudentTestsPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Online Tests</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Test your knowledge, attempt quizzes, and review your results.
        </p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map(test => (
            <Card key={test.id}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                         <CardTitle className="font-headline">{test.title}</CardTitle>
                         <Badge variant={test.status === 'Completed' ? 'default' : 'secondary'}>{test.status}</Badge>
                    </div>
                    <CardDescription>{test.course}</CardDescription>
                </CardHeader>
                <CardContent>
                    {test.status === 'Completed' ? (
                        <div>
                            <p className="text-sm text-muted-foreground">Score</p>
                            <p className="text-3xl font-bold">{test.score}</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-muted-foreground">Number of Questions</p>
                            <p className="text-3xl font-bold">{test.questions}</p>
                        </div>
                    )}
                </CardContent>
                <CardContent className="flex justify-end">
                    {test.status === 'Completed' ? (
                        <Button variant="outline">
                            <BarChart className="mr-2" />
                            View Analytics
                        </Button>
                    ) : (
                         <Button>
                            <FileCheck className="mr-2" />
                            Attempt Test
                        </Button>
                    )}
                </CardContent>
            </Card>
        ))}
      </main>
    </div>
  );
}
