"use client";

import { useState } from "react";
import { storage, auth } from "@/lib/firebase"; // Ensure auth is imported
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { signInAnonymously } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

interface FileUploadProps {
    // Now also return the actual storagePath used so callers can persist the exact path
    onUploadComplete: (url: string, fileType: string, fileName: string, storagePath: string, size?: number, duration?: number | null) => void;
    folderPath?: string; // Optional folder path in storage
}

export function FileUpload({ onUploadComplete, folderPath = "uploads" }: FileUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);

        // Ensure auth before upload
        if (!auth.currentUser) {
            try {
                await signInAnonymously(auth);
                console.log("Signed in anonymously for upload");
            } catch (e) {
                console.error("Auth failed for upload", e);
                setUploading(false);
                toast({ title: "Auth Error", description: "Could not sign in.", variant: "destructive" });
                return;
            }
        }

    const storagePath = `${folderPath}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
            },
            (error) => {
                console.error("Upload failed", error);
                // Try to show richer error info when available
                const code = (error && error.code) ? error.code : undefined;
                const serverResponse = (error && (error as any).serverResponse) ? (error as any).serverResponse : undefined;
                // serverResponse can be string or object
                const serverMsg = typeof serverResponse === 'string' ? serverResponse : (serverResponse?.error?.message || undefined);
                toast({
                    title: "Upload Failed",
                    description: serverMsg || (error as any).message || String(error),
                    variant: "destructive",
                });
                // Also keep a verbose console log for debugging
                console.error("Upload error details:", { code, serverResponse, error });
                setUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    // Compute size
                    const size = file.size;
                    // If it's a video/audio, attempt to read duration
                    let duration = null;
                    if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
                        try {
                            duration = await new Promise<number | null>((resolve) => {
                                const url = URL.createObjectURL(file);
                                const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
                                media.preload = 'metadata';
                                media.src = url;
                                media.onloadedmetadata = () => {
                                    URL.revokeObjectURL(url);
                                    resolve(media.duration || null);
                                };
                                media.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
                            });
                        } catch (e) {
                            duration = null;
                        }
                    }

                    onUploadComplete(downloadURL, file.type, file.name, storagePath, size, duration);
                    setUploading(false);
                    setFile(null);
                    setProgress(0);
                    toast({
                        title: "Upload Successful",
                        description: "File has been uploaded successfully.",
                    });
                });
            }
        );
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg shadow-sm">
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,video/*,application/pdf"
                />
            </div>

            {progress > 0 && <Progress value={progress} className="w-full" />}

            <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
                {uploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading... {Math.round(progress)}%
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                    </>
                )}
            </Button>
        </div>
    );
}
