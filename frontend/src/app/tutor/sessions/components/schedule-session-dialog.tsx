
'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import type { Course, Batch } from "../../content/data";
import type { Session } from "../page";

interface ScheduleSessionDialogProps {
    children: React.ReactNode;
    courses: Course[];
    onAddSession: (session: Omit<Session, 'id' | 'status'>) => void;
}

export function ScheduleSessionDialog({ children, courses, onAddSession }: ScheduleSessionDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const [date, setDate] = useState<Date | undefined>();
    const [title, setTitle] = useState("");
    const [time, setTime] = useState("");
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

    const handleSchedule = () => {
        if (!title || !date || !time || !selectedCourse || !selectedBatch) {
             toast({
                title: "Missing Information",
                description: "Please fill out all fields to schedule a session.",
                variant: "destructive",
            });
            return;
        }

        onAddSession({
            title,
            date: format(date, "yyyy-MM-dd"),
            time,
            courseTitle: selectedCourse.title,
            batchName: selectedBatch.name
        });

        toast({
            title: "Session Scheduled!",
            description: "Your new session has been added to the calendar.",
        });
        
        // Reset form and close dialog
        setDate(undefined);
        setTitle("");
        setTime("");
        setSelectedCourse(null);
        setSelectedBatch(null);
        setOpen(false);
    }

    const handleCourseChange = (courseId: string) => {
        const course = courses.find(c => c.id === courseId) || null;
        setSelectedCourse(course);
        setSelectedBatch(null); // Reset batch when course changes
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Schedule New Session</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new live session for your students.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="title">Session Title</Label>
                        <Input id="title" placeholder="e.g., Live Q&A" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                     <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="course">Course</Label>
                        <Select onValueChange={handleCourseChange} value={selectedCourse?.id}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedCourse && (
                         <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="batch">Batch</Label>
                            <Select onValueChange={(batchId) => setSelectedBatch(selectedCourse.batches.find(b => b.id === batchId) || null)} value={selectedBatch?.id}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a batch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedCourse.batches.map(b => (
                                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="grid w-full items-center gap-1.5">
                         <Label htmlFor="date">Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="time">Time</Label>
                        <Input id="time" type="time" value={time} onChange={e => setTime(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleSchedule}>Schedule Session</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
