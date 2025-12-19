'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Timer, CheckCircle, AlertCircle, ChevronRight, ChevronLeft, Save, Trophy, XCircle, ArrowLeft } from 'lucide-react';
import { getTestById, submitTest, getStudentSubmissions } from '@/lib/api-tests';
import { useToast } from '@/hooks/use-toast';

export default function TestTakerPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const testId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showReview, setShowReview] = useState(false);
    const [studentName, setStudentName] = useState("Student User");
    const [studentId, setStudentId] = useState("temp_student_123");

    // Fetch Test Data & Check Submission
    useEffect(() => {
        async function loadData() {
            try {
                // Fetch Student Profile
                const token = typeof window !== 'undefined' ? localStorage.getItem('studentToken') : null;
                let currentStudentId = "temp_student_123";
                let currentStudentName = "Student User";

                if (token) {
                    try {
                        const profileRes = await fetch('http://localhost:8081/api/v1/student/me', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (profileRes.ok) {
                            const profile = await profileRes.json();
                            currentStudentName = profile.name || `${profile.firstName} ${profile.lastName}`;
                            currentStudentId = profile.email || profile.id; // Use email as ID for consistency with previous logic
                            setStudentName(currentStudentName);
                            setStudentId(currentStudentId);
                        }
                    } catch (err) {
                        console.error("Failed to fetch student profile", err);
                    }
                } else {
                    // If no token, ensure state is set to defaults
                    setStudentName(currentStudentName);
                    setStudentId(currentStudentId);
                }

                const [foundTest, submissions] = await Promise.all([
                    getTestById(testId),
                    getStudentSubmissions(currentStudentId)
                ]);

                if (foundTest) {
                    if (!foundTest.questions) foundTest.questions = [];
                    setTest(foundTest);
                    setTimeLeft(parseInt(foundTest.duration) * 60);

                    // Check for existing submission
                    const existingSubmission = submissions.find((s: any) => String(s.testId) === String(testId));
                    if (existingSubmission) {
                        setResult(existingSubmission);
                        setAnswers(existingSubmission.answers || {});
                        setIsSubmitted(true);
                        setShowReview(true); // Default to review mode if already submitted
                    }
                } else {
                    toast({ variant: "destructive", title: "Error", description: "Test not found." });
                    router.push('/student/tests');
                }
            } catch (error) {
                console.error("Failed to load data", error);
                toast({ variant: "destructive", title: "Error", description: "Failed to load test data." });
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [testId, router, toast]);

    // Timer Logic
    useEffect(() => {
        if (!test || isSubmitted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(); // Auto-submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isSubmitted, test]);

    const handleAnswerChange = (qId: number, value: any) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitted) return;
        setIsSubmitted(true);

        try {
            const submissionResult = await submitTest(testId, studentId, studentName, answers, test.questions);
            setResult(submissionResult);
            setShowReview(false); // Show distinct result summary first

            toast({
                title: "Test Submitted!",
                description: `You scored ${submissionResult.score}%`,
            });
        } catch (error) {
            console.error("Submission failed", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "Could not save your answers." });
            setIsSubmitted(false); // Allow retry
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
    if (!test) return <div className="p-10 text-center">Test not found.</div>;
    if (!test.questions || test.questions.length === 0) return <div className="p-10 text-center">This test has no questions available.</div>;

    // --- Result / Review View ---
    if (result) {
        if (showReview) {
            // Full Question Review Mode
            return (
                <div className="min-h-screen bg-slate-50 flex flex-col p-8 max-w-5xl mx-auto">
                    <header className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <CheckCircle className="h-8 w-8 text-green-600" /> Test Review
                            </h1>
                            <p className="text-slate-500 mt-1">Reviewing your performance for <b>{test.title}</b></p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{result.score}%</div>
                            <Badge variant={result.status === 'Passed' ? 'default' : 'destructive'}>{result.status}</Badge>
                        </div>
                    </header>

                    <div className="space-y-8">
                        {test.questions.map((q: any, idx: number) => {
                            const studentAns = answers[q.id];
                            const isCorrect = q.type === 'MCQ' && studentAns === q.correctOption;
                            // For Coding, we don't automatedly grade correctness in UI yet, assume check needed
                            const isCoding = q.type === 'CODING';

                            return (
                                <Card key={q.id} className={`border-l-4 ${isCoding ? 'border-l-blue-500' : (isCorrect ? 'border-l-green-500' : 'border-l-red-500')} shadow-sm`}>
                                    <CardHeader className="bg-slate-50/50 pb-2">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-slate-500 text-xs uppercase tracking-wide">Question {idx + 1}</span>
                                            <Badge variant="outline">{q.score} pts</Badge>
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mt-1">{q.text}</h3>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        {q.type === 'MCQ' ? (
                                            <div className="space-y-2">
                                                {q.options.map((opt: string, oIdx: number) => {
                                                    const isSelected = studentAns === oIdx;
                                                    const isTrueCorrect = q.correctOption === oIdx;

                                                    let styleClass = "p-3 rounded-md border flex items-center justify-between ";
                                                    if (isTrueCorrect) styleClass += "bg-green-50 border-green-200 text-green-900 font-medium";
                                                    else if (isSelected && !isTrueCorrect) styleClass += "bg-red-50 border-red-200 text-red-900";
                                                    else styleClass += "bg-white border-slate-100 text-slate-600";

                                                    return (
                                                        <div key={oIdx} className={styleClass}>
                                                            <span>{opt}</span>
                                                            {isTrueCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                                                            {isSelected && !isTrueCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="text-xs font-semibold text-slate-500">Your Code:</div>
                                                <pre className="bg-slate-900 text-slate-100 p-4 rounded-md overflow-x-auto text-sm">
                                                    {studentAns || "// No code submitted"}
                                                </pre>
                                            </div>
                                        )}

                                        {!isCoding && !isCorrect && (
                                            <div className="text-sm text-slate-500 bg-slate-100 p-3 rounded flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>Correct Answer: <b>{q.options[q.correctOption]}</b></span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    <div className="mt-8 flex justify-center pb-10">
                        <Button size="lg" onClick={() => router.push('/student/tests')}>Return to Dashboard</Button>
                    </div>
                </div>
            );
        }

        // Summary View (shown immediately after submission)
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <Card className="max-w-md w-full shadow-lg border-t-4 border-t-primary">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-slate-100 p-4 rounded-full mb-4 w-fit">
                            {result.status === 'Passed' ? <Trophy className="h-10 w-10 text-yellow-500" /> : <XCircle className="h-10 w-10 text-red-500" />}
                        </div>
                        <CardTitle className="text-2xl font-bold">{result.status === 'Passed' ? 'Congratulations!' : 'Test Completed'}</CardTitle>
                        <CardDescription>Your submission has been recorded.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <div className="text-5xl font-extrabold text-slate-900 mb-2">{result.score}%</div>
                            <Badge variant={result.status === 'Passed' ? 'default' : 'destructive'} className="text-lg px-4 py-1">
                                {result.status}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-50 p-3 rounded-lg border text-center">
                                <span className="block text-slate-500">Total Score</span>
                                <span className="font-bold text-lg">{result.rawScore} / {result.totalScore}</span>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border text-center">
                                <span className="block text-slate-500">Questions</span>
                                <span className="font-bold text-lg">{test.questions.length}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        <Button className="w-full" onClick={() => setShowReview(true)}>Review Answers</Button>
                        <Button variant="outline" className="w-full" onClick={() => router.push('/student/tests')}>Return to Assessments</Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const currentQuestion = test.questions[currentQuestionIndex];
    if (!currentQuestion) return <div>Error loading question.</div>;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-8 py-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">{test.title}</h1>
                    <p className="text-xs text-slate-500">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>
                        <Timer className="h-4 w-4" />
                        {formatTime(timeLeft)}
                    </div>
                    <Button onClick={handleSubmit} variant="destructive" disabled={isSubmitted}>
                        {isSubmitted ? 'Submitting...' : 'Finish Test'}
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
                <Card className="min-h-[400px] flex flex-col shadow-md border-none">
                    <CardHeader className="bg-slate-50/50 border-b pb-6">
                        <div className="flex justify-between items-start">
                            <Badge variant="outline" className="mb-2 uppercase tracking-widest text-[10px]">{currentQuestion.type}</Badge>
                            <span className="text-xs text-slate-400 font-medium">Score: {currentQuestion.score} pts</span>
                        </div>
                        <h2 className="text-xl font-medium text-slate-800 leading-relaxed">
                            {currentQuestion.text}
                        </h2>
                    </CardHeader>

                    <CardContent className="flex-1 pt-8">
                        {currentQuestion.type === 'MCQ' && (
                            <RadioGroup
                                value={answers[currentQuestion.id] !== undefined ? String(answers[currentQuestion.id]) : ""}
                                onValueChange={(val) => handleAnswerChange(currentQuestion.id, parseInt(val))}
                                className="space-y-4"
                            >
                                {currentQuestion.options.map((opt: string, idx: number) => (
                                    <div key={idx} className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${answers[currentQuestion.id] === idx ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-200 hover:bg-slate-50'}`}>
                                        <RadioGroupItem value={String(idx)} id={`mcq-${idx}`} />
                                        <Label htmlFor={`mcq-${idx}`} className="flex-1 cursor-pointer font-normal text-base text-slate-700">
                                            {opt}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}

                        {currentQuestion.type === 'CODING' && (
                            <div className="space-y-2">
                                <Label className="text-slate-500">Your Code Solution:</Label>
                                <Textarea
                                    className="font-mono bg-slate-900 text-slate-100 min-h-[300px] p-4 resize-none leading-relaxed"
                                    placeholder="// Write your code here..."
                                    value={answers[currentQuestion.id] || currentQuestion.codeTemplate || ""}
                                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                    spellCheck={false}
                                />
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="border-t bg-slate-50/30 p-6 flex justify-between">
                        <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" /> Previous
                        </Button>

                        {currentQuestionIndex < test.questions.length - 1 ? (
                            <Button onClick={handleNext} className="gap-2">
                                Next <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} className="gap-2 bg-green-600 hover:bg-green-700" disabled={isSubmitted}>
                                Submit All <CheckCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}
