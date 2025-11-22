
"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AuthAvatar from "@/components/layout/auth-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useRef, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export default function StudentProfilePage() {
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('studentToken');
            if (!token) return;
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/student/me`, { headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) {
                    setMessage('Failed to load profile');
                    return;
                }
                const data = await res.json();
                setFirstName(data.firstName || '');
                setLastName(data.lastName || '');
                setEmail(data.email || '');
                setPhoneNumber(data.mobileNumber || data.phoneNumber || '');
                setPhotoUrl(data.photoUrl || null);
                // persist to localStorage for header
                if (data.firstName) localStorage.setItem('studentFirstName', data.firstName);
                if (data.lastName) localStorage.setItem('studentLastName', data.lastName);
                if (data.email) localStorage.setItem('studentEmail', data.email);
                if (data.photoUrl) localStorage.setItem('studentPhotoUrl', data.photoUrl);
            } catch (err) {
                setMessage('Network error while loading profile');
            } finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleSave = async () => {
        const token = localStorage.getItem('studentToken');
        if (!token) { setMessage('Not authenticated'); return; }
        setLoading(true); setMessage('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/student/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ firstName, lastName, phoneNumber })
            });
            const data = await res.json();
            if (!res.ok || !data.success) { setMessage(data.message || 'Failed to update profile'); return; }
            setMessage('Profile updated successfully');
        } catch (err) {
            setMessage('Network error while updating profile');
        } finally { setLoading(false); }
    };

    const handleUpload = async (file: File | null) => {
        if (!file) return;
        const token = localStorage.getItem('studentToken');
        if (!token) { setMessage('Not authenticated'); return; }
        const fd = new FormData();
        fd.append('file', file);
        setLoading(true); setMessage('');
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/student/me/avatar`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });
            const data = await res.json();
            if (!res.ok || !data.success) { setMessage(data.message || 'Failed to upload avatar'); return; }
            setPhotoUrl(data.photoUrl);
            localStorage.setItem('studentPhotoUrl', data.photoUrl);
            setMessage('Avatar uploaded');
        } catch (err) {
            setMessage('Network error while uploading avatar');
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-8">
             <header>
                <h1 className="text-4xl font-bold font-headline tracking-tighter">My Profile</h1>
                <p className="text-lg text-muted-foreground mt-2">View and manage your account details and settings.</p>
            </header>

            <main className="space-y-8">
                <Card>
                        <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your name and profile picture.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                                 <div className="flex items-center gap-4">
                                        <Avatar className="h-20 w-20">
                                                {photoUrl ? (
                                                    <AuthAvatar src={photoUrl.startsWith('http') || photoUrl.includes('/api/') ? photoUrl : undefined} photoKey={!photoUrl.startsWith('http') && !photoUrl.includes('/api/') ? photoUrl : undefined} alt="User Avatar" />
                                                ) : (
                                                    <img src={`https://i.pravatar.cc/150?u=${email}`} alt="User Avatar" className="h-20 w-20 rounded-full" />
                                                )}
                                                <AvatarFallback>{(firstName || 'U').charAt(0)}</AvatarFallback>
                                        </Avatar>
                                         <input ref={fileInputRef} type="file" accept="image/*" onChange={e => handleUpload(e.target.files ? e.target.files[0] : null)} className="hidden" />
                                         <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Change Picture</Button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" type="email" value={email} disabled />
                                        </div>
                                        <div className="space-y-2">
                                                <Label htmlFor="phone">Phone</Label>
                                                <Input id="phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
                                        </div>
                                </div>
                        </CardContent>
                </Card>

                <Card>
                        <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>For security, choose a strong password that you haven't used before.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                                 <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input id="current-password" type="password" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                                <Label htmlFor="new-password">New Password</Label>
                                                <Input id="new-password" type="password" />
                                        </div>
                                        <div className="space-y-2">
                                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                                <Input id="confirm-password" type="password" />
                                        </div>
                                </div>
                        </CardContent>
                </Card>

                <div className="flex justify-end items-center gap-4">
                        <div className="text-sm text-muted-foreground">{message}</div>
                        <Button onClick={handleSave} disabled={loading}>Save Changes</Button>
                </div>
            </main>
        </div>
    );
}
