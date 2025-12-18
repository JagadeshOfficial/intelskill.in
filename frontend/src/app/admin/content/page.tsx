"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Folder, FileText, Upload, Plus, ChevronRight, Home, Grid, List, Search, Download, Trash, MoreHorizontal, Edit2 } from "lucide-react";
import { getBatches, deleteBatch, updateBatch } from "@/lib/api-courses";
import { getFolders, createFolder, deleteFolder, updateFolder } from "@/lib/api-folders";
import { getFiles, uploadFile, saveFileMetadata } from "@/lib/api-files";
import { useToast } from "@/hooks/use-toast";

import { FileUpload } from "@/components/admin/content/FileUpload";
import { auth } from "@/lib/firebase";
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { downloadFile as downloadFileHelper } from "../../../lib/download-helper";
import { deleteFileMetadata, deleteStorageObject, updateFileName } from "@/lib/api-files";

export default function AdminContentPage() {
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
  const [lastFetchTime, setLastFetchTime] = useState<string>("Pending...");
  // debug raw docs removed

  // Modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  // Rename modal state
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<any | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  // Batch rename/delete state
  const [batchRenameTarget, setBatchRenameTarget] = useState<any | null>(null);
  const [batchRenameValue, setBatchRenameValue] = useState<string>("");
  const [showBatchRenameModal, setShowBatchRenameModal] = useState(false);
  // Folder rename/delete state
  const [folderRenameTarget, setFolderRenameTarget] = useState<any | null>(null);
  const [folderRenameValue, setFolderRenameValue] = useState<string>("");
  const [showFolderRenameModal, setShowFolderRenameModal] = useState(false);
  // removed rename state - admin will display original filenames only

  const [user, setUser] = useState<User | null>(null);

  // robust Auth handling: Listen for state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // If not signed in, force sign in
      if (!currentUser) {
        // Automatically sign in if not already
        signInAnonymously(auth).catch(err => console.error("Auto-Auth failed:", err));
      } else {
        console.log("Auth restored:", currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch Courses
  useEffect(() => {
    fetch('http://localhost:8081/api/courses')
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
      // Eagerly fetch root files
      if (selectedCourse) {
        getFiles(selectedCourse.id.toString(), selectedBatch.id.toString(), null).then(data => debugSetFiles(data));
      }
    }
  }, [selectedBatch]);

  // Fetch Files (Lazy load for current folder)
  useEffect(() => {
    console.log("Fetch Files Effect Triggered. Auth User:", user ? "YES" : "NO", "Batch:", selectedBatch?.id);

    // ONLY fetch if we have a valid selection
    if (selectedBatch && selectedCourse) {
      const cId = selectedCourse.id.toString();
      const bId = selectedBatch.id.toString();

      // Pass currentFolderId to filter properly
      getFiles(cId, bId, currentFolderId)
        .then(async (data) => {
          // Debug: log any file objects that lack name information
          try {
            const missing = (Array.isArray(data) ? data : []).filter((f: any) => !f.fileName && !f.title && !f.displayName && !f.storagePath);
            if (missing.length > 0) {
              console.warn('Admin: files missing naming fields:', missing);
            }
          } catch (err) {
            console.error('Debug check failed', err);
          }
          console.log("Fetched files:", data.length);
          // If no files found for the specific folder, fall back to returning all batch files
          if (Array.isArray(data) && data.length === 0) {
            try {
              const all = await getFiles(cId, bId, 'ANY');
              console.log("Fallback: fetched all batch files:", all.length);
              setFiles(Array.isArray(all) ? enhanceFiles(all) : []); // still use setFiles for fallbacks
            } catch (e) {
              setFiles([]);
            }
          } else {
            debugSetFiles(data);
          }
          setLastFetchTime(new Date().toLocaleTimeString());
        })
        .catch(err => {
          console.error(err);
          toast({ title: "Fetch Error", description: err.message, variant: "destructive" });
        });
    }
  }, [selectedCourse, selectedBatch, user, currentFolderId]); // Keep user in deps to re-fetch on login

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
  const filteredFiles = files.filter(f => {
    const name = (f.displayName || f.title || f.fileName || "Untitled");
    return String(name).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedBatch) return;
    try {
      if (selectedBatch) {
        // Force refresh files too to ensure they are visible
        getFiles(selectedCourse.id.toString(), selectedBatch.id.toString(), currentFolderId).then(f => debugSetFiles(f));
      }
      await createFolder(selectedBatch.id, newFolderName, currentFolderId);
      // Refresh folders
      const data = await getFolders(selectedBatch.id);
      setFolders(Array.isArray(data) ? data : []);
      setShowNewFolderModal(false);
      setNewFolderName("");
      toast({ title: "Folder created", variant: "default" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to create folder", variant: "destructive" });
    }
  };

  // Confirm folder rename
  const confirmFolderRename = async () => {
    if (!folderRenameTarget || !folderRenameTarget.id) return;
    try {
      await updateFolder(folderRenameTarget.id, folderRenameValue);
      toast({ title: "Folder renamed", description: "Folder name updated." });
      setShowFolderRenameModal(false);
      // Refresh folders for current batch
      if (selectedBatch) {
        const data = await getFolders(selectedBatch.id);
        setFolders(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Rename Failed", description: (e as any).message || String(e), variant: "destructive" });
    }
  };

  const handleUploadComplete = async (url: string, fileType: string, fileName: string, storagePath?: string, size?: number, duration?: number | null) => {
    // Create a file record in the backend with the Firebase URL
    if (!selectedBatch || !selectedCourse) return;

    try {
      const cId = selectedCourse.id.toString();
      const bId = selectedBatch.id.toString();

      // Prefer the exact storagePath returned by the uploader; otherwise construct one.
      const finalStoragePath = storagePath || `courses/${cId}/batches/${bId}/${fileName}`;

      await saveFileMetadata({
        courseId: cId,
        batchId: bId,
        folderId: currentFolderId, // Save with current folder ID
        fileName: fileName,
        fileType: fileType,
        size: size,
        duration: duration ?? null,
        storagePath: finalStoragePath,
        downloadUrl: url,
        title: getDisplayName({ fileName, fileType, storagePath: finalStoragePath })
      });

      toast({ title: "File Uploaded", description: "Saved successfully." });
      setShowUploadModal(false);

      // Refresh files list
      const data = await getFiles(cId, bId, currentFolderId)
        .catch(e => { console.error(e); return []; });
      debugSetFiles(data);

    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to save file", variant: "destructive" });
    }
  };

  // Download helper that triggers browser download
  const handleDownload = (file: any) => {
    // If we have a downloadUrl, open it in a new tab; otherwise, try to construct a signed URL
    if (file.downloadUrl) {
      window.open(file.downloadUrl, "_blank");
    } else if (file.storagePath) {
      // Fallback: use client-side helper (will attempt getDownloadURL)
      downloadFileHelper(file.storagePath).catch((e) => {
        toast({ title: "Download Failed", description: e.message || String(e), variant: "destructive" });
      });
    } else {
      toast({ title: "Download Failed", description: "No URL available", variant: "destructive" });
    }
  };

  // Delete both storage object and metadata (asks user to confirm)
  const handleDelete = async (file: any) => {
    if (!confirm(`Delete "${file.displayName || file.title || file.fileName}"? This will remove the file and its metadata.`)) return;
    try {
      if (file.storagePath) await deleteStorageObject(file.storagePath);
      if (file.id) await deleteFileMetadata(file.id);
      toast({ title: "Deleted", description: "File removed." });
      // Refresh list
      const data = await getFiles(selectedCourse.id.toString(), selectedBatch.id.toString(), currentFolderId).catch(() => []);
      debugSetFiles(data);
    } catch (e) {
      console.error(e);
      toast({ title: "Delete Failed", description: (e as any).message || String(e), variant: "destructive" });
    }
  };

  // admin no longer supports renaming from UI; files display original filename

  // Helper to get a friendly display name for a file
  const getDisplayName = (file: any) => {
    if (!file) return "Untitled";
    // Prefer explicit title, then fileName, then raw.name, then last segment of storagePath
    const candidates = [file.title, file.fileName, file.name, file.raw?.fileName, file.raw?.name];
    for (const c of candidates) {
      if (c && String(c).trim() !== "") return String(c);
    }
    if (file.storagePath) {
      const parts = String(file.storagePath).split('/');
      let name = parts[parts.length - 1] || file.storagePath;
      // Strip common timestamp prefix like '1765771333111_' if present
      name = name.replace(/^\d+_/, '');
      try {
        name = decodeURIComponent(name);
      } catch (e) {
        // ignore decode errors
      }
      return name;
    }
    return "Untitled";
  };

  const confirmRename = async () => {
    if (!renameTarget || !renameTarget.id) return;
    try {
      await updateFileName(renameTarget.id, renameValue);
      toast({ title: "Renamed", description: "File metadata updated." });
      setShowRenameModal(false);
      // Refresh list
      const data = await getFiles(selectedCourse.id.toString(), selectedBatch.id.toString(), currentFolderId).catch(() => []);
      debugSetFiles(data);
    } catch (e) {
      console.error(e);
      toast({ title: "Rename Failed", description: (e as any).message || String(e), variant: "destructive" });
    }
  };

  // Confirm batch rename
  const confirmBatchRename = async () => {
    if (!batchRenameTarget || !batchRenameTarget.id || !selectedCourse) return;
    try {
      await updateBatch(selectedCourse.id, batchRenameTarget.id, { name: batchRenameValue });
      toast({ title: "Batch renamed", description: "Batch name updated." });
      setShowBatchRenameModal(false);
      const data = await getBatches(selectedCourse.id);
      setBatches(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast({ title: "Rename Failed", description: (e as any).message || String(e), variant: "destructive" });
    }
  };

  // Enhance file array with computed displayName so UI can rely on it
  const enhanceFiles = (arr: any[]) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(f => ({ ...f, displayName: getDisplayName(f) }));
  };

  // Debug helper: log raw and enhanced files before setting state
  const debugSetFiles = (raw: any[]) => {
    try {
      console.log("Admin: raw files sample:", Array.isArray(raw) ? raw.slice(0, 5) : raw);
      const enhanced = enhanceFiles(Array.isArray(raw) ? raw : []);
      console.log("Admin: enhanced files sample:", enhanced.slice(0, 5));
      setFiles(enhanced);
    } catch (err) {
      console.error("Admin: debugSetFiles failed", err);
      setFiles(enhanceFiles(raw));
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] gap-6">
      {/* Sidebar: Selection */}
      <div className="w-64 shrink-0 flex flex-col gap-6 border-r pr-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">1. Select Course</h2>
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
                <div key={batch.id} className="flex items-center gap-2">
                  <Button
                    variant={selectedBatch?.id === batch.id ? "secondary" : "ghost"}
                    className="w-full justify-start truncate"
                    onClick={() => setSelectedBatch(batch)}
                  >
                    {batch.name}
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" title="Rename batch" onClick={() => { setBatchRenameTarget(batch); setBatchRenameValue(batch.name); setShowBatchRenameModal(true); }}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete batch" onClick={async () => {
                      if (!selectedCourse) return;
                      if (!confirm(`Delete batch "${batch.name}"? This will remove the batch and its content.`)) return;
                      try {
                        await deleteBatch(selectedCourse.id, batch.id);
                        toast({ title: "Batch deleted", description: "Batch removed." });
                        const data = await getBatches(selectedCourse.id);
                        setBatches(Array.isArray(data) ? data : []);
                        // Clear selection if it was the deleted batch
                        if (selectedBatch?.id === batch.id) setSelectedBatch(null);
                      } catch (e) {
                        console.error(e);
                        toast({ title: "Delete Failed", description: (e as any).message || String(e), variant: "destructive" });
                      }
                    }}>
                      <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
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
                      onClick={() => handleBreadcrumbClick(index)}
                      className={`hover:bg-accent px-2 py-1 rounded transition-colors ${index === folderPath.length - 1 ? 'text-primary font-bold' : 'text-muted-foreground'}`}
                    >
                      {item.id === null ? <Home className="w-4 h-4" /> : item.name}
                    </button>
                  </div>
                ))}
                <div className={`px-2 py-1 rounded text-xs font-bold ${user ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user ? "DB Connected" : "Connecting..."}
                </div>
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
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4 px-1">Folders</h3>
                  <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "flex flex-col gap-2"}>
                    {filteredFolders.map(folder => (
                      <div
                        key={folder.id}
                        className={`group relative rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden ${viewMode === 'grid'
                            ? 'aspect-[4/3] flex flex-col p-4'
                            : 'flex items-center p-3 gap-4'
                          }`}
                        onDoubleClick={() => handleFolderClick(folder)}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            {/* Grid View Content */}
                            <div className="flex justify-between items-start">
                              <div className="p-2.5 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-500">
                                <Folder className="w-8 h-8 fill-current" />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setFolderRenameTarget(folder); setFolderRenameValue(folder.name); setShowFolderRenameModal(true); }}>
                                    <Edit2 className="w-4 h-4 mr-2" /> Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => {
                                    e.stopPropagation();
                                    const confirmDelete = async () => {
                                      if (!confirm(`Delete folder "${folder.name}"? This will remove the folder and its contents.`)) return;
                                      try {
                                        await deleteFolder(folder.id);
                                        toast({ title: "Folder deleted", description: "Folder removed." });
                                        if (selectedBatch) {
                                          const data = await getFolders(selectedBatch.id);
                                          setFolders(Array.isArray(data) ? data : []);
                                        }
                                      } catch (err) {
                                        console.error(err);
                                        toast({ title: "Delete Failed", description: "Could not delete folder.", variant: "destructive" });
                                      }
                                    };
                                    confirmDelete();
                                  }}>
                                    <Trash className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="mt-auto pt-4">
                              <h4 className="font-semibold text-sm truncate" title={folder.name}>{folder.name}</h4>
                              <p className="text-xs text-muted-foreground mt-1">Folder</p>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* List View Content */}
                            <div className="p-2 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-500 shrink-0">
                              <Folder className="w-5 h-5 fill-current" />
                            </div>
                            <span className="text-sm font-medium truncate flex-1">{folder.name}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setFolderRenameTarget(folder); setFolderRenameValue(folder.name); setShowFolderRenameModal(true); }}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => {
                                e.stopPropagation();
                                const confirmDelete = async () => {
                                  if (!confirm(`Delete folder "${folder.name}"?`)) return;
                                  try {
                                    await deleteFolder(folder.id);
                                    if (selectedBatch) { const data = await getFolders(selectedBatch.id); setFolders(Array.isArray(data) ? data : []); }
                                  } catch (err) { toast({ title: "Error", description: "Failed", variant: "destructive" }); }
                                };
                                confirmDelete();
                              }}>
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {filteredFiles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-semibold text-foreground">Files</h3>
                  </div>

                  <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" : "flex flex-col gap-2"}>
                    {filteredFiles.map(file => (
                      <div key={file.id} className={`group relative rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${viewMode === 'grid'
                          ? 'aspect-[4/3] flex flex-col p-4'
                          : 'flex items-center p-3 gap-4'
                        }`}>

                        {viewMode === 'grid' ? (
                          <>
                            {/* Grid View Content */}
                            <div className="flex justify-between items-start z-10">
                              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <FileText className="w-8 h-8" />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDownload(file)}>
                                    <Download className="w-4 h-4 mr-2" /> Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { setRenameTarget(file); setRenameValue(file.displayName || file.fileName || getDisplayName(file)); setShowRenameModal(true); }}>
                                    <Edit2 className="w-4 h-4 mr-2" /> Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(file)}>
                                    <Trash className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="mt-auto pt-4 relative z-0">
                              <h4 className="font-semibold text-sm truncate" title={file.displayName || file.fileName || getDisplayName(file)}>
                                {file.displayName || file.fileName || getDisplayName(file) || 'Untitled'}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'File'}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* List View Content */}
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate" title={file.displayName || getDisplayName(file)}>
                                {file.displayName || getDisplayName(file) || 'Untitled'}
                              </h4>
                              <p className="text-xs text-muted-foreground">{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : ''}</p>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(file)} title="Download">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setRenameTarget(file); setRenameValue(file.displayName || getDisplayName(file)); setShowRenameModal(true); }} title="Rename">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(file)} title="Delete">
                                <Trash className="w-4 h-4" />
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
                  <p>This folder is empty. (v2.Fix)</p>

                  <Button variant="link" onClick={() => setShowNewFolderModal(true)} className="mt-2">Create a new folder</Button>
                  {/* debug button removed */}
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
      {/* Rename Modal */}
      <Dialog open={showRenameModal} onOpenChange={setShowRenameModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>Update the file's display name (metadata only).</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input value={renameValue} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmRename()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameModal(false)}>Cancel</Button>
            <Button onClick={() => confirmRename()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Batch Rename Modal */}
      <Dialog open={showBatchRenameModal} onOpenChange={setShowBatchRenameModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Batch</DialogTitle>
            <DialogDescription>Update the batch name.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input value={batchRenameValue} onChange={e => setBatchRenameValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmBatchRename()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchRenameModal(false)}>Cancel</Button>
            <Button onClick={() => confirmBatchRename()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Folder Rename Modal */}
      <Dialog open={showFolderRenameModal} onOpenChange={setShowFolderRenameModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>Update the folder name.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input value={folderRenameValue} onChange={e => setFolderRenameValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmFolderRename()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFolderRenameModal(false)}>Cancel</Button>
            <Button onClick={() => confirmFolderRename()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename removed - admin shows original filename only */}
      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>Upload files to Firebase Storage</DialogDescription>
          </DialogHeader>
          <FileUpload onUploadComplete={handleUploadComplete} folderPath={`courses/${selectedCourse?.id}/batches/${selectedBatch?.id}`} />
        </DialogContent>
      </Dialog>
      {/* Debug footer removed */}
      {/* Raw Docs Debug Panel */}
      {/* debug panel removed */}
    </div>
  );
}
