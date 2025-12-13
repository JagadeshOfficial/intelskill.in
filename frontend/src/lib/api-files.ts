// frontend/src/lib/api-files.ts
import { db, storage } from "./firebase";
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// COLLECTION NAME - CHANGED for Clean Slate
const FILES_COLLECTION = "learnflow_content";

export interface FileData {
  id?: string;
  courseId: string;
  batchId: string;
  folderId: number | null; // Added folderId
  fileName: string;
  fileType: string;
  storagePath: string;
  downloadUrl: string;
  createdAt: any;
}

// Upload file to Firebase Storage
export const uploadFile = async (file: File, path: string, onProgress: (progress: number) => void): Promise<string> => {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

// Save file metadata to Firestore
export const saveFileMetadata = async (metadata: Omit<FileData, "createdAt">) => {
  try {
    await addDoc(collection(db, FILES_COLLECTION), {
      ...metadata,
      folderId: metadata.folderId ?? null, // Handle 0 correctly
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error saving file metadata:", error);
    throw error;
  }
};

// Get files from Firestore (Filtered by Course, Batch, AND Folder)
export const getFiles = async (courseId: string, batchId: string, folderId: number | null = null) => {
  try {
    console.log(`Fetching files for Course: ${courseId}, Batch: ${batchId}, Folder: ${folderId}`);

    // NUCLEAR FIX: Fetch ALL content and filter in JS to bypass Firestore Index/Type gaps
    const q = query(collection(db, FILES_COLLECTION));

    const querySnapshot = await getDocs(q);
    const allFiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    console.log("RAW FIRESTORE DUMP:", allFiles);

    // Filter in memory (Loose equality handles String/Number mismatches)
    // Filter in memory (Loose equality handles String/Number mismatches)
    const filteredFiles = allFiles.filter(f => {
      const cMatch = f.courseId == courseId;
      const bMatch = f.batchId == batchId;
      const fMatch = folderId === null
        ? (!f.folderId || f.folderId == 0) // Treat null/undefined/0 as root
        : (f.folderId == folderId);

      if (!cMatch || !bMatch || !fMatch) {
        return false;
      }
      return true;
    });

    console.log(`[API] Returning ${filteredFiles.length} matches.`);

    return filteredFiles.map((doc) => ({
      ...doc,
      title: doc.fileName || doc.title || "Untitled File",
      url: doc.downloadUrl
    }));
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};