"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AuthAvatar from "@/components/layout/auth-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, Send, Smile, Paperclip } from "lucide-react";
import { type Conversation, type Message } from "../data";


interface ChatLayoutProps {
    conversations: Conversation[];
    messages: Message[] | undefined;
    selectedConversation: Conversation;
    onConversationSelect: (conversation: Conversation) => void;
    currentUserId: string;
}

export function ChatLayout({ conversations, messages, selectedConversation, onConversationSelect, currentUserId }: ChatLayoutProps) {
    return (
        <Card className="h-full flex flex-col">
            <CardContent className="p-0 flex-grow grid grid-cols-[300px_1fr]">
                {/* Conversation List */}
                <div className="border-r flex flex-col">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search messages..." className="pl-9" />
                        </div>
                    </div>
                    <ScrollArea className="flex-grow">
                        {conversations.map(convo => (
                            <div
                                key={convo.id}
                                onClick={() => onConversationSelect(convo)}
                                className={cn(
                                    "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 border-b",
                                    selectedConversation.id === convo.id && "bg-muted"
                                )}
                            >
                                <div className="relative">
                                                                        <Avatar>
                                                                                <>
                                                                                    <AuthAvatar src={convo.avatar} alt={convo.name} />
                                                                                    <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                                                                                </>
                                                                        </Avatar>
                                    {convo.status === 'online' && (
                                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold">{convo.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {convo.lastMessage}
                                    </p>
                                </div>
                                <span className="text-xs text-muted-foreground">{convo.lastMessageTime}</span>
                            </div>
                        ))}
                    </ScrollArea>
                </div>

                {/* Message Window */}
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b flex items-center gap-3">
                         <div className="relative">
                                                         <Avatar>
                                                                <>
                                                                    <AuthAvatar src={selectedConversation.avatar} alt={selectedConversation.name} />
                                                                    <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                                                                </>
                                                        </Avatar>
                             {selectedConversation.status === 'online' && (
                                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                            )}
                         </div>
                        <h2 className="text-lg font-semibold font-headline">{selectedConversation.name}</h2>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-grow p-4 space-y-4 bg-muted/20">
                        {messages?.map(msg => (
                             <div key={msg.id} className={cn("flex", msg.authorId === currentUserId ? "justify-end" : "justify-start")}>
                                <div className="flex items-end gap-2 max-w-md">
                                     {msg.authorId !== currentUserId && (
                                                                                 <Avatar className="h-8 w-8">
                                                                                        <>
                                                                                            <AuthAvatar src={msg.authorAvatar} alt={msg.authorName} />
                                                                                            <AvatarFallback>{msg.authorName.charAt(0)}</AvatarFallback>
                                                                                        </>
                                                                                </Avatar>
                                     )}
                                     <div className={cn(
                                        "p-3 rounded-lg max-w-xs sm:max-w-md",
                                        msg.authorId === currentUserId ? "bg-primary text-primary-foreground" : "bg-background shadow"
                                     )}>
                                        <p className="text-sm">{msg.content}</p>
                                    </div>
                                     {msg.authorId === currentUserId && (
                                                                                 <Avatar className="h-8 w-8">
                                                                                        <>
                                                                                            <AuthAvatar src={msg.authorAvatar} alt={msg.authorName} />
                                                                                            <AvatarFallback>{msg.authorName.charAt(0)}</AvatarFallback>
                                                                                        </>
                                                                                </Avatar>
                                     )}
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                    
                    {/* Input */}
                    <div className="p-4 border-t bg-background">
                        <div className="relative">
                             <Input placeholder="Type a message..." className="pr-24" />
                             <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                                    <span className="sr-only">Attach file</span>
                                </Button>
                                 <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Smile className="h-5 w-5 text-muted-foreground" />
                                    <span className="sr-only">Add emoji</span>
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8">
                                    <Send className="h-5 w-5" />
                                    <span className="sr-only">Send</span>
                                </Button>
                             </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
