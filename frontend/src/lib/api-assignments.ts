const BASE_URL = "http://localhost:8081/api/assignments";

export async function getAssignments(creatorId?: string, courses?: string[]): Promise<any[]> {
    try {
        let url = BASE_URL;
        const params = new URLSearchParams();
        if (creatorId) params.append("creatorId", creatorId);
        if (courses && courses.length > 0) {
            courses.forEach(c => params.append("courses", c));
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const res = await fetch(url);
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error("Error fetching assignments:", error);
        return [];
    }
}

export async function createAssignment(assignment: any): Promise<any> {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment),
    });
    if (!res.ok) throw new Error("Failed to create assignment");
    return res.json();
}

export async function updateAssignment(id: string | number, assignment: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment),
    });
    if (!res.ok) throw new Error("Failed to update assignment");
    return res.json();
}

export async function deleteAssignment(id: string | number): Promise<any> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete assignment");
    if (res.status === 204 || res.status === 200) return { success: true };
    return res.json();
}
