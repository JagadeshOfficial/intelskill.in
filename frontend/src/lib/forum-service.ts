import { db } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    query,
    orderBy,
    limit,
    Timestamp,
    where,
    updateDoc,
    increment
} from 'firebase/firestore';

export interface ForumThread {
    id?: string;
    title: string;
    content: string;
    author: {
        uid: string;
        name: string;
        avatar?: string;
        role?: string;
    };
    createdAt: Date;
    tags: string[];
    likes: number;
    views: number;
    repliesCount: number;
}

const THREADS_COLLECTION = 'forum_threads';

// --- Forum Backend Logic ---

/**
 * Creates a new Forum Post/Thread in Firestore
 */
export const createThread = async (threadData: Omit<ForumThread, 'id' | 'createdAt' | 'likes' | 'views' | 'repliesCount'>) => {
    try {
        const docRef = await addDoc(collection(db, THREADS_COLLECTION), {
            ...threadData,
            createdAt: Timestamp.now(),
            likes: 0,
            views: 0,
            repliesCount: 0
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating thread:", error);
        throw error;
    }
};

/**
 * Fetches all threads, ordered by newest first
 */
export const getThreads = async () => {
    try {
        const q = query(collection(db, THREADS_COLLECTION), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Convert Firestore Timestamp to JS Date
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
            };
        }) as ForumThread[];
    } catch (error) {
        console.error("Error fetching threads:", error);
        return [];
    }
};

/**
 * Fetches a single thread and increments its view count
 */
export const getThreadById = async (id: string) => {
    try {
        const docRef = doc(db, THREADS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Background update: Increment view count
            updateDoc(docRef, { views: increment(1) }).catch(e => console.error("Metrics update failed", e));

            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
            } as ForumThread;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching thread:", error);
        return null;
    }
};
