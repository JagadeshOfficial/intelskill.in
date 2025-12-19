'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Search, Download, Trophy, AlertTriangle, CheckCircle } from 'lucide-react';
import { getTestResults } from '@/lib/api-tests';

export default function TutorTestResultsPage() {
    const params = useParams();
    const router = useRouter();
    const testId = params.id as string;

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function loadResults() {
            try {
                const data = await getTestResults(testId);
                setResults(data);
            } catch (error) {
                console.error("Failed to load results", error);
            } finally {
                setLoading(false);
            }
        }
        loadResults();
    }, [testId]);

    const filteredResults = results.filter(r =>
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const avgScore = results.length > 0
        ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length)
        : 0;

    const passRate = results.length > 0
        ? Math.round((results.filter(r => r.status === 'Passed').length / results.length) * 100)
        : 0;

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Test Results</h1>
                        <p className="text-slate-500 text-sm">Detailed performance analysis for Test ID: {testId}</p>
                    </div>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgScore}%</div>
                        <p className="text-xs text-muted-foreground">Based on {results.length} submissions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{passRate}%</div>
                        <p className="text-xs text-muted-foreground">Students met the passing critera</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed Attempts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{results.filter(r => r.status === 'Failed').length}</div>
                        <p className="text-xs text-muted-foreground">Students need attention</p>
                    </CardContent>
                </Card>
            </div>

            {/* Results Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Student Submissions</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by student name..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Breakdown (MCQ / Code)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredResults.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredResults.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{row.studentName}</TableCell>
                                        <TableCell>
                                            <span className={`font-bold ${row.score >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                                                {row.score}%
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500">
                                            MCQ: {row.totalDetails?.mcq || 0} | Code: {row.totalDetails?.coding || 0}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={row.status === 'Passed' ? 'default' : 'destructive'}>
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs">
                                            {new Date(row.submittedAt).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
