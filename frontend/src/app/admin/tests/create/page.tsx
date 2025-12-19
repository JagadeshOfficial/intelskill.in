'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    ChevronLeft, Save, Plus, Trash2,
    Code, FileText, CheckCircle2, Clock
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from 'lucide-react';

import { getCourses, getBatches } from '@/lib/api-courses';
import { createTest } from '@/lib/api-tests';

export default function CreateTestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // --- Data State ---
    const [courses, setCourses] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);

    // --- Form State ---
    const [testTitle, setTestTitle] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [duration, setDuration] = useState('60');
    const [passingScore, setPassingScore] = useState('70');

    // --- Questions State ---
    const [questions, setQuestions] = useState<any[]>([]);

    // Fetch Courses
    useEffect(() => {
        async function loadCourses() {
            try {
                const data = await getCourses();
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        }
        loadCourses();
    }, []);

    // Fetch Batches when Course changes
    useEffect(() => {
        async function loadBatches() {
            if (!selectedCourse) {
                setBatches([]);
                return;
            }
            try {
                const data = await getBatches(selectedCourse);
                setBatches(data);
            } catch (error) {
                console.error("Failed to fetch batches", error);
                setBatches([]);
            }
        }
        loadBatches();
    }, [selectedCourse]);

    // --- Actions ---

    const handleAddQuestion = (type: 'MCQ' | 'CODING') => {
        const newQ = {
            id: Date.now(),
            type,
            text: '',
            score: type === 'CODING' ? 10 : 2,
            options: type === 'MCQ' ? ['', '', '', ''] : [],
            correctOption: 0,
            codeTemplate: type === 'CODING' ? '// Write your code here...' : '',
        };
        setQuestions([...questions, newQ]);
    };

    const handleRemoveQuestion = (id: number) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const handleQuestionChange = (id: number, field: string, value: any) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleOptionChange = (qId: number, oIndex: number, value: string) => {
        setQuestions(questions.map(q => {
            if (q.id !== qId) return q;
            const newOptions = [...q.options];
            newOptions[oIndex] = value;
            return { ...q, options: newOptions };
        }));
    };

    const handleSave = async () => {
        if (!testTitle || !selectedCourse || !selectedBatch) {
            alert("Please fill in all required fields (Title, Course, Batch).");
            return;
        }

        setLoading(true);
        try {
            const testPayload = {
                title: testTitle,
                courseId: selectedCourse,
                batchId: selectedBatch,
                duration: parseInt(duration),
                passingScore: parseInt(passingScore),
                instructions: "",
                questions: questions,
                status: "Active",
                createdAt: new Date().toISOString()
            };

            await createTest(testPayload);
            router.push('/admin/tests');
        } catch (error) {
            console.error("Failed to save test:", error);
            alert("Failed to save test. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            {/* Top Bar for Actions */}
            <header className="bg-white border-b px-8 py-4 sticky top-0 z-30 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-slate-500 hover:text-slate-800">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Create New Test</h1>
                        <p className="text-xs text-slate-500">Configure settings and add questions</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 mr-2">
                        Total Score: <span className="font-bold text-slate-900">{questions.reduce((acc, q) => acc + (q.score || 0), 0)}</span>
                    </span>
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className="gap-2 bg-slate-900 hover:bg-slate-800">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Save className="h-4 w-4" /> Save & Publish
                    </Button>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Configuration */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-sm sticky top-28">
                        <CardHeader className="bg-slate-100/50 py-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-500" /> Test Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label>Test Title</Label>
                                <Input
                                    placeholder="e.g., Core Java Final Assessment"
                                    value={testTitle}
                                    onChange={e => setTestTitle(e.target.value)}
                                    className="font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Select Course</Label>
                                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Course" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.title || c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Select Batch</Label>
                                    <Select value={selectedBatch} onValueChange={setSelectedBatch} disabled={!selectedCourse}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {batches.map((b: any) => (
                                                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Duration (mins)</Label>
                                    <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pass Score (%)</Label>
                                    <Input type="number" value={passingScore} onChange={e => setPassingScore(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Instructions</Label>
                                <Textarea className="h-24 resize-none" placeholder="Enter test instructions for students..." />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Question Builder */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Toolbar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-28 z-20">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-slate-700">Questions</h2>
                            <Badge variant="secondary">{questions.length}</Badge>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* Manual Add Buttons */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Plus className="h-4 w-4" /> Add Question
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleAddQuestion('MCQ')}>
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Multiple Choice
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAddQuestion('CODING')}>
                                        <Code className="h-4 w-4 mr-2" /> Coding Problem
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Question List Area */}
                    <div className="space-y-4">
                        {questions.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                                <div className="bg-white p-4 rounded-full w-fit mx-auto shadow-sm mb-4">
                                    <FileText className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No questions added yet</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-6">Start by adding questions manually.</p>
                            </div>
                        ) : (
                            questions.map((q, idx) => (
                                <Card key={q.id} className="group border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className={`absolute top-0 left-0 w-1 h-full ${q.type === 'CODING' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                    <CardHeader className="py-4 pb-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="font-mono text-xs">{idx + 1}</Badge>
                                                <Badge className={q.type === 'CODING' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 'bg-green-100 text-green-700 hover:bg-green-100'}>
                                                    {q.type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-xs text-slate-500 mr-2">
                                                    <span>Score:</span>
                                                    <Input
                                                        type="number"
                                                        className="w-16 h-7 text-xs"
                                                        value={q.score}
                                                        onChange={(e) => handleQuestionChange(q.id, 'score', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleRemoveQuestion(q.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pb-6">
                                        <Textarea
                                            placeholder="Enter question text here..."
                                            value={q.text}
                                            onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                                            className="font-medium text-base min-h-[80px] border-slate-200 focus:border-blue-500 resize-none"
                                        />

                                        {q.type === 'MCQ' && (
                                            <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                                                {q.options.map((opt: string, oIdx: number) => (
                                                    <div key={oIdx} className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name={`q-${q.id}`}
                                                            checked={q.correctOption === oIdx}
                                                            onChange={() => handleQuestionChange(q.id, 'correctOption', oIdx)}
                                                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                        />
                                                        <Input
                                                            value={opt}
                                                            onChange={(e) => handleOptionChange(q.id, oIdx, e.target.value)}
                                                            className="h-9"
                                                            placeholder={`Option ${oIdx + 1}`}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === 'CODING' && (
                                            <div className="rounded-md bg-slate-900 p-4 border border-slate-800">
                                                <div className="text-xs text-slate-400 mb-2 font-mono">Starter Code Template (Java/Python)</div>
                                                <Textarea
                                                    value={q.codeTemplate}
                                                    onChange={(e) => handleQuestionChange(q.id, 'codeTemplate', e.target.value)}
                                                    className="bg-transparent border-none text-slate-200 font-mono text-sm p-0 focus-visible:ring-0 min-h-[100px]"
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
