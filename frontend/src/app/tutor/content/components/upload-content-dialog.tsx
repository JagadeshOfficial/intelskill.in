
'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type Course, type Student } from "../data";
import { useToast } from "@/hooks/use-toast";

interface UploadContentDialogProps {
    children: React.ReactNode;
    uploadType: 'Video' | 'Document';
    courses: Course[];
    students: Student[];
}

export function UploadContentDialog({ children, uploadType, courses, students }: UploadContentDialogProps) {
    const [open, setOpen] = useState(false);
    const [assignmentType, setAssignmentType] = useState('all');
    const { toast } = useToast();

    const handleUpload = () => {
        // Simulate upload logic
        toast({
            title: "Upload Successful",
            description: `Your ${uploadType.toLowerCase()} has been uploaded and assigned.`,
        });
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload {uploadType}</DialogTitle>
                    <DialogDescription>
                        Select a file and assign it to a course for your students.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file">File</Label>
                        <Input id="file" type="file" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="course">Course</Label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label>Assign To</Label>
                         <RadioGroup defaultValue="all" onValueChange={setAssignmentType}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="r1" />
                                <Label htmlFor="r1">All Students in Course</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="specific" id="r2" />
                                <Label htmlFor="r2">A Specific Student</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    {assignmentType === 'specific' && (
                         <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="student">Student</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a student" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.map(student => (
                                        <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleUpload}>Upload & Assign</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

