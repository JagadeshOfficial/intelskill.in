import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp
} from "firebase/firestore";

const TESTS_COLLECTION = "tests";
const SUBMISSIONS_COLLECTION = "submissions";

// --- Tests Managment ---

export async function createTest(testData: any): Promise<any> {
    try {
        const docRef = await addDoc(collection(db, TESTS_COLLECTION), {
            ...testData,
            createdAt: Timestamp.now(),
            status: "Active"
        });
        return { id: docRef.id, ...testData };
    } catch (error) {
        console.error("Error creating test in Firestore:", error);
        throw error;
    }
}

export async function getTests(creatorId?: string, courses?: string[]): Promise<any[]> {
    try {
        // Build query based on filters if needed (simple fetch all for now for simplicity)
        const q = collection(db, TESTS_COLLECTION);
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching tests from Firestore:", error);
        return [];
    }
}

export async function getTestById(id: string): Promise<any> {
    try {
        const docRef = doc(db, TESTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching test details:", error);
        return null;
    }
}

export async function deleteTest(id: string): Promise<any> {
    try {
        await deleteDoc(doc(db, TESTS_COLLECTION, id));
        return { success: true };
    } catch (error) {
        console.error("Error deleting test:", error);
        throw error;
    }
}

export async function updateTest(id: string, updates: any): Promise<void> {
    try {
        const docRef = doc(db, TESTS_COLLECTION, id);
        await updateDoc(docRef, { ...updates, updatedAt: Timestamp.now() });
    } catch (error) {
        console.error("Error updating test:", error);
        throw error;
    }
}

// --- Submissions & Grading ---

export async function submitTest(testId: string, studentId: string, studentName: string, answers: any, questions: any[]): Promise<any> {
    try {
        let score = 0;
        let totalScore = 0;
        const resultDetails = {
            mcq: 0,
            coding: 0 // Coding usually needs manual grading, keeping 0 or marking as pending
        };

        // Simple Grading Logic
        questions.forEach(q => {
            if (q.type === 'MCQ') {
                totalScore += q.score;
                if (answers[q.id] === q.correctOption) {
                    score += q.score;
                    resultDetails.mcq += q.score;
                }
            } else if (q.type === 'CODING') {
                // For coding, we might save it as pending or give full marks for now
                // Let's assume manual review needed, but for 'auto' requests we mark submitted
                totalScore += q.score;
            }
        });

        const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
        const passed = percentage >= 70; // 70% passing criteria

        const submissionData = {
            testId,
            studentId,
            studentName,
            answers,
            score: percentage,
            rawScore: score,
            totalScore,
            resultDetails,
            status: passed ? 'Passed' : 'Failed',
            submittedAt: Timestamp.now()
        };

        const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submissionData);
        return { id: docRef.id, ...submissionData };
    } catch (error) {
        console.error("Error submitting test:", error);
        throw error;
    }
}

export async function getTestResults(testId: string): Promise<any[]> {
    try {
        const q = query(collection(db, SUBMISSIONS_COLLECTION), where("testId", "==", testId));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                submittedAt: (data.submittedAt as Timestamp).toDate().toISOString()
            };
        });
    } catch (error) {
        console.error("Error fetching results:", error);
        return [];
    }
}

export async function getStudentSubmissions(studentId: string): Promise<any[]> {
    try {
        const q = query(collection(db, SUBMISSIONS_COLLECTION), where("studentId", "==", studentId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Failed to fetch student submissions", error);
        return [];
    }
}
