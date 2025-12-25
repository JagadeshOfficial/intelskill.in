"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Folder, FileText, Upload, Plus, ChevronRight, Home, Grid, List, Search, MoreVertical, File, Edit2, Variable, Download, Trash, MoreHorizontal, Play, Image as ImageIcon, X } from "lucide-react";
import { downloadFile as downloadFileHelper } from "@/lib/download-helper";
import { deleteStorageObject, deleteFileMetadata } from "@/lib/api-files";
import { getCourses, getBatches } from "@/lib/api-courses";
import { getFolders, createFolder, deleteFolder, updateFolder } from "@/lib/api-folders";
import { getFiles, uploadFile, saveFileMetadata, updateFileName } from "@/lib/api-files";
import { storage, auth } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function TutorContentPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  // Drive State
  const [folders, setFolders] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [folderPath, setFolderPath] = useState<any[]>([{ id: null, name: 'Home' }]);
  const [files, setFiles] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Folder rename state for tutors
  const [showFolderRenameModal, setShowFolderRenameModal] = useState(false);
  const [folderRenameTarget, setFolderRenameTarget] = useState<any | null>(null);
  const [folderRenameValue, setFolderRenameValue] = useState<string>("");

  // File rename state for tutors
  const [showFileRenameModal, setShowFileRenameModal] = useState(false);
  const [fileRenameTarget, setFileRenameTarget] = useState<any | null>(null);
  const [fileRenameValue, setFileRenameValue] = useState<string>("");

  // UI/UX State from Admin

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any | null>(null);

  // Helper to get friendly name
  const getDisplayName = (file: any) => {
    if (!file) return "Untitled";
    const candidates = [file.title, file.fileName, file.name, file.raw?.fileName, file.raw?.name];
    for (const c of candidates) {
      if (c && String(c).trim() !== "") return String(c);
    }
    return "Untitled";
  };

  const handleFileClick = (file: any) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
  };

  const handleDownload = (file: any) => {
    if (file.downloadUrl) {
      window.open(file.downloadUrl, "_blank");
    } else if (file.storagePath) {
      downloadFileHelper(file.storagePath).catch((e) => {
        toast({ title: "Download Failed", description: e.message || String(e), variant: "destructive" });
      });
    } else {
      toast({ title: "Download Failed", description: "No URL available", variant: "destructive" });
    }
  };

  // Fetch Courses
  useEffect(() => {
    const tutorId = localStorage.getItem('tutorId');
    const url = tutorId
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/courses/tutors/${tutorId}`
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/courses`;

    fetch(url)
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []));
  }, []);

  // Fetch Batches
  useEffect(() => {
    if (selectedCourse) {
      getBatches(selectedCourse.id).then((data) => setBatches(Array.isArray(data) ? data : []));
      setSelectedBatch(null);
      setFolders([]);
      setFiles([]);
    }
  }, [selectedCourse]);

  // Fetch Folders (All batch folders)
  useEffect(() => {
    if (selectedBatch) {
      setIsLoading(true);
      getFolders(selectedBatch.id).then((data) => {
        setFolders(Array.isArray(data) ? data : []);
        setIsLoading(false);
      });
      setCurrentFolderId(null);
      setFolderPath([{ id: null, name: 'Home' }]);
    }
  }, [selectedBatch]);

  const confirmTutorFolderRename = async () => {
    if (!folderRenameTarget || !folderRenameTarget.id) return;
    try {
      await updateFolder(folderRenameTarget.id, folderRenameValue);
      toast({ title: "Folder renamed", description: "Folder name updated." });
      setShowFolderRenameModal(false);
      if (selectedBatch) {
        const data = await getFolders(selectedBatch.id);
        setFolders(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Rename Failed", description: (e as any).message || String(e), variant: "destructive" });
    }
  };

  const confirmTutorFileRename = async () => {
    if (!fileRenameTarget || !fileRenameTarget.id) return;
    try {
      await updateFileName(fileRenameTarget.id, fileRenameValue);
      toast({ title: "File renamed", description: "File name updated." });
      setShowFileRenameModal(false);
      if (selectedBatch && selectedCourse) {
        const data = await getFiles(String(selectedCourse.id), String(selectedBatch.id), currentFolderId === null ? null : currentFolderId);
        setFiles(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Rename Failed", description: (e as any).message || String(e), variant: "destructive" });
    }
  };

  // Fetch Files (Lazy load for current folder)
  useEffect(() => {
    if (selectedBatch && selectedCourse) {
      const cId = String(selectedCourse.id);
      const bId = String(selectedBatch.id);
      const folderParam = currentFolderId === null ? null : currentFolderId;

      // Call getFiles with courseId, batchId and folderId so Firestore filtering works
      getFiles(cId, bId, folderParam)
        .then((data) => setFiles(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error("Error loading files:", err);
          setFiles([]);
        });
    } else {
      setFiles([]);
    }
  }, [selectedCourse, selectedBatch, currentFolderId]);

  const handleFolderClick = (folder: any) => {
    setCurrentFolderId(folder.id);
    setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1].id);
  };

  const currentLevelFolders = folders.filter(f =>
    (!currentFolderId && !f.parentId) || (f.parentId === currentFolderId)
  );

  const filteredFolders = currentLevelFolders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  // State for My Courses Module
  const [showMyCourses, setShowMyCourses] = useState(false);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loadingMyCourses, setLoadingMyCourses] = useState(false);

  const fetchMyCourses = async () => {
    setLoadingMyCourses(true);
    const tutorId = localStorage.getItem('tutorId');
    if (!tutorId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/courses/tutors/${tutorId}`);
      const data = await res.json();
      setMyCourses(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Failed to fetch my courses", e); }
    finally { setLoadingMyCourses(false); }
  };

  const handleUnassignSelf = async (courseId: string) => {
    if (!confirm("Are you sure you want to remove this course from your dashboard?")) return;
    const tutorId = localStorage.getItem('tutorId');
    if (!tutorId) return;
    try {
      // DELETE /api/courses/{courseId}/tutors/{tutorId}
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/courses/${courseId}/tutors/${tutorId}`, { method: 'DELETE' });
      toast({ title: "Course Removed", description: "You have been unassigned from this course." });
      fetchMyCourses(); // Refresh local list
      // Refresh main course selection list if needed
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/courses/tutors/${tutorId}`;
      fetch(url).then(res => res.json()).then(data => setCourses(Array.isArray(data) ? data : []));
    } catch (e) {
      toast({ title: "Error", description: "Failed to remove course.", variant: "destructive" });
    }
  };

  const filteredFiles = files.filter(f => {
    const name = (f.title || f.fileName || f.name || (f.data && f.data.originalName) || "").toString().toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedBatch) return;
    try {
      await createFolder(selectedBatch.id, newFolderName, currentFolderId);
      // Refresh folders
      const data = await getFolders(selectedBatch.id);
      setFolders(Array.isArray(data) ? data : []);
      setShowNewFolderModal(false);
      setNewFolderName("");
      setNewFolderName("");
      toast({ title: "Folder created", variant: "default" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create folder", variant: "destructive" });
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBatch || !selectedCourse) return;

    try {
      // Ensure anonymous auth so Storage rules allow upload if configured
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const cId = String(selectedCourse.id);
      const bId = String(selectedBatch.id);
      const fileName = `${Date.now()}_${file.name}`;
      const storagePath = `courses/${cId}/batches/${bId}/${fileName}`;

      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          () => { },
          (err) => reject(err),
          () => resolve()
        );
      });

      const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

      // Save metadata to Firestore so files appear in lists
      await saveFileMetadata({
        courseId: cId,
        batchId: bId,
        folderId: currentFolderId ?? null,
        fileName: file.name,
        fileType: file.type,
        storagePath,
        downloadUrl
      });

      // Refresh files list
      const data = await getFiles(cId, bId, currentFolderId === null ? null : currentFolderId).catch(() => []);
      setFiles(Array.isArray(data) ? data : []);

      setShowUploadModal(false);
      toast({ title: "File uploaded", variant: "default" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e?.message || "Failed to upload file", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Sidebar: Selection */}
      <div className="w-64 shrink-0 flex flex-col gap-6 border-r pr-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">1. Select Course</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => {
                fetchMyCourses();
                setShowMyCourses(true);
              }}
              title="Manage My Assigned Courses"
            >
              <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </div>
          <div className="space-y-1">
            {courses.map(course => (
              <Button
                key={course.id}
                variant={selectedCourse?.id === course.id ? "secondary" : "ghost"}
                className="w-full justify-start truncate"
                onClick={() => setSelectedCourse(course)}
              >
                {course.title}
              </Button>
            ))}
          </div>
        </div>
        {selectedCourse && (
          <div>
            <h2 className="text-lg font-semibold mb-3">2. Select Batch</h2>
            <div className="space-y-1">
              {batches.map(batch => (
                <Button
                  key={batch.id}
                  variant={selectedBatch?.id === batch.id ? "secondary" : "ghost"}
                  className="w-full justify-start truncate"
                  onClick={() => setSelectedBatch(batch)}
                >
                  {batch.name}
                </Button>
              ))}
              {batches.length === 0 && <p className="text-sm text-muted-foreground p-2">No batches found.</p>}
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Drive */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedBatch ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
            <div className="text-center">
              <Folder className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Select a course and batch to view content</p>
            </div>
          </div>
        ) : (
          <>
            {/* Drive Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div className="flex items-center gap-2 overflow-hidden">
                {folderPath.map((item, index) => (
                  <div key={index} className="flex items-center text-sm font-medium">
                    {index > 0 && <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />}
                    <button
                      onClick={() => {
                        const newPath = folderPath.slice(0, index + 1);
                        setFolderPath(newPath);
                        setCurrentFolderId(newPath[newPath.length - 1].id);
                      }}
                      className={`hover:bg-accent px-2 py-1 rounded transition-colors ${index === folderPath.length - 1 ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                    >
                      {item.id === null ? <Home className="w-4 h-4" /> : item.name}
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    className="pl-8 h-9 w-[200px]"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center border rounded-md bg-background">
                  <Button variant="ghost" size="icon" className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : ''}`} onClick={() => setViewMode('grid')}>
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className={`h-8 w-8 ${viewMode === 'list' ? 'bg-accent text-accent-foreground' : ''}`} onClick={() => setViewMode('list')}>
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" /> New
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowNewFolderModal(true)}>
                      <Folder className="w-4 h-4 mr-2" /> New Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowUploadModal(true)}>
                      <Upload className="w-4 h-4 mr-2" /> File Upload
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            </div>

            {/* Drive Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Folders */}
              {filteredFolders.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">Folders</h3>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{filteredFolders.length} Folders</span>
                  </div>

                  <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" : "flex flex-col gap-3"}>
                    {filteredFolders.map(folder => (
                      <div
                        key={folder.id}
                        className={`group relative rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${viewMode === 'grid'
                          ? 'aspect-[5/4] flex flex-col hover:-translate-y-1'
                          : 'flex items-center p-4 hover:border-primary/50'
                          }`}
                        onDoubleClick={() => {
                          setCurrentFolderId(folder.id);
                          setFolderPath([...folderPath, { id: folder.id, name: folder.name }]);
                        }}
                      >
                        {/* Selection/Action Overlay (Grid) */}
                        {viewMode === 'grid' && (
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-sm bg-white/90 hover:bg-white dark:bg-black/50 dark:hover:bg-black/80 backdrop-blur-sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setFolderRenameTarget(folder); setFolderRenameValue(folder.name); setShowFolderRenameModal(true); }}>
                                  <Edit2 className="w-4 h-4 mr-2" /> Rename
                                </DropdownMenuItem>
                                {/* Tutors cannot delete folders usually, but if needed add here */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        {viewMode === 'grid' ? (
                          <>
                            {/* Grid View Content */}
                            <div className="flex-1 w-full flex justify-center items-center py-2">
                              <Folder className="w-16 h-16 fill-amber-400 text-amber-500 drop-shadow-sm transition-transform group-hover:scale-105" />
                            </div>

                            <div className="h-12 border-t bg-muted/20 px-3 flex items-center justify-center">
                              <h4 className="font-medium text-sm truncate leading-tight text-foreground/90 w-full text-center" title={folder.name}>
                                {folder.name}
                              </h4>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* List View Content */}
                            <Folder className="w-6 h-6 fill-amber-400 text-amber-500 mr-4 shrink-0" />
                            <span className="text-sm font-medium truncate flex-1 group-hover:text-primary transition-colors">{folder.name}</span>
                            <Button variant="ghost" size="sm" className="h-8 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); setFolderRenameTarget(folder); setFolderRenameValue(folder.name); setShowFolderRenameModal(true); }}>
                              <Edit2 className="w-4 h-4 mr-2" /> Rename
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {filteredFiles.length > 0 && currentFolderId !== null && (
                <div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-xl font-bold tracking-tight text-foreground">Files</h3>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{filteredFiles.length} Files</span>
                  </div>

                  <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6" : "flex flex-col gap-3"}>
                    {filteredFiles.map(file => (
                      <div
                        key={file.id}
                        className={`group relative rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${viewMode === 'grid'
                          ? 'aspect-[4/5] flex flex-col hover:-translate-y-1'
                          : 'flex items-center p-3 hover:bg-muted/30'
                          }`}
                        onClick={() => handleFileClick(file)}
                      >

                        {viewMode === 'grid' && (
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-sm bg-white/90 hover:bg-white dark:bg-black/50 dark:hover:bg-black/80 backdrop-blur-sm">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(file); }}>
                                  <Download className="w-4 h-4 mr-2" /> Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setFileRenameTarget(file); setFileRenameValue(getDisplayName(file)); setShowFileRenameModal(true); }}>
                                  <Edit2 className="w-4 h-4 mr-2" /> Rename
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        {viewMode === 'grid' ? (
                          <>
                            {/* Grid View Content */}
                            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-100 dark:group-hover:bg-slate-900 transition-colors">
                              {(file.fileType?.includes('image') || file.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? (
                                <ImageIcon className="w-16 h-16 text-blue-500 opacity-80" />
                              ) : (file.fileType?.includes('video') || file.fileName?.match(/\.(mp4|webm|mov)$/i)) ? (
                                <Play className="w-16 h-16 text-red-500 opacity-80 fill-current" />
                              ) : (file.fileType?.includes('pdf') || file.fileName?.match(/\.pdf$/i)) ? (
                                <FileText className="w-16 h-16 text-red-600 opacity-80" />
                              ) : (
                                <File className="w-16 h-16 text-slate-400 opacity-80" />
                              )}
                            </div>

                            <div className="h-14 flex items-center gap-3 px-3 bg-card border-t z-10 relative">
                              <div className="p-1.5 rounded-full bg-blue-50 text-blue-600 shrink-0">
                                {(file.fileType?.includes('video') || file.fileName?.match(/\.(mp4|webm|mov)$/i)) ? <Play size={14} className="fill-current" /> : <FileText size={14} />}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-medium text-sm truncate text-foreground/90" title={getDisplayName(file)}>
                                  {getDisplayName(file)}
                                </h4>
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Document'}
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* List View Content */}
                            <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mr-4">
                              {(file.fileType?.includes('video') || file.fileName?.match(/\.(mp4|webm|mov)$/i)) ? <Play size={16} className="fill-current" /> : <FileText size={16} />}
                            </div>

                            <div className="flex-1 min-w-0 mr-4">
                              <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors cursor-pointer hover:underline" onClick={() => handleFileClick(file)} title={getDisplayName(file)}>
                                {getDisplayName(file)}
                              </h4>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDownload(file); }}>
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setFileRenameTarget(file); setFileRenameValue(getDisplayName(file)); setShowFileRenameModal(true); }}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  <div className="bg-muted/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-10 h-10 opacity-20" />
                  </div>
                  <p>This folder is empty.</p>
                  <Button variant="link" onClick={() => setShowNewFolderModal(true)} className="mt-2">Create a new folder</Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* New Folder Modal */}
      <Dialog open={showNewFolderModal} onOpenChange={setShowNewFolderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
            <DialogDescription>Create a new folder to organize your content.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder Name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderModal(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Folder Rename Modal for Tutors */}
      <Dialog open={showFolderRenameModal} onOpenChange={setShowFolderRenameModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>Update the folder name.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input value={folderRenameValue} onChange={e => setFolderRenameValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmTutorFolderRename()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFolderRenameModal(false)}>Cancel</Button>
            <Button onClick={() => confirmTutorFolderRename()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* File Rename Modal for Tutors */}
      <Dialog open={showFileRenameModal} onOpenChange={setShowFileRenameModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>Update the file's displayed name.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input value={fileRenameValue} onChange={e => setFileRenameValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmTutorFileRename()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFileRenameModal(false)}>Cancel</Button>
            <Button onClick={() => confirmTutorFileRename()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* My Courses Modal */}
      <Dialog open={showMyCourses} onOpenChange={setShowMyCourses}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>My Assigned Courses</DialogTitle>
            <DialogDescription>
              View and manage the courses currently assigned to you.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 max-h-[60vh] overflow-y-auto">
            {loadingMyCourses ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : myCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No courses assigned yet.</div>
            ) : (
              <div className="space-y-2">
                {myCourses.map((c: any) => (
                  <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md bg-secondary/10 gap-3">
                    <div>
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-xs text-muted-foreground">{c.description || "No description"}</div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="shrink-0"
                      onClick={() => handleUnassignSelf(c.id)}
                    >
                      Unassign
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMyCourses(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col p-0 overflow-hidden bg-black/95 border-border/20 backdrop-blur-xl">
          <DialogTitle className="sr-only">File Preview</DialogTitle>
          <div className="flex items-center justify-between p-4 border-b border-border/10 bg-black/20 text-white z-10 absolute top-0 w-full hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full">
                {(previewFile?.fileType?.includes('video') || previewFile?.fileName?.match(/\.(mp4|webm|mov)$/i)) ? <Play size={18} /> :
                  (previewFile?.fileType?.includes('image') || previewFile?.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) ? <ImageIcon size={18} /> :
                    <FileText size={18} />}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{previewFile?.displayName || previewFile?.fileName || getDisplayName(previewFile)}</h3>
                <p className="text-xs text-white/50">{previewFile?.fileType || 'Unknown Type'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => previewFile && handleDownload(previewFile)}>
                <Download className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => setShowPreviewModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 pt-16 bg-zinc-900/50">
            {previewFile && (
              <>
                {/* Video Player */}
                {(previewFile.fileType?.includes('video') || previewFile.fileName?.match(/\.(mp4|webm|mov)$/i)) && (
                  <video controls className="max-w-full max-h-[70vh] rounded-lg shadow-2xl w-full aspect-video" src={previewFile.downloadUrl}>
                    Your browser does not support the video tag.
                  </video>
                )}

                {/* Image Viewer */}
                {(previewFile.fileType?.includes('image') || previewFile.fileName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewFile.downloadUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-xl" />
                )}

                {/* PDF Viewer - Basic Iframe */}
                {(previewFile.fileType?.includes('pdf') || previewFile.fileName?.match(/\.pdf$/i)) && (
                  <iframe src={previewFile.downloadUrl} className="w-full h-full rounded-lg bg-white border-0 shadow-xl" title="PDF Preview" />
                )}

                {/* Fallback for other files */}
                {!(previewFile.fileType?.includes('video') || previewFile.fileName?.match(/\.(mp4|webm|mov)$/i)) &&
                  !(previewFile.fileType?.includes('image') || previewFile.fileName?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) &&
                  !(previewFile.fileType?.includes('pdf') || previewFile.fileName?.match(/\.pdf$/i)) && (
                    <div className="text-center text-zinc-400">
                      <File className="w-24 h-24 mx-auto mb-6 opacity-20" />
                      <h3 className="text-xl font-medium text-zinc-200 mb-2">No preview available</h3>
                      <p className="max-w-md mx-auto mb-8">This file type cannot be previewed directly in the browser.</p>
                      <Button onClick={() => handleDownload(previewFile)} className="gap-2" size="lg">
                        <Download className="w-4 h-4" /> Download File
                      </Button>
                    </div>
                  )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}