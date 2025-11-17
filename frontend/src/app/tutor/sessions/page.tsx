
'use client'

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Video, PlusCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScheduleSessionDialog } from "./components/schedule-session-dialog";
import { tutorCourses } from "../content/data";

const initialSessions = [
    { 
        id: 'S001', 
        title: 'Live Q&A: MERN Stack', 
        date: '2023-11-05', 
        time: '4:00 PM EST',
        status: 'Upcoming',
        courseTitle: 'MERN Stack Mastery',
        batchName: 'Batch 1 (Morning)'
    },
    { 
        id: 'S002', 
        title: 'Code Review: Python Projects', 
        date: '2023-10-28', 
        time: '2:00 PM EST',
        status: 'Completed',
        courseTitle: 'Python for Data Analytics',
        batchName: 'Batch A'
    },
];

export interface Session {
    id: string;
    title: string;
    date: string;
    time: string;
    status: 'Upcoming' | 'Completed';
    courseTitle: string;
    batchName: string;
}

export default function TutorSessionsPage() {
    const [sessions, setSessions] = useState<Session[]>(initialSessions);

    const handleAddSession = (newSessionData: Omit<Session, 'id' | 'status'>) => {
        const newSession: Session = {
            ...newSessionData,
            id: `S${(sessions.length + 1).toString().padStart(3, '0')}`,
            status: 'Upcoming'
        };
        setSessions(prevSessions => [...prevSessions, newSession].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    };

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tighter">Session Scheduling</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Host live video/audio sessions with your students.
          </p>
        </div>
        <ScheduleSessionDialog courses={tutorCourses} onAddSession={handleAddSession}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Schedule New Session
          </Button>
        </ScheduleSessionDialog>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessions.map(session => (
            <Card key={session.id}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                         <CardTitle className="font-headline">{session.title}</CardTitle>
                         <Badge variant={session.status === 'Upcoming' ? 'default' : 'secondary'}>
                            {session.status}
                        </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-2 pt-2">
                        <Users className="h-4 w-4" />
                        {session.courseTitle} - {session.batchName}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        {session.date} at {session.time}
                    </div>
                </CardContent>
                <CardFooter>
                    {session.status === 'Upcoming' && (
                         <Button asChild>
                            <Link href={`/tutor/sessions/${session.id}`}>
                                <Video className="mr-2 h-4 w-4" />
                                Start Session
                            </Link>
                        </Button>
                    )}
                     {session.status === 'Completed' && (
                         <Button variant="outline">
                            View Recording
                        </Button>
                    )}
                </CardFooter>
            </Card>
        ))}
      </main>
    </div>
  );
}
