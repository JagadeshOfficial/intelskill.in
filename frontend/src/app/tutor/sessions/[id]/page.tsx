
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Video, Mic, ScreenShare, PhoneOff, Send, Users, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

const participants = [
    { name: 'Alex Johnson', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { name: 'Maria Garcia', avatar: 'https://i.pravatar.cc/150?u=a042581f4e290267072' },
    { name: 'Sam Chen', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707e' },
]

export default function LiveSessionPage({ params }: { params: { id: string } }) {
    return (
        <div className="h-full flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Video/Screen Content */}
            <main className="lg:col-span-3 bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="text-center text-background/50">
                    <p>Screen Share or Main Video Feed</p>
                </div>
                 {/* Self Video Preview */}
                <div className="absolute bottom-4 right-4 h-32 w-48 bg-muted rounded-md border-2 border-primary">
                     <p className="text-xs text-muted-foreground p-2">Your Camera</p>
                </div>
            </main>

            {/* Sidebar */}
            <aside className="lg:col-span-1 flex flex-col gap-6">
                 {/* Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-headline">Session Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-around">
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                            <Mic className="h-6 w-6" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                            <Video className="h-6 w-6" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                            <ScreenShare className="h-6 w-6" />
                        </Button>
                         <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full">
                            <PhoneOff className="h-6 w-6" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Participants & Chat */}
                <Card className="flex-grow flex flex-col">
                    <CardHeader className="flex-row items-center justify-between p-4 border-b">
                         <div className="flex items-center gap-2">
                             <Users className="h-5 w-5"/>
                            <CardTitle className="text-md font-headline">Participants</CardTitle>
                         </div>
                        <Badge>{participants.length + 1} Online</Badge>
                    </CardHeader>
                    <ScrollArea className="flex-grow p-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="https://i.pravatar.cc/150?u=t02" alt="Kenji Tanaka" />
                                    <AvatarFallback>KT</AvatarFallback>
                                </Avatar>
                                <p className="font-semibold text-sm">Kenji Tanaka (You)</p>
                            </div>
                            {participants.map(p => (
                                <div key={p.name} className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={p.avatar} alt={p.name} />
                                        <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm">{p.name}</p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <CardHeader className="flex-row items-center gap-2 p-4 border-t">
                        <MessageSquare className="h-5 w-5"/>
                        <CardTitle className="text-md font-headline">Chat</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 border-t flex-grow">
                        <ScrollArea className="h-32">
                           {/* Chat messages would go here */}
                           <p className="text-xs text-muted-foreground text-center">Chat is enabled for this session.</p>
                        </ScrollArea>
                    </CardContent>
                     <div className="p-4 border-t bg-background">
                        <div className="relative">
                             <Input placeholder="Type a message..." className="pr-10" />
                             <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </div>
                    </div>
                </Card>
            </aside>
        </div>
    )
}
