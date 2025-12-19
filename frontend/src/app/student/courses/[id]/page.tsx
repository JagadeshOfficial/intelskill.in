'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Loader2, PlayCircle, FileText, Folder, Lock, CheckCircle2,
    ChevronLeft, Download, MonitorPlay, File as FileIcon,
    MessageSquare, BookOpen, AlertCircle, Image as ImageIcon,
    FileCode, Film
} from 'lucide-react';
import { getFiles } from '@/lib/api-files';
import { getFolders } from '@/lib/api-folders';

export default function StudentCoursePlayerPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<any>(null);

    // Multi-batch support
    const [enrolledBatches, setEnrolledBatches] = useState<any[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

    const [folders, setFolders] = useState<any[]>([]);
    const [files, setFiles] = useState<any[]>([]);
    const [activeFile, setActiveFile] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Initial Data Load
    useEffect(() => {
        const loadCourseData = async () => {
            try {
                if (!params?.id) return;
                const courseId = params.id as string;

                const email = localStorage.getItem('studentEmail');
                if (!email) {
                    router.push('/login');
                    return;
                }

                // 1. Fetch Student's Courses
                const coursesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/courses/student/${email}`);
                if (!coursesRes.ok) throw new Error("Failed to load course data");

                const myCourses = await coursesRes.json();
                const currentCourse = myCourses.find((c: any) => String(c.id) === String(courseId));

                if (!currentCourse) {
                    setError("You are not enrolled in this course.");
                    setLoading(false);
                    return;
                }

                setCourse(currentCourse);

                // 2. Identify Enrolled Batches
                const eBatches = currentCourse.batches?.filter((b: any) =>
                    b.students?.some((s: any) => s.email === email)
                ) || [];

                setEnrolledBatches(eBatches);

                if (eBatches.length > 0) {
                    // Default to the first batch found if not already selected
                    if (!selectedBatchId) {
                        setSelectedBatchId(String(eBatches[0].id));
                    }
                } else {
                    console.warn("Could not determine batch. Content might be unavailable.");
                    // Still allow loading if purely self-paced course logic existed, 
                    // but for now we rely on batchId for content.
                }

            } catch (err) {
                console.error(err);
                setError("An error occurred while loading the course.");
            } finally {
                // If we have batches, loading is 'done' for the course, 
                // content loading happens in the next effect when selectedBatchId changes.
                if (enrolledBatches.length === 0) setLoading(false);
            }
        };

        loadCourseData();
    }, [params?.id, router]);

    // Content Load Effect (Triggers when Batch selection changes)
    useEffect(() => {
        const loadContent = async () => {
            if (!selectedBatchId || !params?.id) return;

            setLoading(true);
            try {
                const [foldersData, filesData] = await Promise.all([
                    getFolders(Number(selectedBatchId)),
                    getFiles(params.id as string, selectedBatchId, 'ANY')
                ]);

                setFolders(Array.isArray(foldersData) ? foldersData : []);
                setFiles(Array.isArray(filesData) ? filesData : []);

                // Auto-select first file if none active
                if (!activeFile && Array.isArray(filesData) && filesData.length > 0) {
                    setActiveFile(filesData[0]);
                }
            } catch (err) {
                console.error("Content fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (selectedBatchId) {
            loadContent();
        }
    }, [selectedBatchId, params?.id]);


    // Helper: Build Folder Tree from flat list
    const buildFolderTree = (flatFolders: any[]) => {
        const folderMap = new Map();
        const roots: any[] = [];

        // Normalize ID to string helper for reliable matching
        const safeId = (id: any) => String(id);

        // Initialize map with robust ID handling
        flatFolders.forEach(f => {
            folderMap.set(safeId(f.id), { ...f, children: [], files: [] });
        });

        // Populate hierarchy
        flatFolders.forEach(f => {
            const node = folderMap.get(safeId(f.id));
            if (!node) return;

            // Check if parentId is genuinely present (not null, not 0, not "0")
            const hasParent = f.parentId && f.parentId !== 0 && String(f.parentId) !== '0';

            if (hasParent) {
                const parent = folderMap.get(safeId(f.parentId));
                if (parent) {
                    parent.children.push(node);
                } else {
                    // Orphaned child (parent not found) -> treat as root
                    roots.push(node);
                }
            } else {
                roots.push(node);
            }
        });

        return { roots, folderMap };
    };

    // Derived state for the tree
    const { roots: folderTree, folderMap } = buildFolderTree(folders);

    // Populate files into their respective folders in the map
    files.forEach(f => {
        // Handle files with folderId
        const fId = f.folderId;
        if (fId && fId !== 0 && String(fId) !== '0') {
            const folderNode = folderMap.get(String(fId));
            if (folderNode) {
                folderNode.files.push(f);
            }
        }
    });

    const getFolderContent = (folderId: number | null) => {
        // Legacy support if needed, but we rely on the tree now for folder contents
        return files.filter(f => f.folderId === folderId);
    };

    const handleFileClick = (file: any) => {
        setActiveFile(file);
    };

    const getFileIcon = (fileType: string) => {
        if (fileType?.includes('video')) return <Film className="h-4 w-4 text-blue-500" />;
        if (fileType?.includes('image')) return <ImageIcon className="h-4 w-4 text-purple-500" />;
        if (fileType?.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
        return <FileIcon className="h-4 w-4 text-slate-500" />;
    };

    if (loading && !course) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-20 max-w-2xl">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-6 text-center">
                    <Button onClick={() => router.push('/student/my-courses')} variant="outline">Back to My Courses</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-white">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 bg-white shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/student/my-courses')} className="hover:bg-slate-100 rounded-full">
                        <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                    <div>
                        <h1 className="font-bold text-lg text-slate-900 line-clamp-1">{course?.title}</h1>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            {enrolledBatches.length > 1 ? (
                                <div className="flex items-center gap-2">
                                    <span>Batch:</span>
                                    <Select value={selectedBatchId || ''} onValueChange={setSelectedBatchId}>
                                        <SelectTrigger className="h-6 w-[180px] text-xs border-slate-200">
                                            <SelectValue placeholder="Select Batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {enrolledBatches.map(b => (
                                                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <span>Batch: {enrolledBatches[0]?.name || 'Self Paced'}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {/* Progress Removed */}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content Viewer */}
                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8 flex flex-col items-center">
                    <div className="w-full max-w-5xl space-y-6">
                        {/* Player Container */}
                        <div className="bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 aspect-video relative flex flex-col justify-center">
                            {activeFile ? (
                                <>
                                    {activeFile.fileType?.includes('video') ? (
                                        <video
                                            src={activeFile.downloadUrl}
                                            controls
                                            controlsList="nodownload"
                                            className="w-full h-full object-contain focus:outline-none"
                                            autoPlay={false}
                                        />
                                    ) : activeFile.fileType?.includes('image') ? (
                                        <div className="w-full h-full relative bg-slate-900">
                                            <img
                                                src={activeFile.downloadUrl}
                                                alt={activeFile.displayName}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        // Universal Viewer (Docs, PDF, etc.)
                                        <div className="w-full h-full bg-white relative">
                                            <iframe
                                                src={`https://docs.google.com/gview?url=${encodeURIComponent(activeFile.downloadUrl)}&embedded=true`}
                                                className="w-full h-full"
                                                title="Document Viewer"
                                            />
                                            {/* Overlay only if iframe fails or for fallback interaction */}
                                            <div className="absolute bottom-4 right-4 z-10">
                                                <Button size="sm" variant="secondary" className="shadow-lg backdrop-blur-md bg-white/80 hover:bg-white" asChild>
                                                    <a href={activeFile.downloadUrl} target="_blank" rel="noopener noreferrer">
                                                        <Download className="h-4 w-4 mr-2" /> Open Raw File
                                                    </a>
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-white/50 p-12">
                                    <MonitorPlay className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">Select content from the sidebar to begin</p>
                                </div>
                            )}
                        </div>

                        {/* Overview Content */}
                        <div className="w-full bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">{activeFile?.displayName || course?.title}</h2>
                            <p className="text-slate-600 leading-relaxed">
                                {activeFile ? (
                                    <>
                                        Currently viewing: <span className="font-medium text-slate-800">{activeFile.displayName}</span>
                                        <br />
                                        <span className="text-sm text-slate-400 mt-1 block">Type: {activeFile.fileType}</span>
                                    </>
                                ) : (
                                    course?.description || "Welcome to the course! Select a module to get started."
                                )}
                            </p>
                        </div>
                    </div>
                </main>

                {/* Recursive Playlist Sidebar */}
                <aside className="w-[350px] bg-white border-l border-slate-200 flex flex-col z-10 hidden lg:flex shadow-[-5px_0_30px_-10px_rgba(0,0,0,0.05)]">
                    <div className="p-5 border-b border-slate-100">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            Course Content
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">{folders.length} Sections • {files.length} Lessons</p>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {/* Root Files */}
                            {getFolderContent(null).length > 0 && (
                                <div className="space-y-1">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Introduction</h3>
                                    {getFolderContent(null).map(file => (
                                        <button
                                            key={file.id}
                                            onClick={() => handleFileClick(file)}
                                            className={`w - full flex items - start gap - 3 p - 3 text - left rounded - lg transition - all duration - 200 group
                                                ${activeFile?.id === file.id
                                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                                                    : 'hover:bg-slate-50 text-slate-600'
                                                }
`}
                                        >
                                            <div className={`mt - 0.5 shrink - 0 ${activeFile?.id === file.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} `}>
                                                {getFileIcon(file.fileType)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium line-clamp-2 leading-tight">
                                                    {file.displayName}
                                                </p>
                                                <span className="text-[10px] opacity-70 mt-1 block capitalize">
                                                    {file.fileType.split('/')[0]} {file.duration ? `• 10m` : ''}
                                                </span>
                                            </div>
                                            {activeFile?.id === file.id && (
                                                <div className="ml-auto mt-0.5">
                                                    <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Folders */}
                            <Accordion type="multiple" defaultValue={folders.slice(0, 1).map(f => `folder - ${f.id} `)} className="space-y-4">
                                {folderTree.map((folderNode, idx) => (
                                    <RecursiveFolderItem
                                        key={folderNode.id}
                                        folderNode={folderNode}
                                        idx={idx} // Only for top level numbering
                                        activeFile={activeFile}
                                        handleFileClick={handleFileClick}
                                        getFileIcon={getFileIcon}
                                    />
                                ))}
                            </Accordion>
                        </div>
                    </ScrollArea>
                </aside>
            </div>
        </div>
    );
}

// Recursive Folder Component
function RecursiveFolderItem({
    folderNode,
    idx,
    activeFile,
    handleFileClick,
    getFileIcon
}: {
    folderNode: any,
    idx?: number,
    activeFile: any,
    handleFileClick: (f: any) => void,
    getFileIcon: (t: string) => any
}) {
    return (
        <AccordionItem value={`folder-${folderNode.id}`} className="border-none relative">
            {/* Connector Line for nested items */}
            {idx === undefined && (
                <div className="absolute left-[-12px] top-4 w-3 h-px bg-slate-200" />
            )}

            <AccordionTrigger className={`hover:no-underline py-2 px-2 rounded-lg transition-colors group ${idx === undefined ? 'hover:bg-slate-50' : 'hover:bg-slate-100'}`}>
                <div className="flex items-center gap-3 text-left w-full overflow-hidden">
                    {/* Numbering only for top level folders */}
                    {idx !== undefined ? (
                        <div className="bg-slate-100 text-slate-500 group-hover:bg-white group-hover:shadow-sm h-8 w-8 rounded-md flex items-center justify-center transition-all shrink-0">
                            <span className="text-xs font-bold">{idx + 1}</span>
                        </div>
                    ) : (
                        <div className="h-6 w-6 flex items-center justify-center shrink-0">
                            <Folder className="h-4 w-4 text-blue-400 group-hover:fill-blue-100 transition-colors" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${idx !== undefined ? 'text-slate-700' : 'text-slate-600'} group-hover:text-slate-900`}>{folderNode.name}</p>
                        <p className="text-[10px] text-slate-400 font-normal truncate">
                            {folderNode.files.length} Files, {folderNode.children.length} Folders
                        </p>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0">
                <div className={`space-y-1 ${idx !== undefined ? 'border-l-2 border-slate-100 ml-4 pl-4' : 'border-l border-slate-200 ml-3 pl-3'} py-1`}>

                    {/* 1. Render Files in this folder */}
                    {folderNode.files.length > 0 ? (
                        folderNode.files.map((file: any) => (
                            <button
                                key={file.id}
                                onClick={() => handleFileClick(file)}
                                className={`w-full flex items-start gap-3 p-2 text-left rounded-md transition-all duration-200 group
                                    ${activeFile?.id === file.id
                                        ? 'bg-blue-50/50 text-blue-700 font-medium'
                                        : 'hover:bg-slate-50 text-slate-500'}
                                `}
                            >
                                <div className={`mt-0.5 shrink-0 ${activeFile?.id === file.id ? 'text-blue-500' : 'text-slate-300 group-hover:text-slate-400'}`}>
                                    {activeFile?.id === file.id ? <PlayCircle className="h-4 w-4 fill-blue-100" /> : getFileIcon(file.fileType)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm line-clamp-1">
                                        {file.displayName}
                                    </p>
                                </div>
                            </button>
                        ))
                    ) : null}

                    {/* 2. Render Sub-folders (Recursively) */}
                    {folderNode.children.length > 0 && (
                        <Accordion type="multiple" className="space-y-2 mt-2">
                            {folderNode.children.map((child: any) => (
                                <RecursiveFolderItem
                                    key={child.id}
                                    folderNode={child}
                                    activeFile={activeFile}
                                    handleFileClick={handleFileClick}
                                    getFileIcon={getFileIcon}
                                />
                            ))}
                        </Accordion>
                    )}

                    {folderNode.files.length === 0 && folderNode.children.length === 0 && (
                        <p className="text-xs text-slate-300 italic py-2 pl-2">Empty folder</p>
                    )}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
