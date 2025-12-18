"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Folder, FileText, Upload, Plus, ChevronRight, Home, Grid, List, Search, Download, Trash, MoreHorizontal, Edit2, Play, Image as ImageIcon, File, X } from "lucide-react";
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

  // File Preview State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any | null>(null);

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

  const handleFileClick = (file: any) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
  };

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
                      // Optimistic confirmation
                      if (!confirm(`Delete batch "${batch.name}"? This will remove the batch and its content.`)) return;
                      try {
                        const res = await deleteBatch(selectedCourse.id, batch.id);
                        if (res && res.success === false) {
                          throw new Error(res.message || "Failed to delete batch");
                        }
                        toast({ title: "Batch deleted", description: "Batch removed successfully." });
                        const data = await getBatches(selectedCourse.id);
                        setBatches(Array.isArray(data) ? data : []);
                        // Clear selection if it was the deleted batch
                        if (selectedBatch?.id === batch.id) setSelectedBatch(null);
                      } catch (e: any) {
                        console.error(e);
                        toast({ title: "Delete Failed", description: e.message || String(e), variant: "destructive" });
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
                        onDoubleClick={() => handleFolderClick(folder)}
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

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-8" onClick={(e) => { e.stopPropagation(); setFolderRenameTarget(folder); setFolderRenameValue(folder.name); setShowFolderRenameModal(true); }}>
                                <Edit2 className="w-4 h-4 mr-2" /> Rename
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={(e) => {
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

              {/* Files - Only visible when inside a folder */}
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
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameTarget(file); setRenameValue(file.displayName || file.fileName || getDisplayName(file)); setShowRenameModal(true); }}>
                                  <Edit2 className="w-4 h-4 mr-2" /> Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(file); }}>
                                  <Trash className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}

                        {viewMode === 'grid' ? (
                          <>
                            {/* Grid View Content */}
                            {/* Preview Area - Mimic Google Drive/OS Thumbnail */}
                            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center relative overflow-hidden group-hover:bg-slate-100 dark:group-hover:bg-slate-900 transition-colors">
                              {/* If we had real thumbnails, they'd go here. For now, use a large, nice icon */}
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

                            {/* Footer Area - Filename & Icon */}
                            <div className="h-14 flex items-center gap-3 px-3 bg-card border-t z-10 relative">
                              <div className="p-1.5 rounded-full bg-blue-50 text-blue-600 shrink-0">
                                {(file.fileType?.includes('video') || file.fileName?.match(/\.(mp4|webm|mov)$/i)) ? <Play size={14} className="fill-current" /> : <FileText size={14} />}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-medium text-sm truncate text-foreground/90" title={file.displayName || file.fileName || getDisplayName(file)}>
                                  {file.displayName || file.fileName || getDisplayName(file) || 'Untitled'}
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
                              <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors cursor-pointer hover:underline" onClick={() => handleFileClick(file)} title={file.displayName || getDisplayName(file)}>
                                {file.displayName || getDisplayName(file) || 'Untitled'}
                              </h4>
                            </div>

                            <div className="mr-8 text-xs text-muted-foreground w-24 text-right">
                              {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : '--'}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDownload(file); }}>
                                <Download className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setRenameTarget(file); setRenameValue(file.displayName || getDisplayName(file)); setShowRenameModal(true); }}>
                                    <Edit2 className="w-4 h-4 mr-2" /> Rename
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(file); }}>
                                    <Trash className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                <h3 className="font-semibold text-sm">{previewFile?.displayName || previewFile?.fileName || 'File Preview'}</h3>
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
    </div>
  );
}
