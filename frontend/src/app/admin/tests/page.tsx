'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Plus, Search, MoreVertical, Clock, Calendar,
    FileText, Users, GraduationCap, CheckCircle2,
    AlertCircle, BrainCircuit, BarChart
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getTests, deleteTest } from '@/lib/api-tests';
import { useToast } from '@/hooks/use-toast';

export default function AdminTestsPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadTests() {
            try {
                const data = await getTests();
                setTests(data);
            } catch (error) {
                console.error("Failed to fetch tests", error);
                toast({ variant: "destructive", title: "Error", description: "Failed to load tests." });
            } finally {
                setLoading(false);
            }
        }
        loadTests();
    }, [toast]);

    const handleDelete = async (testId: string) => {
        if (!confirm("Are you sure you want to delete this test? This action cannot be undone.")) return;

        try {
            await deleteTest(testId);
            setTests(tests.filter(t => t.id !== testId));
            toast({ title: "Test Deleted", description: "The test has been successfully removed." });
        } catch (error) {
            console.error("Delete failed", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete test." });
        }
    };

    const filteredTests = tests.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (test.batchId && test.batchId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (test.courseId && test.courseId.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <ClipboardCheckIcon className="h-8 w-8 text-primary" />
                        Online Tests
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Manage and conduct AI-powered assessments for your batches.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white">
                        <BrainCircuit className="h-4 w-4 mr-2 text-purple-600" /> AI Question Bank
                    </Button>
                    <Button asChild className="gap-2 shadow-lg hover:shadow-xl transition-all">
                        <Link href="/admin/tests/create">
                            <Plus className="h-5 w-5" /> Create New Test
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Active Tests"
                    value={tests.length}
                    change="+2 this week"
                    icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
                    bg="bg-green-50"
                />
                <StatsCard
                    title="Total Attempts"
                    value="1,248"
                    change="+15% vs last month"
                    icon={<Users className="h-6 w-6 text-blue-600" />}
                    bg="bg-blue-50"
                />
                <StatsCard
                    title="Avg. Score"
                    value="76%"
                    change="Stable"
                    icon={<GraduationCap className="h-6 w-6 text-purple-600" />}
                    bg="bg-purple-50"
                />
            </div>

            {/* Main Content Card */}
            <Card className="border-none shadow-sm">
                <CardHeader className="px-6 py-5 border-b bg-white rounded-t-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search tests by name or batch..."
                                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="hidden md:flex">Filter by Course</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 bg-white min-h-[400px]">
                    <div className="w-full">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b">
                            <div className="col-span-4">Test Details</div>
                            <div className="col-span-2">Target</div>
                            <div className="col-span-2">Configuration</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-slate-100">
                            {filteredTests.map(test => (
                                <div key={test.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors group">
                                    <div className="col-span-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer">{test.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-[10px] font-normal">{test.type || 'Assessment'}</Badge>
                                                    <span className="text-xs text-slate-400">• Created {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'Recently'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <div className="text-sm font-medium text-slate-700">{test.courseId || 'General'}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <Users className="h-3 w-3" /> Batch: {test.batchId || 'All'}
                                        </div>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-slate-400" /> {test.duration} mins
                                        </div>
                                        <div className="text-xs text-slate-600 flex items-center gap-1.5">
                                            <AlertCircle className="h-3.5 w-3.5 text-slate-400" /> {test.questions?.length || 0} Questions
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <Badge
                                            className={`${test.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                } border-none shadow-none`}
                                        >
                                            {test.status || 'Draft'}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/tests/${test.id}/results`} className="cursor-pointer flex items-center">
                                                        <BarChart className="mr-2 h-4 w-4" /> View Results
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/tests/${test.id}/edit`} className="cursor-pointer">
                                                        Edit Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/tests/${test.id}/edit`} className="cursor-pointer">
                                                        Manage Questions
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(test.id)} className="text-red-600 focus:text-red-600">
                                                    Delete Test
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function StatsCard({ title, value, change, icon, bg }: any) {
    return (
        <Card className="border-none shadow-sm bg-white overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-3 opacity-20 ${bg} rounded-bl-3xl`}>
                {icon}
            </div>
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${bg} bg-opacity-50`}>
                        {icon}
                    </div>
                    <h3 className="text-sm font-medium text-slate-500">{title}</h3>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{value}</span>
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{change}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function ClipboardCheckIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="m9 14 2 2 4-4" />
        </svg>
    )
}
