const API_BASE = "http://localhost:8081/api/submissions";

export async function getSubmissions(): Promise<any[]> {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Error fetching submissions:", error);
        return [];
    }
}

export async function getStudentSubmissions(email: string): Promise<any[]> {
    try {
        const res = await fetch(`${API_BASE}/student/${email}`);
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Error fetching student submissions:", error);
        return [];
    }
}

export async function createSubmission(submission: any): Promise<any> {
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
    });
    if (!res.ok) throw new Error("Failed to create submission");
    return res.json();
}

export async function updateSubmission(id: string | number, submission: any): Promise<any> {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
    });
    if (!res.ok) throw new Error("Failed to update submission");
    return res.json();
}

export async function deleteSubmission(id: string | number): Promise<any> {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete submission");
    if (res.status === 204 || res.status === 200) return { success: true };
    return res.json();
}
