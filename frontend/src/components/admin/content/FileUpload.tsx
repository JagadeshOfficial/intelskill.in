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
    onUploadComplete: (url: string, fileType: string, fileName: string) => void;
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

        const storageRef = ref(storage, `${folderPath}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progress);
            },
            (error) => {
                console.error("Upload failed", error);
                toast({
                    title: "Upload Failed",
                    description: error.message,
                    variant: "destructive",
                });
                setUploading(false);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    onUploadComplete(downloadURL, file.type, file.name);
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
