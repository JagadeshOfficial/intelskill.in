"use client";

import { useState, useEffect, useRef } from "react";
import {
    Search, Send, MoreHorizontal, Phone, Video, Paperclip, Smile,
    ArrowLeft, Bell, MessageSquare, Users, FileText,
    Settings, Bold, Italic, Underline, List, Type,
    AtSign, CheckCircle, AlertTriangle, Filter, Check, Clock, X,
    Mic, Pin, Star, Trash, Edit2, Reply, Lock, ThumbsUp, Heart, Laugh,
    Plus, UserPlus, Share2, CalendarPlus, Link as LinkIcon, Briefcase,
    Hash, ChevronDown, ChevronRight, Calendar as CalendarIcon, Clock as ClockIcon,
    Folder, Download, Upload, Cloud, HardDrive, File, Image as ImageIcon, Music, Video as VideoIcon
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"; // Importing specific collapsible parts if available, otherwise utilizing state

// --- Types ---
type ActivityType = 'mention' | 'reply' | 'alert' | 'task' | 'calendar' | 'file' | 'status';
type MessageType = 'text' | 'image' | 'file' | 'voice' | 'meeting';

interface Activity {
    id: number;
    user: string;
    avatar?: string;
    action: string;
    context: string;
    time: string;
    timestamp: Date;
    read: boolean;
    type: ActivityType;
}

interface Message {
    id: number;
    senderId: number | string;
    text: string;
    time: string;
    status: 'sent' | 'delivered' | 'read';
    reactions: Record<string, number>;
    isEdited?: boolean;
    replyTo?: number;
    type?: MessageType;
    fileUrl?: string;
    threadCount?: number;
    pinned?: boolean;
    starred?: boolean;
}

interface Contact {
    id: number | string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'dnd' | 'busy';
    lastMessage: string;
    time: string;
    unread: number;
    activity: string;
    isGroup?: boolean;
    isChannel?: boolean;
    teamName?: string;
}

interface Team {
    id: string;
    name: string;
    channels: string[];
}

// --- Mock Data ---
const INITIAL_CONTACTS: Contact[] = [
    { id: 1, name: "Alex Johnson", avatar: "https://i.pravatar.cc/150?u=1", status: "dnd", lastMessage: "Can we sync on the API spec?", time: "10:30 AM", unread: 2, activity: "Presentation" },
    { id: 2, name: "Maria Garcia", avatar: "https://i.pravatar.cc/150?u=2", status: "offline", lastMessage: "Thanks for the update.", time: "Yesterday", unread: 0, activity: "" },
    { id: 3, name: "Dr. Smith", avatar: "https://i.pravatar.cc/150?u=3", status: "online", lastMessage: "Meeting rescheduled to 3 PM.", time: "Mon", unread: 0, activity: "Available" },
    { id: 4, name: "Project Alpha", avatar: "", status: "online", lastMessage: "Done.", time: "11:15 AM", unread: 5, isGroup: true, activity: "" },
    { id: 5, name: "Support", avatar: "", status: "busy", lastMessage: "Ticket #982 processed.", time: "Last Week", unread: 0, activity: "In a call" },
];

const TEAMS: Team[] = [
    { id: 't1', name: 'Engineering', channels: ['General', 'Frontend', 'Backend', 'DevOps'] },
    { id: 't2', name: 'Design', channels: ['General', 'UI Assets', 'Inspiration'] },
    { id: 't3', name: 'Marketing', channels: ['General', 'Campaigns', 'Social Media'] },
    { id: 't4', name: 'Product Management', channels: ['General', 'Roadmap'] },
];

const INITIAL_MESSAGES: Message[] = [
    { id: 1, senderId: 2, text: "Hi! Did you check the latest PR?", time: "10:00 AM", status: "read", reactions: { '👍': 1 }, type: 'text' },
    { id: 2, senderId: "me", text: "Hey Maria. checking it right now.", time: "10:02 AM", status: "read", reactions: {}, type: 'text' },
    { id: 3, senderId: "me", text: "Looks good, just one comment on the variable naming.", time: "10:03 AM", status: "read", reactions: {}, isEdited: true, type: 'text' },
    { id: 4, senderId: 2, text: "Got it. I'll fix that quickly.", time: "10:05 AM", status: "read", reactions: { '❤': 1 }, type: 'text', threadCount: 2 },
    { id: 5, senderId: 2, text: "", time: "10:06 AM", status: "read", reactions: {}, type: 'voice', fileUrl: "audio.mp3" },
];

const ACTIVITIES: Activity[] = [
    { id: 1, user: "Alex Johnson", avatar: "https://i.pravatar.cc/150?u=1", action: "mentioned you", context: "in Project Alpha", time: "10:30 AM", timestamp: new Date(), read: false, type: 'mention' },
    { id: 2, user: "Dr. Smith", avatar: "https://i.pravatar.cc/150?u=3", action: "replied", context: "to your post on API Specs", time: "09:15 AM", timestamp: new Date(Date.now() - 3600000), read: true, type: 'reply' },
    { id: 3, user: "System", action: "alert", context: "Server maintenance scheduled for tonight", time: "Yesterday", timestamp: new Date(Date.now() - 86400000), read: true, type: 'alert' },
];

export default function TeamsChatPage() {
    const { toast } = useToast();

    // State
    const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [activeRail, setActiveRail] = useState('chat');

    // Activity State
    const [activities, setActivities] = useState<Activity[]>(ACTIVITIES);
    const [activityFilter, setActivityFilter] = useState<'all' | 'unread' | 'mentions'>('all');

    // Advanced Chat State
    const [isTyping, setIsTyping] = useState(false);
    const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);

    // Create Dialogs
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
    const [newChatName, setNewChatName] = useState("");
    const [newGroupName, setNewGroupName] = useState("");

    // Meeting State
    const [meetingTitle, setMeetingTitle] = useState("");

    // Teams State
    const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({ 't1': true, 't2': false });

    // Calendar State
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState([
        { id: 1, title: 'Team Sync', time: '10:00 AM', duration: '1h', type: 'work', date: new Date() },
        { id: 2, title: 'Lunch Break', time: '01:00 PM', duration: '1h', type: 'personal', date: new Date() },
        { id: 3, title: 'Project Review', time: '03:00 PM', duration: '1.5h', type: 'work', date: new Date() },
    ]);

    // Files State
    const [files, setFiles] = useState([
        { id: 1, name: 'Project_Specs.pdf', type: 'pdf', size: '2.4 MB', date: 'Today' },
        { id: 2, name: 'Design_Mockup.png', type: 'image', size: '5.1 MB', date: 'Yesterday' },
        { id: 3, name: 'Q3_Report.docx', type: 'doc', size: '1.2 MB', date: 'Last Week' },
        { id: 4, name: 'Frontend_Architecture.pptx', type: 'ppt', size: '8.5 MB', date: '2 days ago' },
        { id: 5, name: 'Team_Sync_Recording.mp4', type: 'video', size: '128 MB', date: '1 hour ago' },
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        if (window.innerWidth >= 768 && activeRail === 'chat' && !selectedContact && contacts.length > 0) {
            handleSelectContact(contacts[0]);
        }
    }, [activeRail]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, selectedContact, isTyping]);

    // Handlers
    const handleSelectContact = (contact: any) => {
        setSelectedContact(contact);
        const contactMsgs = contact.isChannel ? [] : INITIAL_MESSAGES; // Mock empty for channels for now, or fill it
        setMessages(contactMsgs.length > 0 ? contactMsgs : [
            { id: 99, senderId: "System", text: `Welcome to the ${contact.name} channel. Start a conversation!`, time: "Now", status: 'read', reactions: {}, type: 'text' }
        ]);
    };

    const handleSelectChannel = (team: Team, channel: string) => {
        const channelContact: Contact = {
            id: `${team.id}-${channel}`,
            name: `${channel}`,
            avatar: "",
            status: 'online',
            lastMessage: '',
            time: '',
            unread: 0,
            activity: team.name,
            isChannel: true,
            teamName: team.name
        };
        handleSelectContact(channelContact);
    };

    const toggleTeam = (teamId: string) => {
        setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;
        const newMessage: Message = {
            id: Date.now(),
            senderId: "me",
            text: inputText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "sent",
            reactions: {},
            type: 'text'
        };
        setMessages([...messages, newMessage]);
        setInputText("");
    };

    const handleReaction = (msgId: number, emoji: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === msgId) {
                const current = msg.reactions[emoji] || 0;
                return { ...msg, reactions: { ...msg.reactions, [emoji]: current + 1 } };
            }
            return msg;
        }));
    };

    const handleDeleteMessage = (msgId: number) => {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        toast({ description: "Message deleted" });
    };

    const handleCreateChat = () => {
        if (!newChatName.trim()) return;
        const newContact: Contact = {
            id: Date.now(),
            name: newChatName,
            avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
            status: 'offline',
            lastMessage: 'Start a conversation',
            time: 'Just now',
            unread: 0,
            activity: 'New Contact'
        };
        setContacts([newContact, ...contacts]);
        setSelectedContact(newContact);
        setMessages([]);
        setNewChatName("");
        setIsDialogOpen(false);
        toast({ title: "Chat Started", description: `You can now chat with ${newChatName}` });
    };

    const handleCreateGroup = () => {
        if (!newGroupName.trim()) return;
        const newGroup: Contact = {
            id: Date.now(),
            name: newGroupName,
            avatar: "", // Group avatar empty
            status: 'online',
            lastMessage: 'Group created',
            time: 'Just now',
            unread: 0,
            activity: '0 members',
            isGroup: true
        };
        setContacts([newGroup, ...contacts]);
        setSelectedContact(newGroup);
        setMessages([]);
        setNewGroupName("");
        setIsDialogOpen(false);
        toast({ title: "Group Created", description: `${newGroupName} has been created.` });
    };

    const handleScheduleMeeting = (type: 'general' | 'interview') => {
        const title = meetingTitle || (type === 'interview' ? 'Interview Meeting' : 'Team Meeting');
        const link = `https://meet.lms.com/${Math.random().toString(36).substring(7)}`;

        const meetingMsg: Message = {
            id: Date.now(),
            senderId: "me",
            text: `Scheduled a ${type} meeting: ${title}`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent',
            reactions: {},
            type: 'meeting',
            fileUrl: link // Storing link here for simplicity
        };

        setMessages([...messages, meetingMsg]);
        setIsMeetingDialogOpen(false);
        setMeetingTitle("");
        toast({ title: "Meeting Scheduled", description: "Invite sent to participants." });
    };

    const handleShareChat = () => {
        const link = `https://lms.com/chat/${selectedContact?.id}`;
        navigator.clipboard.writeText(link);
        toast({ title: "Link Copied", description: "Chat link copied to clipboard." });
    };

    return (
        <TooltipProvider>
            <div className="flex h-screen bg-background overflow-hidden relative font-sans text-sm">

                {/* 1. App Rail */}
                <div className="w-[68px] bg-[#EBEBEB] dark:bg-[#201F1F] flex flex-col items-center py-4 gap-6 border-r flex-shrink-0 z-30">
                    {[
                        { id: 'activity', icon: Bell, label: 'Activity', badge: activities.filter(a => !a.read).length },
                        { id: 'chat', icon: MessageSquare, label: 'Chat' },
                        { id: 'teams', icon: Users, label: 'Teams' },
                        { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
                        { id: 'files', icon: FileText, label: 'Files' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveRail(item.id)}
                            className={cn(
                                "flex flex-col items-center gap-1 w-full relative group transition-colors",
                                activeRail === item.id ? "text-[#6264A7] dark:text-[#8B8CC7]" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {activeRail === item.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#6264A7] rounded-r-full" />
                            )}
                            <div className="relative">
                                <item.icon className={cn("h-6 w-6 transition-transform", activeRail === item.id && "scale-110")} />
                                {item.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* 2. Sidebar Panel */}
                <div className={cn(
                    "w-full md:w-80 flex-shrink-0 flex flex-col bg-white dark:bg-[#1f1f1f] border-r transition-all duration-300 absolute md:relative z-20 h-full",
                    selectedContact ? "hidden md:flex" : "flex"
                )}>
                    {/* Header */}
                    <div className="px-4 py-3 border-b flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold capitalize flex items-center gap-2">
                                {activeRail}
                            </h1>
                            <div className="flex gap-1">
                                {/* New Chat / Group Trigger */}
                                {activeRail === 'chat' && (
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#6264A7] hover:bg-[#E8EBFA]">
                                                <div className="relative"><MessageSquare className="h-4 w-4" /><Plus className="h-3 w-3 absolute -top-1 -right-1 bg-background rounded-full" /></div>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Create New</DialogTitle>
                                                <DialogDescription>Start a new conversation or create a team group.</DialogDescription>
                                            </DialogHeader>
                                            <Tabs defaultValue="chat">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="chat">New Chat</TabsTrigger>
                                                    <TabsTrigger value="group">Create Group</TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="chat" className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">To:</label>
                                                        <Input placeholder="Enter name or email..." value={newChatName} onChange={(e) => setNewChatName(e.target.value)} />
                                                    </div>
                                                    <Button className="w-full bg-[#6264A7] hover:bg-[#525491]" onClick={handleCreateChat}>Start Chat</Button>
                                                </TabsContent>
                                                <TabsContent value="group" className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Group Name:</label>
                                                        <Input placeholder="e.g. Marketing Team" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Add Members (Optional):</label>
                                                        <Input placeholder="Search people..." />
                                                    </div>
                                                    <Button className="w-full bg-[#6264A7] hover:bg-[#525491]" onClick={handleCreateGroup}>Create Group</Button>
                                                </TabsContent>
                                            </Tabs>
                                        </DialogContent>
                                    </Dialog>
                                )}

                                {activeRail === 'activity' && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Filter className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Filter Feed</DropdownMenuLabel>
                                            <DropdownMenuCheckboxItem checked={activityFilter === 'all'} onCheckedChange={() => setActivityFilter('all')}>All Activity</DropdownMenuCheckboxItem>
                                            <DropdownMenuCheckboxItem checked={activityFilter === 'mentions'} onCheckedChange={() => setActivityFilter('mentions')}>Mentions</DropdownMenuCheckboxItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                                <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#6264A7] hover:bg-[#E8EBFA]">
                                            <CalendarPlus className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Schedule Meeting</DialogTitle>
                                            <DialogDescription>Set up a call or interview.</DialogDescription>
                                        </DialogHeader>
                                        <Tabs defaultValue="general">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="general">Team Meeting</TabsTrigger>
                                                <TabsTrigger value="interview">Interview</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="general" className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Meeting Title</Label>
                                                    <Input placeholder="Weekly Sync" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Date & Time</Label>
                                                    <Input type="datetime-local" />
                                                </div>
                                                <Button className="w-full bg-[#6264A7]" onClick={() => handleScheduleMeeting('general')}>Schedule</Button>
                                            </TabsContent>
                                            <TabsContent value="interview" className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Candidate Name / Context</Label>
                                                    <Input placeholder="Interview: John Doe" value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Type</Label>
                                                    <Input placeholder="1:1 Interview" disabled />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Date & Time</Label>
                                                    <Input type="datetime-local" />
                                                </div>
                                                <Button className="w-full bg-[#6264A7]" onClick={() => handleScheduleMeeting('interview')}>Schedule Interview</Button>
                                            </TabsContent>
                                        </Tabs>
                                    </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={`Filter ${activeRail}...`} className="pl-9 h-9 bg-muted/30 border-muted" />
                        </div>
                    </div>

                    {/* Content List */}
                    <ScrollArea className="flex-1">
                        {activeRail === 'chat' && (
                            <div className="space-y-0.5 px-2 pt-2">
                                {contacts.map(contact => (
                                    <button
                                        key={contact.id}
                                        onClick={() => handleSelectContact(contact)}
                                        className={cn(
                                            "flex items-center gap-3 w-full p-2 rounded-md transition-all text-left relative",
                                            selectedContact?.id === contact.id ? "bg-white shadow-sm dark:bg-[#2B2B2B]" : "hover:bg-[#F5F5F5] dark:hover:bg-[#2D2D2D]"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={contact.avatar || undefined} />
                                                <AvatarFallback className="bg-[#6264A7] text-white text-xs">{contact.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className={cn(
                                                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-[#1f1f1f]",
                                                contact.status === 'online' ? "bg-green-500" : contact.status === 'dnd' ? "bg-red-500" : "bg-gray-400"
                                            )} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-sm font-semibold truncate">{contact.name}</span>
                                                <span className="text-[10px] text-muted-foreground ml-1">{contact.time}</span>
                                            </div>
                                            <div className="flex justify-between items-center mt-0.5">
                                                <p className={cn("text-xs truncate max-w-[85%]", contact.unread > 0 ? "font-semibold" : "text-muted-foreground")}>{contact.lastMessage}</p>
                                                {contact.unread > 0 && <Badge className="h-4 px-1 bg-red-600 text-[10px]">{contact.unread}</Badge>}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* TEAMS LIST - FIXING THE EMPTY STATE */}
                        {activeRail === 'teams' && (
                            <div className="p-2 space-y-1">
                                <div className="px-2 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Teams</div>
                                {TEAMS.map(team => (
                                    <div key={team.id} className="space-y-0.5">
                                        <button
                                            onClick={() => toggleTeam(team.id)}
                                            className="flex items-center w-full gap-2 p-2 text-sm font-semibold rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#2D2D2D] transition-colors"
                                        >
                                            {expandedTeams[team.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            <Users className="h-4 w-4 text-[#6264A7]" />
                                            {team.name}
                                        </button>
                                        {expandedTeams[team.id] && (
                                            <div className="ml-4 pl-2 border-l border-muted">
                                                {team.channels.map(channel => (
                                                    <button
                                                        key={channel}
                                                        onClick={() => handleSelectChannel(team, channel)}
                                                        className={cn(
                                                            "flex items-center gap-2 w-full p-1.5 text-sm rounded-md transition-all text-left group",
                                                            selectedContact?.id === `${team.id}-${channel}` ? "font-bold text-[#6264A7] bg-[#E8EBFA]" : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        {channel === 'General' ? <Hash className="h-3 w-3" /> : <div className="w-3 h-3 rounded-full border" />}
                                                        {channel}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeRail === 'activity' && (
                            <div className="p-4 text-center text-muted-foreground">Activity Feed Mock</div>
                        )}

                        {activeRail === 'calendar' && (
                            <div className="p-4 space-y-6">
                                <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        className="rounded-md border shadow"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <ClockIcon className="h-4 w-4 text-[#6264A7]" /> Upcoming
                                    </h3>
                                    <div className="space-y-3">
                                        {events.map(evt => (
                                            <div key={evt.id} className="p-3 rounded-lg border bg-white dark:bg-[#2B2B2B] shadow-sm hover:border-[#6264A7] transition-colors cursor-pointer group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm group-hover:text-[#6264A7]">{evt.title}</span>
                                                    <Badge variant={evt.type === 'work' ? 'default' : 'secondary'} className="text-[10px] h-4 px-1">{evt.type}</Badge>
                                                </div>
                                                <div className="text-xs text-muted-foreground">{evt.time} • {evt.duration}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="w-full mt-4 bg-[#6264A7]" variant="outline">
                                        <Plus className="h-4 w-4 mr-2" /> New Event
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeRail === 'files' && (
                            <div className="p-4 space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Storage</h3>
                                    <div className="p-3 bg-white dark:bg-[#2B2B2B] rounded-lg border shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Cloud className="h-5 w-5 text-blue-500" />
                                            <div className="text-sm font-medium">Cloud Drive</div>
                                        </div>
                                        <Progress value={75} className="h-2 mb-1" />
                                        <div className="flex justify-between text-[10px] text-muted-foreground">
                                            <span>75 GB used</span>
                                            <span>100 GB total</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Categories</h3>
                                    <Button variant="ghost" className="w-full justify-start gap-2"><ClockIcon className="h-4 w-4" /> Recent</Button>
                                    <Button variant="ghost" className="w-full justify-start gap-2"><VideoIcon className="h-4 w-4" /> Recordings</Button>
                                    <Button variant="ghost" className="w-full justify-start gap-2"><Star className="h-4 w-4" /> Favorites</Button>
                                    <Button variant="ghost" className="w-full justify-start gap-2"><Share2 className="h-4 w-4" /> Shared</Button>
                                    <Button variant="ghost" className="w-full justify-start gap-2"><Trash className="h-4 w-4" /> Deleted</Button>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* 3. Main Chat Canvas */}
                <div className={cn(
                    "flex-1 flex flex-col bg-[#F5F5F5] dark:bg-[#0b0b0b] relative",
                    (!selectedContact && activeRail !== 'calendar' && activeRail !== 'files') ? "hidden md:flex" : "flex w-full"
                )}>
                    {activeRail === 'calendar' ? (
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            <header className="h-14 bg-white dark:bg-[#1f1f1f] border-b flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-[#6264A7]" />
                                    {date?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">Day</Button>
                                    <Button variant="outline" size="sm" className="bg-[#E8EBFA] text-[#6264A7] border-[#6264A7]">Week</Button>
                                    <Button variant="outline" size="sm">Month</Button>
                                    <Button className="bg-[#6264A7] size-sm text-sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
                                </div>
                            </header>
                            <ScrollArea className="flex-1 p-6">
                                <div className="grid grid-cols-8 gap-4 min-w-[800px]">
                                    {/* Time Column */}
                                    <div className="col-span-1 space-y-8 pt-12 text-xs text-muted-foreground text-right pr-4 border-r">
                                        {['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'].map(time => (
                                            <div key={time} className="h-20">{time}</div>
                                        ))}
                                    </div>
                                    {/* Days Columns */}
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                        <div key={day} className="col-span-1 space-y-4">
                                            <div className={cn("text-center font-bold p-2 rounded-t-lg", i === 2 ? "bg-[#6264A7] text-white" : "bg-white dark:bg-[#2B2B2B]")}>
                                                {day} <span className="block text-xs opacity-80">{10 + i}</span>
                                            </div>
                                            <div className="space-y-2 h-[800px] relative bg-white/50 rounded-b-lg border-x border-b border-dashed">
                                                {/* Mock Events on grid */}
                                                {i === 2 && (
                                                    <div className="absolute top-20 left-1 right-1 h-20 bg-blue-100 border-l-4 border-blue-600 rounded p-2 text-xs shadow-sm cursor-pointer hover:scale-105 transition-transform">
                                                        <span className="font-bold text-blue-800">Team Sync</span>
                                                        <div className="text-blue-600">10:00 - 11:00 AM</div>
                                                    </div>
                                                )}
                                                {i === 3 && (
                                                    <div className="absolute top-60 left-1 right-1 h-32 bg-purple-100 border-l-4 border-purple-600 rounded p-2 text-xs shadow-sm cursor-pointer hover:scale-105 transition-transform">
                                                        <span className="font-bold text-purple-800">Design Workshop</span>
                                                        <div className="text-purple-600">12:00 - 1:30 PM</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    ) : activeRail === 'files' ? (
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            <header className="h-14 bg-white dark:bg-[#1f1f1f] border-b flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <Folder className="h-5 w-5 text-[#6264A7]" /> My Files
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                                        <Input placeholder="Search files..." className="pl-9 h-9 w-60" />
                                    </div>
                                    <Button className="bg-[#6264A7] size-sm text-sm"><Upload className="h-4 w-4 mr-1" /> Upload</Button>
                                </div>
                            </header>
                            <ScrollArea className="flex-1 p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {files.map(file => (
                                        <div key={file.id} className="group relative bg-white dark:bg-[#2B2B2B] p-4 rounded-xl border hover:shadow-md hover:border-[#6264A7] transition-all cursor-pointer">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </div>
                                            <div className="h-20 w-full flex items-center justify-center mb-3 bg-gray-50 dark:bg-[#1f1f1f] rounded-lg">
                                                {file.type === 'pdf' && <FileText className="h-10 w-10 text-red-500" />}
                                                {file.type === 'image' && <ImageIcon className="h-10 w-10 text-blue-500" />}
                                                {file.type === 'doc' && <File className="h-10 w-10 text-blue-600" />}
                                                {file.type === 'ppt' && <FileText className="h-10 w-10 text-orange-500" />}
                                                {file.type === 'video' && <VideoIcon className="h-10 w-10 text-purple-500" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm truncate" title={file.name}>{file.name}</p>
                                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                                    <span>{file.size}</span>
                                                    <span>{file.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Create New Folder Mock */}
                                    <div className="border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
                                        <Folder className="h-8 w-8 opacity-50" />
                                        <span className="text-xs font-medium">New Folder</span>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    ) : (
                        !selectedContact ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                                <div className="p-4 bg-muted rounded-full mb-4"><Users className="h-12 w-12 opacity-50" /></div>
                                <p>Select a conversation or start a new chat</p>
                            </div>
                        ) : (
                            <>
                                <header className="h-14 bg-white dark:bg-[#1f1f1f] border-b flex items-center justify-between px-4 sticky top-0 z-10 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => setSelectedContact(null)}><ArrowLeft className="h-5 w-5" /></Button>
                                        {selectedContact.isChannel ? (
                                            <div className="h-8 w-8 bg-[#6264A7] rounded flex items-center justify-center text-white"><Users className="h-4 w-4" /></div>
                                        ) : (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={selectedContact.avatar || undefined} />
                                                <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className="leading-tight">
                                            <h2 className="text-sm font-bold flex items-center gap-2">
                                                {selectedContact.name}
                                                {selectedContact.teamName && <span className="text-muted-foreground font-normal">| {selectedContact.teamName}</span>}
                                                <Lock className="h-3 w-3 text-muted-foreground" />
                                            </h2>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                {selectedContact.status === 'online' ? 'Active now' : selectedContact.status === 'dnd' ? 'Do not disturb' : 'Last seen recently'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Call / Meet Actions */}
                                    <div className="flex items-center gap-1">
                                        <Tooltip><TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-[#6264A7] hover:bg-[#E8EBFA]" onClick={handleShareChat}><LinkIcon className="h-5 w-5" /></Button>
                                        </TooltipTrigger><TooltipContent>Share Chat Link</TooltipContent></Tooltip>



                                        <Tooltip><TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-[#6264A7] hover:bg-[#E8EBFA]"><Video className="h-5 w-5" /></Button>
                                        </TooltipTrigger><TooltipContent>Instant Video Call</TooltipContent></Tooltip>

                                        <Tooltip><TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-[#6264A7] hover:bg-[#E8EBFA]"><Phone className="h-5 w-5" /></Button>
                                        </TooltipTrigger><TooltipContent>Audio Call</TooltipContent></Tooltip>

                                        <Separator orientation="vertical" className="h-6 mx-1" />
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
                                    </div>
                                </header>

                                <ScrollArea className="flex-1 p-4">
                                    <div className="flex flex-col gap-4 max-w-4xl mx-auto pb-4">
                                        {/* Unread Separator Mock */}
                                        {messages.length > 0 && <div className="flex items-center gap-2 py-2">
                                            <Separator className="flex-1" />
                                            <span className="text-[10px] text-red-500 font-medium bg-red-50 px-2 rounded-full border border-red-100 uppercase tracking-widest">New Messages</span>
                                            <Separator className="flex-1" />
                                        </div>}

                                        {messages.map((msg, index) => {
                                            const isMe = msg.senderId === "me";
                                            const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={cn("flex gap-3 group relative", isMe ? "justify-end" : "justify-start")}
                                                    onMouseEnter={() => setHoveredMessage(msg.id)}
                                                    onMouseLeave={() => setHoveredMessage(null)}
                                                >
                                                    {/* Hover Actions */}
                                                    <div className={cn(
                                                        "absolute top-0 -mt-3 flex items-center gap-1 bg-white dark:bg-[#2B2B2B] shadow-md border rounded-full px-1 py-0.5 opacity-0 transition-opacity z-10",
                                                        hoveredMessage === msg.id ? "opacity-100" : "hidden",
                                                        isMe ? "right-0 mr-12" : "left-12"
                                                    )}>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleReaction(msg.id, '👍')}>👍</Button>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleReaction(msg.id, '❤')}>❤</Button>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleReaction(msg.id, '😂')}>😂</Button>
                                                        <Separator orientation="vertical" className="h-4" />
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full"><Reply className="h-3 w-3" /></Button>
                                                        {isMe && <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleDeleteMessage(msg.id)}><Trash className="h-3 w-3 text-red-500" /></Button>}
                                                    </div>

                                                    {!isMe && (
                                                        <div className="w-8 flex-shrink-0">
                                                            {showAvatar && (
                                                                <Avatar className="h-8 w-8 cursor-pointer">
                                                                    <AvatarImage src={selectedContact.avatar || undefined} />
                                                                    <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
                                                                </Avatar>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className={cn("flex flex-col max-w-[70%]", isMe ? "items-end" : "items-start")}>
                                                        {!isMe && showAvatar && (
                                                            <span className="text-xs text-muted-foreground ml-1 mb-1">{selectedContact.name}, {msg.time}</span>
                                                        )}

                                                        <div className={cn(
                                                            "px-4 py-2 text-sm shadow-sm border relative group/bubble",
                                                            isMe
                                                                ? "bg-[#E8EBFA] border-[#E8EBFA] text-foreground rounded-t-xl rounded-l-xl dark:bg-[#3E4057] dark:border-none"
                                                                : "bg-white border-white text-foreground rounded-t-xl rounded-r-xl dark:bg-[#2B2B2B] dark:border-none",
                                                            (msg.type === 'voice' || msg.type === 'meeting') && "min-w-[200px]"
                                                        )}>
                                                            {msg.type === 'text' && msg.text}
                                                            {msg.type === 'voice' && (
                                                                <div className="flex items-center gap-2">
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-background"><div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-foreground border-b-[5px] border-b-transparent ml-1" /></Button>
                                                                    <div className="h-1 bg-black/10 flex-1 rounded-full overflow-hidden w-24"><div className="h-full w-1/3 bg-foreground/50" /></div>
                                                                    <span className="text-[10px]">0:15</span>
                                                                </div>
                                                            )}
                                                            {msg.type === 'meeting' && (
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex items-center gap-2 font-semibold text-[#6264A7]">
                                                                        <Calendar className="h-4 w-4" />
                                                                        {msg.text}
                                                                    </div>
                                                                    <div className="text-xs bg-background/50 p-2 rounded">
                                                                        Link: <a href="#" className="underline text-blue-500">Join Meeting</a>
                                                                    </div>
                                                                    <Button size="sm" className="w-full bg-[#6264A7] hover:bg-[#525491] h-7 text-xs">Join Now</Button>
                                                                </div>
                                                            )}

                                                            {/* Reactions Display */}
                                                            {Object.keys(msg.reactions).length > 0 && (
                                                                <div className={cn(
                                                                    "absolute -bottom-2 flex gap-0.5 bg-background shadow-sm border rounded-full px-1 py-0.5 text-[10px]",
                                                                    isMe ? "right-0" : "left-0"
                                                                )}>
                                                                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                                                                        <span key={emoji}>{emoji} {count > 1 && count}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                                                            {msg.isEdited && <span>(edited)</span>}
                                                            {isMe && <span>{msg.status === 'read' ? <CheckCircle className="h-3 w-3 text-[#6264A7]" /> : <Check className="h-3 w-3" />}</span>}
                                                        </div>

                                                        {msg.threadCount && (
                                                            <div className="mt-2 text-xs text-[#6264A7] font-medium cursor-pointer hover:underline flex items-center gap-1">
                                                                <MessageSquare className="h-3 w-3" />
                                                                {msg.threadCount} replies from Dr. Smith
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {isTyping && (
                                            <div className="flex gap-3">
                                                <Avatar className="h-8 w-8"><AvatarImage src={selectedContact.avatar || undefined} /><AvatarFallback>{selectedContact.name[0]}</AvatarFallback></Avatar>
                                                <div className="bg-white dark:bg-[#2B2B2B] px-4 py-3 rounded-t-xl rounded-r-xl shadow-sm border border-white dark:border-none flex gap-1 items-center">
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>

                                {/* Input Area */}
                                <div className="p-4 bg-white dark:bg-[#1f1f1f] border-t">
                                    <div className="max-w-4xl mx-auto border rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#6264A7]/30 transition-all bg-background relative">
                                        {/* Toolbar */}
                                        <div className="flex items-center gap-1 p-2 bg-muted/20 border-b overflow-x-auto">
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><Bold className="h-3.5 w-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><Italic className="h-3.5 w-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><Underline className="h-3.5 w-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><List className="h-3.5 w-3.5" /></Button>
                                            <Separator orientation="vertical" className="h-4 mx-1" />
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><AtSign className="h-3.5 w-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><Clock className="h-3.5 w-3.5" /></Button>
                                            <div className="flex-1" />
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><Paperclip className="h-3.5 w-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7"><Smile className="h-3.5 w-3.5" /></Button>
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                                placeholder="Type a message..."
                                                className="w-full min-h-[60px] max-h-[150px] p-3 resize-none bg-transparent outline-none text-sm pr-20"
                                            />
                                            <div className="absolute bottom-2 right-2 flex items-center gap-2">
                                                {!inputText.trim() && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Mic className="h-4 w-4" /></Button>}
                                                <Button
                                                    size="icon"
                                                    onClick={() => handleSendMessage()}
                                                    disabled={!inputText.trim()}
                                                    className={cn("h-8 w-8 transition-all", inputText.trim() ? "bg-[#6264A7] hover:bg-[#525491]" : "bg-muted text-muted-foreground")}
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-2 text-[10px] text-muted-foreground flex justify-center gap-4">
                                        <span>Press Enter to send</span>
                                        <span className="flex items-center gap-1"><Lock className="h-2 w-2" /> End-to-end encrypted</span>
                                    </div>
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>

        </TooltipProvider >
    );
}
