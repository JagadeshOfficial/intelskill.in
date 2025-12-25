'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Timer, Search, Loader2, PlayCircle, CheckCircle2, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { getTests, getStudentSubmissions } from '@/lib/api-tests'

export default function StudentTestsPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [tests, setTests] = useState<any[]>([])
    const [mySubmissions, setMySubmissions] = useState<any[]>([])

    useEffect(() => { loadData() }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('studentToken') : null;
            let profileId = null;

            // 1. Try to get Profile ID (Email) from API
            if (token) {
                try {
                    const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/v1/student/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (profileRes.ok) {
                        const profile = await profileRes.json();
                        profileId = profile.email || profile.id;
                    }
                } catch (err) {
                    console.error("Failed to fetch student profile", err);
                }
            }

            // 2. Get LocalStorage ID (Legacy)
            const localId = typeof window !== 'undefined' ? (localStorage.getItem('studentId') || "temp_student_123") : "temp_student_123";

            // 3. Determine unique IDs to fetch
            const idsToFetch = new Set<string>();
            if (profileId) idsToFetch.add(profileId);
            if (localId) idsToFetch.add(localId);
            if (idsToFetch.size === 0) idsToFetch.add("temp_student_123");

            // 4. Fetch Data
            const [testData, ...submissionResults] = await Promise.all([
                getTests(),
                ...Array.from(idsToFetch).map(id => getStudentSubmissions(id))
            ])

            // 5. Merge Submissions
            const allSubmissions = submissionResults.flat();

            console.log("Tests Loaded:", testData)
            console.log("Submissions Loaded for IDs:", Array.from(idsToFetch), allSubmissions)

            setTests(Array.isArray(testData) ? testData : [])
            setMySubmissions(allSubmissions)
        } catch (error) {
            console.error("Failed to load tests", error)
        } finally {
            setLoading(false)
        }
    }

    const getTestResult = (testId: any) => {
        // Find the LATEST submission for this test if multiple exist
        const submissionsForTest = mySubmissions.filter(s => String(s.testId) === String(testId));
        if (submissionsForTest.length === 0) return undefined;
        // Assuming we might want the latest if multiple exist? 
        // Or if any passed?
        // Let's just return the first one found or sort by date if available.
        // For now, returning the one with highest score or simple find is enough to show 'View Results'.
        return submissionsForTest[0];
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-4xl font-bold font-headline tracking-tighter text-primary">Assessments</h1>
                <p className="text-lg text-muted-foreground mt-2">Take tests, quizzes and check your performance.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map(test => {
                    const result = getTestResult(test.id);
                    const questionCount = test.questions ? test.questions.length : 0;

                    return (
                        <Card key={test.id} className="group hover:shadow-lg transition-all border-primary/10">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline">{test.course || test.courseId || 'General'}</Badge>
                                    {result ? (
                                        <Badge className={`gap-1 ${result.status === 'Passed' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                                            <CheckCircle2 className="h-3 w-3" /> Score: {result.score}%
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary"><Timer className="h-3 w-3 mr-1" /> {test.duration}m</Badge>
                                    )}
                                </div>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">{test.title}</CardTitle>
                                <CardDescription>{questionCount} Questions • Passing: {test.passingScore}%</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {result ? (
                                    <Button asChild variant="outline" className="w-full gap-2 text-primary border-primary/20 hover:bg-primary/5">
                                        <Link href={`/student/tests/${test.id}`}>
                                            <BarChart2 className="h-4 w-4" /> View Results
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button asChild className="w-full gap-2 transition-all hover:scale-[1.02]">
                                        <Link href={`/student/tests/${test.id}`}>
                                            <PlayCircle className="h-4 w-4" /> Start Assessment
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
                {tests.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground italic">No assessments available for your enrolled courses yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
