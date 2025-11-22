
'use client'

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AuthAvatar from "@/components/layout/auth-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";

const initialTutors = [
  {
    id: "T001",
    name: "Dr. Evelyn Reed",
    email: "e.reed@example.com",
    avatar: "https://i.pravatar.cc/150?u=t01",
    expertise: "React, Next.js",
    joined: "2022-11-10",
    status: "Verified",
  },
  {
    id: "T002",
    name: "Kenji Tanaka",
    email: "k.tanaka@example.com",
    avatar: "https://i.pravatar.cc/150?u=t02",
    expertise: "Python, Data Science",
    joined: "2023-01-25",
    status: "Verified",
  },
  {
    id: "T003",
    name: "Fatima Al-Sayed",
    email: "f.alsayed@example.com",
    avatar: "https://i.pravatar.cc/150?u=t03",
    expertise: "Java, Spring Boot",
    joined: "2023-05-18",
    status: "Pending",
  },
];

export default function AdminTutorsPage() {
    const [tutors, setTutors] = useState(initialTutors);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
    const [loading, setLoading] = useState(false);
    const [profileTutor, setProfileTutor] = useState<any | null>(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newTutor, setNewTutor] = useState({ email: '', password: '', firstName: '', lastName: '', phoneNumber: '', expertise: '' });

    useEffect(() => {
        // Fetch tutors from backend admin endpoint
        const fetchTutors = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/v1/auth/admin/tutors');
                if (!res.ok) {
                    console.error('Failed to fetch tutors', res.status);
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                // Backend returns { total, tutors: [ { id, email, firstName, lastName, phoneNumber, expertise, bio, ... } ] }
                const mapped = (data.tutors || []).map((t: any) => ({
                    id: String(t.id),
                    name: `${t.firstName || ''} ${t.lastName || ''}`.trim(),
                    email: t.email,
                    avatar: t.photoUrl ? (t.photoUrl.startsWith('http') ? t.photoUrl : `${API_BASE_URL}/api/v1/auth/admin/image/${t.photoUrl}`) : `https://i.pravatar.cc/150?u=t${t.id}`,
                    expertise: t.expertise || '',
                    joined: Array.isArray(t.createdAt) ? `${t.createdAt[0]}-${String(t.createdAt[1]).padStart(2,'0')}-${String(t.createdAt[2]).padStart(2,'0')}` : undefined,
                    status: t.status ? (t.status === 'APPROVED' ? 'Verified' : t.status) : (t.verified ? 'Verified' : 'Pending'),
                }));
                setTutors(mapped.length ? mapped : initialTutors);
            } catch (err) {
                console.error('Error fetching tutors', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTutors();
    }, []);

    // call backend to update tutor status
    const handleStatusChange = async (tutorId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/v1/auth/admin/tutors/${tutorId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus.toUpperCase() === 'VERIFIED' ? 'APPROVED' : newStatus.toUpperCase() }),
            });
            if (!res.ok) {
                console.error('Failed to update status', res.status);
                return;
            }
            const data = await res.json();
            setTutors(prev => prev.map(t => t.id === tutorId ? { ...t, status: data.status === 'APPROVED' ? 'Verified' : data.status } : t));
        } catch (err) {
            console.error('Error updating tutor status', err);
        }
    };

    const openProfile = async (tutorId: string) => {
        try {
            const res = await fetch(`/api/v1/auth/admin/tutors/${tutorId}`);
            if (!res.ok) {
                console.error('Failed to fetch tutor details', res.status);
                return;
            }
            const data = await res.json();
            setProfileTutor(data);
            setShowProfile(true);
        } catch (err) {
            console.error('Error fetching tutor profile', err);
        }
    };

    const handleDeleteTutor = async (tutorId: string) => {
        if (!confirm('Are you sure you want to delete this tutor account? This action cannot be undone.')) return;
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
            const res = await fetch(`${API_BASE_URL}/api/v1/auth/admin/tutors/${tutorId}`, {
                method: 'DELETE',
                headers: token ? { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` } : { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                const text = await res.text().catch(() => null);
                console.error('Failed to delete tutor', res.status, text);
                alert(`Failed to delete tutor ${res.status} ${text || ''}`);
                return;
            }
            // remove from UI
            setTutors(prev => prev.filter(t => t.id !== tutorId));
        } catch (err) {
            console.error('Error deleting tutor', err);
            alert('Error deleting tutor');
        }
    };

    const handleAddTutor = async () => {
        try {
            setAdding(true);
            // call public tutor register endpoint
            const res = await fetch('/api/v1/tutor/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: newTutor.email,
                    password: newTutor.password,
                    firstName: newTutor.firstName,
                    lastName: newTutor.lastName,
                    phoneNumber: newTutor.phoneNumber,
                    expertise: newTutor.expertise,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                console.error('Failed to add tutor', res.status, err);
                alert('Failed to add tutor');
                return;
            }
            const data = await res.json();
            // refresh list
            const listRes = await fetch('/api/v1/auth/admin/tutors');
            const listData = await listRes.json();
            const mapped = (listData.tutors || []).map((t: any) => ({
                id: String(t.id),
                name: `${t.firstName || ''} ${t.lastName || ''}`.trim(),
                email: t.email,
                avatar: t.photoUrl ? (t.photoUrl.startsWith('http') ? t.photoUrl : `${API_BASE_URL}/api/v1/auth/admin/image/${t.photoUrl}`) : `https://i.pravatar.cc/150?u=t${t.id}`,
                expertise: t.expertise || '',
                joined: Array.isArray(t.createdAt) ? `${t.createdAt[0]}-${String(t.createdAt[1]).padStart(2,'0')}-${String(t.createdAt[2]).padStart(2,'0')}` : undefined,
                status: t.status ? (t.status === 'APPROVED' ? 'Verified' : t.status) : (t.verified ? 'Verified' : 'Pending'),
            }));
            setTutors(mapped.length ? mapped : initialTutors);
            setShowAdd(false);
            setNewTutor({ email: '', password: '', firstName: '', lastName: '', phoneNumber: '', expertise: '' });
        } catch (err) {
            console.error('Error adding tutor', err);
            alert('Error adding tutor');
        } finally {
            setAdding(false);
        }
    };


  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter">Manage Tutors</h1>
            <p className="text-lg text-muted-foreground mt-2">
            View, edit, and manage tutor accounts.
            </p>
        </div>
         <Button onClick={() => setShowAdd(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Tutor
        </Button>
      </header>
      <main>
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tutor</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Expertise</TableHead>
                            <TableHead>Joined Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tutors.map(tutor => (
                            <TableRow key={tutor.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AuthAvatar src={tutor.avatar} photoKey={tutor.avatar && tutor.avatar.includes('/api/') ? undefined : tutor.avatar} alt={tutor.name} />
                                            <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{tutor.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{tutor.email}</TableCell>
                                <TableCell>{tutor.expertise}</TableCell>
                                <TableCell>{tutor.joined}</TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={
                                            tutor.status === 'Verified' ? 'default' : 
                                            tutor.status === 'Pending' ? 'secondary' : 
                                            'destructive'
                                        }
                                    >
                                        {tutor.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openProfile(tutor.id)}>View Profile</DropdownMenuItem>
                                             {tutor.status === 'Pending' && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(tutor.id, 'Approved')}>
                                                    Approve Tutor
                                                </DropdownMenuItem>
                                            )}
                                            {tutor.status === 'Verified' && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(tutor.id, 'Suspended')}>
                                                    Suspend
                                                </DropdownMenuItem>
                                            )}
                                            {tutor.status === 'Suspended' && (
                                                <DropdownMenuItem onClick={() => handleStatusChange(tutor.id, 'Approved')}>
                                                    Re-activate
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteTutor(tutor.id)}>Delete Account</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
                 </Card>
             </main>

            {/* Profile Modal */}
            {showProfile && profileTutor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowProfile(false)} />
                    <div className="relative bg-white rounded-lg p-6 w-11/12 max-w-2xl">
                        <h3 className="text-xl font-bold mb-4">{profileTutor.firstName} {profileTutor.lastName}</h3>
                        <p><strong>Email:</strong> {profileTutor.email}</p>
                        <p><strong>Phone:</strong> {profileTutor.mobileNumber || profileTutor.phoneNumber}</p>
                        <p><strong>Expertise:</strong> {profileTutor.expertise}</p>
                        <p><strong>Bio:</strong> {profileTutor.bio}</p>
                        <p><strong>Qualification:</strong> {profileTutor.qualification}</p>
                        <p><strong>Experience:</strong> {profileTutor.experience}</p>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={() => setShowProfile(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Tutor Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
                    <div className="relative bg-white rounded-lg p-6 w-11/12 max-w-xl">
                        <h3 className="text-xl font-bold mb-4">Add New Tutor</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <input className="border p-2" placeholder="First name" value={newTutor.firstName} onChange={e => setNewTutor({...newTutor, firstName: e.target.value})} />
                            <input className="border p-2" placeholder="Last name" value={newTutor.lastName} onChange={e => setNewTutor({...newTutor, lastName: e.target.value})} />
                            <input className="border p-2" placeholder="Email" value={newTutor.email} onChange={e => setNewTutor({...newTutor, email: e.target.value})} />
                            <input className="border p-2" placeholder="Phone" value={newTutor.phoneNumber} onChange={e => setNewTutor({...newTutor, phoneNumber: e.target.value})} />
                            <input className="border p-2" placeholder="Expertise" value={newTutor.expertise} onChange={e => setNewTutor({...newTutor, expertise: e.target.value})} />
                            <input className="border p-2" placeholder="Password" type="password" value={newTutor.password} onChange={e => setNewTutor({...newTutor, password: e.target.value})} />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                            <Button onClick={handleAddTutor} disabled={adding}>{adding ? 'Adding...' : 'Add Tutor'}</Button>
                        </div>
                    </div>
                </div>
            )}
    </div>
  );
}
