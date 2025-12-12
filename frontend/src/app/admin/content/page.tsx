"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Folder, FileText, Upload, Plus, ChevronRight, Home, Grid, List, Search } from "lucide-react";
import { getBatches } from "@/lib/api-courses";
import { getFolders, createFolder } from "@/lib/api-folders";
import { getFiles, uploadFile } from "@/lib/api-files";
import { useToast } from "@/hooks/use-toast";

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

  // Modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch Files (Lazy load for current folder)
  useEffect(() => {
    if (selectedBatch) {
      if (currentFolderId) {
        getFiles(currentFolderId).then((data) => setFiles(Array.isArray(data) ? data : []));
      } else {
        setFiles([]); // Clear files at root for now
      }
    }
  }, [selectedBatch, currentFolderId]);

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
  const filteredFiles = files.filter(f => f.data?.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) || f.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedBatch) return;
    try {
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

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBatch) return;

    try {
      // Need courseId (from selectedCourse)
      await uploadFile(file, selectedCourse.id.toString(), currentFolderId || undefined);
      // Refresh files
      if (currentFolderId) {
        const data = await getFiles(currentFolderId);
        setFiles(Array.isArray(data) ? data : []);
      }
      setShowUploadModal(false);
      toast({ title: "File uploaded", variant: "default" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
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
                        <span className="text-sm font-medium truncate w-full">{folder.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {filteredFiles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Files</h3>
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
    </div>
  );
}
