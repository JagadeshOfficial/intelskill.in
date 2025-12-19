// frontend/src/lib/api-files.ts
import { db, storage } from "./firebase";
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

// COLLECTION NAME - CHANGED for Clean Slate
const FILES_COLLECTION = "learnflow_content";

export interface FileData {
  id?: string;
  courseId: string;
  batchId: string;
  folderId: number | null; // Added folderId
  fileName: string;
  title?: string; // optional display title
  fileType: string;
  storagePath: string;
  downloadUrl: string;
  size?: number; // bytes
  duration?: number | null; // seconds for video/audio
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
export const getFiles = async (courseId: string, batchId: string, folderId: number | null | 'ANY' = null) => {
  try {
    console.log(`Fetching files for Course: ${courseId}, Batch: ${batchId}, Folder: ${folderId}`);

    // NUCLEAR FIX: Fetch ALL content and filter in JS to bypass Firestore Index/Type gaps
    const q = query(collection(db, FILES_COLLECTION));

    const querySnapshot = await getDocs(q);
    const allFiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    // Normalize and log raw dump for debugging
    const normalized = allFiles.map((f: any) => {
      // Normalize ids to string for reliable comparisons
      const norm: any = { ...f };
      norm.courseId = norm.courseId != null ? String(norm.courseId) : null;
      norm.batchId = norm.batchId != null ? String(norm.batchId) : null;

      // Normalize folderId: accept numbers, numeric-strings, null, or 0 as root
      if (norm.folderId === undefined || norm.folderId === null) {
        norm.folderId = null;
      } else if (typeof norm.folderId === 'string') {
        const s = norm.folderId.trim().toLowerCase();
        if (s === '' || s === 'null' || s === 'root' || s === 'home') {
          norm.folderId = null;
        } else if (!isNaN(Number(s))) {
          norm.folderId = Number(s);
        } else {
          // keep the string as-is for debugging
          norm.folderId = norm.folderId;
        }
      }

      // Normalize createdAt to ISO string (Firestore Timestamp -> Date)
      if (norm.createdAt && typeof norm.createdAt.toDate === 'function') {
        norm.createdAtISO = norm.createdAt.toDate().toISOString();
      } else if (norm.createdAt instanceof Date) {
        norm.createdAtISO = norm.createdAt.toISOString();
      } else if (typeof norm.createdAt === 'number') {
        norm.createdAtISO = new Date(norm.createdAt).toISOString();
      } else {
        norm.createdAtISO = null;
      }

      // Accept several alternative field names for download URL and storage path
      norm.downloadUrl = norm.downloadUrl || norm.url || norm.downloadURL || norm.download_url || null;
      norm.storagePath = norm.storagePath || norm.storage_path || norm.path || null;
      norm.fileName = norm.fileName || norm.file_name || norm.name || norm.title || null;
      // Provide a display title
      norm.title = norm.title || norm.fileName || "Untitled File";

      return norm;
    });

    console.log("RAW FIRESTORE DUMP (normalized):", normalized);

    // Compare as strings for course/batch and normalized folderId handling
    let filteredFiles = normalized.filter((f: any) => {
      const cMatch = String(f.courseId) === String(courseId);
      const bMatch = String(f.batchId) === String(batchId);
      return cMatch && bMatch; // base filter by course+batch
    });

    // If caller asked for a specific folder, apply folder filtering. If folderId === 'ANY', skip folder filtering.
    if (folderId !== 'ANY') {
      filteredFiles = filteredFiles.filter((f: any) => {
        let fMatch = false;
        if (folderId === null) {
          // root: include files with null/0/undefined folderId
          fMatch = (f.folderId === null || f.folderId === 0 || f.folderId === undefined);
        } else {
          // folderId may be number or string - compare numeric if possible
          if (typeof f.folderId === 'number' && typeof folderId === 'number') {
            fMatch = f.folderId === folderId;
          } else {
            fMatch = String(f.folderId) === String(folderId);
          }
        }
        return fMatch;
      });
    }

    console.log(`[API] Returning ${filteredFiles.length} matches.`);

    // Helper to derive a clean display name from available fields
    const deriveDisplayName = (d: any) => {
      // prefer explicit title, then fileName, then last segment of storagePath
      let name = d.title || d.fileName || null;
      if (!name && d.storagePath) {
        const parts = String(d.storagePath).split('/');
        name = parts[parts.length - 1] || d.storagePath;
      }
      if (!name) return 'Untitled File';
      // strip numeric timestamp prefix like '1765771333111_'
      name = String(name).replace(/^\d+_/, '');
      try { name = decodeURIComponent(name); } catch (e) { }
      return name;
    };

    return filteredFiles.map((doc: any) => ({
      id: doc.id,
      title: doc.title || doc.fileName || "Untitled File",
      displayName: deriveDisplayName(doc),
      fileName: doc.fileName,
      fileType: doc.fileType,
      storagePath: doc.storagePath,
      downloadUrl: doc.downloadUrl || doc.url || doc.downloadUrl,
      createdAt: doc.createdAtISO || null,
      folderId: doc.folderId,
      raw: doc
    }));
  } catch (error) {
    console.error("Error fetching files:", error);
    throw error;
  }
};

// Debug helper: return raw normalized documents for a course+batch (no folder filtering)
export const getRawFiles = async (courseId: string, batchId: string) => {
  const q = query(collection(db, FILES_COLLECTION));
  const querySnapshot = await getDocs(q);
  const allFiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

  // reuse normalization logic above by calling getFiles with 'ANY'
  return getFiles(courseId, batchId, 'ANY');
}

// Delete a Firestore metadata document by id
export const deleteFileMetadata = async (id: string) => {
  try {
    const d = doc(db, FILES_COLLECTION, id);
    await deleteDoc(d);
  } catch (error) {
    console.error("Error deleting file metadata:", error);
    throw error;
  }
};

// Update file name/title in Firestore (rename metadata only)
export const updateFileName = async (id: string, newName: string) => {
  try {
    const d = doc(db, FILES_COLLECTION, id);
    await updateDoc(d, {
      fileName: newName,
      title: newName,
    });
  } catch (error) {
    console.error("Error updating file metadata:", error);
    throw error;
  }
};

// Delete an object from Firebase Storage given its storagePath
export const deleteStorageObject = async (storagePath: string) => {
  try {
    const sRef = ref(storage, storagePath);
    await deleteObject(sRef);
  } catch (error) {
    console.error("Error deleting storage object:", error);
    const e: any = error;
    const code = e?.code;
    const serverResponse = e?.serverResponse;
    throw Object.assign(new Error(serverResponse?.error?.message || e?.message || String(e)), { code, serverResponse, original: e });
  }
};