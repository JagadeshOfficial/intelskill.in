"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Folder, FileText, Upload, Plus, ChevronRight, Home, Grid, List, Search } from "lucide-react";
import { getBatches } from "@/lib/api-courses";
import { getFolders, createFolder } from "@/lib/api-folders";
import { getFiles, uploadFile, saveFileMetadata } from "@/lib/api-files";
import { useToast } from "@/hooks/use-toast";

import { FileUpload } from "@/components/admin/content/FileUpload";
import { auth } from "@/lib/firebase";
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";

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

  // Modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

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
        getFiles(selectedCourse.id.toString(), selectedBatch.id.toString(), null).then(data => setFiles(data));
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
        .then((data) => {
          console.log("Fetched files:", data.length);
          setFiles(Array.isArray(data) ? data : []);
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
    const name = f.title || f.fileName || "Untitled";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedBatch) return;
    try {
      if (selectedBatch) {
        // Force refresh files too to ensure they are visible
        getFiles(selectedCourse.id.toString(), selectedBatch.id.toString(), currentFolderId).then(f => setFiles(f));
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

  const handleUploadComplete = async (url: string, fileType: string, fileName: string) => {
    // Create a file record in the backend with the Firebase URL
    if (!selectedBatch || !selectedCourse) return;

    try {
      const cId = selectedCourse.id.toString();
      const bId = selectedBatch.id.toString();
      const storagePath = `courses/${cId}/batches/${bId}/${fileName}`;

      await saveFileMetadata({
        courseId: cId,
        batchId: bId,
        folderId: currentFolderId, // Save with current folder ID
        fileName: fileName,
        fileType: fileType,
        storagePath: storagePath,
        downloadUrl: url
      });

      toast({ title: "File Uploaded", description: "Saved successfully." });
      setShowUploadModal(false);

      // Refresh files list
      const data = await getFiles(cId, bId, currentFolderId)
        .catch(e => { console.error(e); return []; });
      setFiles(Array.isArray(data) ? data : []);

    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to save file", variant: "destructive" });
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
                        <span className="text-sm font-medium truncate w-full">{folder.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {filteredFiles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Files</h3>
                  </div>
                  <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" : "flex flex-col gap-1"}>
                    {filteredFiles.map(file => (
                      <div
                        key={file.id}
                        className={`group flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer transition-all hover:bg-accent/50 hover:shadow-md ${viewMode === 'grid' ? 'flex-col justify-center text-center py-6 h-32' : ''}`}
                      >
                        <div className={`p-2 rounded-full bg-blue-100 text-blue-600 ${viewMode === 'list' && 'shrink-0'}`}>
                          <FileText className={viewMode === 'grid' ? "w-8 h-8" : "w-5 h-5"} />
                        </div>
                        <div className="text-left w-full overflow-hidden">
                          <p className={`text-sm font-medium truncate ${viewMode === 'grid' && 'text-center'}`}>{file.title || file.name || "Untitled"}</p>
                          {viewMode === 'list' && <p className="text-xs text-muted-foreground mt-0.5">{new Date(file.createdAt).toLocaleDateString()}</p>}
                        </div>
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
                  <Button variant="outline" size="sm" className="mt-4 border-dashed" onClick={async () => {
                    try {
                      const { collection, addDoc } = await import("firebase/firestore");
                      const { db } = await import("@/lib/firebase");
                      await addDoc(collection(db, "learnflow_content"), {
                        courseId: selectedCourse.id.toString(),
                        batchId: selectedBatch.id.toString(),
                        folderId: currentFolderId,
                        fileName: "Connectivity_Test_File",
                        fileType: "debug",
                        storagePath: "debug",
                        downloadUrl: "#",
                        createdAt: new Date()
                      });
                      alert("Test File Written! The connection IS working. The list should update.");
                      // Trigger refresh
                      setCurrentFolderId(currentFolderId);
                    } catch (e: any) {
                      alert("Connection Failed: " + e.message);
                    }
                  }}>
                    Diagnose: Write Test File
                  </Button>
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
      {/* Debug Panel - Toggle with Ctrl+Shift+D or always visible for now */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-xs font-mono z-50 overflow-auto max-h-32">
        <div className="flex gap-4">
          <div>
            <strong>Context:</strong><br />
            CourseID: {selectedCourse?.id ?? "None"} (Type: {typeof selectedCourse?.id})<br />
            BatchID: {selectedBatch?.id ?? "None"} (Type: {typeof selectedBatch?.id})<br />
            FolderID: {currentFolderId ?? "Root(null)"} (Type: {typeof currentFolderId})<br />
            User: {user ? "Logged In" : "Guest"}<br />
            Last Fetch: {lastFetchTime}<br />
            Files Loaded: {files.length}
          </div>
          <div>
            <strong>Loaded Files:</strong><br />
            {files.length === 0 ? "No files loaded from DB" : files.slice(0, 5).map(f => (
              <div key={f.id} className="whitespace-nowrap">{f.fileName}</div>
            ))}
          </div>
          <div className="ml-auto">
            <Button variant="secondary" size="sm" onClick={() => {
              // Force Reload
              window.location.reload();
            }}>Hard Reload</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
