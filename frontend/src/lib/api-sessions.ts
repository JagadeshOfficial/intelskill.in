export type Session = {
    id: number
    title: string
    description: string
    course: {
        id: number
        title: string
    }
    batch: {
        id: number
        name: string
    }
    tutor: {
        id: number
        firstName: string
        lastName: string
        email: string
    }
    startTime: string
    endTime: string
    meetingLink: string
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
}

export type CreateSessionData = {
    title: string
    description: string
    courseId: number
    batchId: number
    tutorId: number
    startTime: string
    endTime: string
    meetingLink: string
}

const API_BASE_URL = 'http://localhost:8081/api/v1/sessions';

export const getSessions = async (): Promise<Session[]> => {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
}

export const getSessionsForTutor = async (tutorId: number): Promise<Session[]> => {
    const res = await fetch(`${API_BASE_URL}/tutor/${tutorId}`);
    if (!res.ok) throw new Error('Failed to fetch tutor sessions');
    return res.json();
}

export const getSessionsForStudent = async (studentId: number): Promise<Session[]> => {
    const res = await fetch(`${API_BASE_URL}/student/${studentId}`);
    if (!res.ok) throw new Error('Failed to fetch student sessions');
    return res.json();
}

export const createSession = async (sessionData: CreateSessionData): Promise<Session> => {
    const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to create session');
    }
    return data.session;
}

export const deleteSession = async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete session');
    }
}
