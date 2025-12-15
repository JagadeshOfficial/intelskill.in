"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Folder, FileText, Upload, Plus, ChevronRight, Home, Grid, List, Search, MoreVertical, File, Edit2 } from "lucide-react";
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
          () => {},
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
                      onClick={() => handleBreadcrumbClick(index)}
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
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" /> File Upload
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleUploadFile}
                />
              </div>
            </div>

            {/* Drive Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Folders */}
              {filteredFolders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Folders</h3>
                  <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" : "flex flex-col gap-1"}>
                    {filteredFolders.map(folder => (
                      <div
                        key={folder.id}
                        className={`group flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer transition-all hover:bg-accent/50 hover:shadow-md ${viewMode === 'grid' ? 'flex-col justify-center text-center py-6 h-32' : ''}`}
                        onDoubleClick={() => handleFolderClick(folder)}
                      >
                        <div className={`p-2 rounded-full bg-yellow-100 text-yellow-600 ${viewMode === 'list' && 'shrink-0'}`}>
                          <Folder className={viewMode === 'grid' ? "w-8 h-8 fill-current" : "w-5 h-5 fill-current"} />
                        </div>
                        <div className="flex items-center w-full justify-between">
                          <span className="text-sm font-medium truncate">{folder.name}</span>
                          <div className="flex items-center gap-1 ml-3">
                            <Button variant="ghost" size="icon" title="Rename folder" onClick={() => { setFolderRenameTarget(folder); setFolderRenameValue(folder.name); setShowFolderRenameModal(true); }}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {filteredFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Files</h3>

                  <div className={viewMode === 'grid' ? 'file-grid' : 'flex flex-col gap-1'}>
                    {filteredFiles.map(file => (
                      <div key={file.id} className={`file-card ${viewMode === 'grid' ? 'grid' : 'list'}`}>
                        <div className="file-icon">
                          <FileText className={viewMode === 'grid' ? "w-8 h-8" : "w-5 h-5"} />
                        </div>

                        {viewMode === 'grid' ? (
                          <div className="flex flex-col items-center gap-2">
                            <span className="file-name-badge" aria-label={file.title || file.fileName || file.name} title={file.title || file.fileName || file.name}>
                              {file.title || file.fileName || file.name || 'Untitled'}
                            </span>
                            <div className="file-actions">
                              <Button variant="ghost" size="icon" onClick={() => { setFileRenameTarget(file); setFileRenameValue(file.title || file.fileName || file.name || ''); setShowFileRenameModal(true); }} title="Rename">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <div className="text-left w-full overflow-hidden pr-3">
                              <span className="file-name-inline" aria-label={file.title || file.fileName || file.name} title={file.title || file.fileName || file.name}>
                                {file.title || file.fileName || file.name || 'Untitled'}
                              </span>
                              <p className="text-xs text-muted-foreground mt-0.5">{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : ''}</p>
                            </div>
                            <div className="file-actions">
                              <Button variant="ghost" size="icon" onClick={() => { setFileRenameTarget(file); setFileRenameValue(file.title || file.fileName || file.name || ''); setShowFileRenameModal(true); }} title="Rename">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
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
    </div>
  );
}
