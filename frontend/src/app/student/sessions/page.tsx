
'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Video, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const sessions = [
    {
        id: "S001",
        title: "Live Q&A: MERN Stack",
        date: "2023-11-05",
        time: "4:00 PM EST",
        status: "Upcoming",
        tutor: "Dr. Evelyn Reed"
    },
    {
        id: "S002",
        title: "Code Review: Python Projects",
        date: "2023-10-28",
        time: "2:00 PM EST",
        status: "Completed",
        tutor: "Kenji Tanaka"
    },
    {
        id: "S003",
        title: "Intro to Django",
        date: "2023-10-21",
        time: "11:00 AM EST",
        status: "Completed",
        tutor: "Kenji Tanaka"
    },
];

export default function StudentSessionsPage() {
    return (
        <div>
            <header className="mb-8">
                <h1 className="text-4xl font-bold font-headline tracking-tighter">Live Sessions</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Join live sessions with tutors or catch up on recordings.
                </p>
            </header>
            <main className="space-y-6">
                {sessions.map(session => (
                    <Card key={session.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="font-headline">{session.title}</CardTitle>
                                <Badge variant={session.status === 'Upcoming' ? 'default' : 'secondary'}>
                                    {session.status}
                                </Badge>
                            </div>
                            <CardDescription>With {session.tutor}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {session.date} at {session.time}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            {session.status === 'Upcoming' && (
                                <Button>
                                    <Video className="mr-2 h-4 w-4" />
                                    Join Session
                                </Button>
                            )}
                            {session.status === 'Completed' && (
                                <>
                                <Button variant="outline">
                                    <Video className="mr-2 h-4 w-4" />
                                    Watch Recording
                                </Button>
                                 <Button variant="secondary">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Notes
                                </Button>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </main>
        </div>
    );
}
