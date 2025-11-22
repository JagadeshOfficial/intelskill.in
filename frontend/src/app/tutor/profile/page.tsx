
"use client"

import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AuthAvatar from "@/components/layout/auth-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

function formatLocalDateTime(dateArray: any): string {
        if (!dateArray) return '';
        if (typeof dateArray === 'string') return new Date(dateArray).toLocaleString();
        if (Array.isArray(dateArray) && dateArray.length >= 5) {
                const [year, month, day, hour, minute, second = 0] = dateArray;
                const date = new Date(year, month - 1, day, hour, minute, second);
                return date.toLocaleString();
        }
        return '';
}

export default function TutorProfilePage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState<any>({
        id: '',
        email: '',
        firstName: '',
        lastName: '',
        mobileNumber: '',
        expertise: '',
        bio: '',
        qualification: '',
        experience: '',
        hourlyRate: '',
        photoUrl: '',
        status: '',
        verified: false,
        createdAt: '',
        updatedAt: '',
        lastLogin: ''
    });
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('tutorToken') : null;
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }

        fetch(`${API_BASE_URL}/api/v1/tutor/me`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to load profile');
            }
            return res.json();
        }).then((data) => {
            if (data.success === false) {
                throw new Error(data.message || 'Failed to load profile');
            }
            setProfile({
                id: data.id || '',
                email: data.email || '',
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                mobileNumber: data.mobileNumber || '',
                expertise: data.expertise || '',
                bio: data.bio || '',
                qualification: data.qualification || '',
                experience: data.experience || '',
                hourlyRate: data.hourlyRate || '',
                photoUrl: data.photoUrl || '',
                status: data.status || '',
                verified: data.verified || false,
                createdAt: data.createdAt || '',
                updatedAt: data.updatedAt || '',
                lastLogin: data.lastLogin || ''
            });

            try {
                if (data.firstName) localStorage.setItem('tutorFirstName', data.firstName);
                if (data.lastName) localStorage.setItem('tutorLastName', data.lastName);
                if (data.email) localStorage.setItem('tutorEmail', data.email);
            } catch (e) {}

        }).catch((err) => {
            console.error('Profile load error:', err);
            setError(err.message || 'Failed to load profile');
        }).finally(() => setLoading(false));
    }, []);

    async function uploadAvatar(file: File | null) {
        if (!file) return;
        const token = typeof window !== 'undefined' ? localStorage.getItem('tutorToken') : null;
        if (!token) {
            setError('Not authenticated');
            return;
        }
        setLoading(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await fetch(`${API_BASE_URL}/api/v1/tutor/me/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: form
            });
            const data = await res.json();
            if (!res.ok || data.success === false) {
                throw new Error(data.message || 'Upload failed');
            }
            setProfile((p:any) => ({...p, photoUrl: data.photoUrl}));
            if (data.photoUrl) localStorage.setItem('tutorPhotoUrl', data.photoUrl);
            alert('Avatar uploaded');
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
        } catch (err:any) {
            console.error('Upload error', err);
            setError(err.message || 'Failed to upload avatar');
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    function handleFileSelection(file: File | null) {
        if (!file) return;
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        uploadAvatar(file);
    }

    async function saveChanges() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('tutorToken') : null;
        if (!token) {
            setError('Not authenticated');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/tutor/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    phoneNumber: profile.mobileNumber,
                    expertise: profile.expertise,
                    bio: profile.bio,
                    qualification: profile.qualification,
                    experience: profile.experience,
                    hourlyRate: profile.hourlyRate,
                    photoUrl: profile.photoUrl
                })
            });
            const data = await res.json();
            if (!res.ok || data.success === false) {
                throw new Error(data.message || 'Failed to save profile');
            }
            setProfile((p:any) => ({...p, ...data}));
            try {
                if (data.firstName) localStorage.setItem('tutorFirstName', data.firstName);
                if (data.lastName) localStorage.setItem('tutorLastName', data.lastName);
                if (data.email) localStorage.setItem('tutorEmail', data.email);
                if (data.photoUrl) localStorage.setItem('tutorPhotoUrl', data.photoUrl);
            } catch (e) {}
            alert('Profile saved successfully');
        } catch (err:any) {
            console.error('Save error', err);
            setError(err.message || 'Failed to save profile');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div>Loading profile...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="space-y-8">
             <header>
                <h1 className="text-4xl font-bold font-headline tracking-tighter">My Profile</h1>
                <p className="text-lg text-muted-foreground mt-2">Manage your account details and public tutor profile.</p>
            </header>

            <main className="space-y-8">
                <Card>
                        <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>This information is private and will not be displayed on your public profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                                <div className="flex items-center gap-4">
                                       <Avatar className="h-20 w-20">
                                           {previewUrl ? (
                                               <>
                                                 <AuthAvatar src={previewUrl} alt="Preview Avatar" />
                                                 <AvatarFallback>{(profile.firstName || 'T')[0]}</AvatarFallback>
                                               </>
                                           ) : profile.photoUrl ? (
                                               <>
                                                 <AuthAvatar photoKey={profile.photoUrl} alt="Tutor Avatar" />
                                                 <AvatarFallback>{(profile.firstName || 'T')[0]}</AvatarFallback>
                                               </>
                                           ) : (
                                               <>
                                                 <AuthAvatar src="https://i.pravatar.cc/150?u=tutor" alt="Tutor Avatar" />
                                                 <AvatarFallback>{(profile.firstName || 'T')[0]}</AvatarFallback>
                                               </>
                                           )}
                                       </Avatar>
                                        <div>
                                            <input ref={fileInputRef} onChange={(e)=>handleFileSelection(e.target.files ? e.target.files[0] : null)} type="file" accept="image/*" id="avatarFileInput" className="hidden" />
                                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Change Picture</Button>
                                        </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input id="firstName" value={profile.firstName} onChange={(e)=>setProfile({...profile, firstName: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input id="lastName" value={profile.lastName} onChange={(e)=>setProfile({...profile, lastName: e.target.value})} />
                                        </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input id="email" type="email" value={profile.email} disabled />
                                        </div>
                                        <div className="space-y-2">
                                                <Label htmlFor="phone">Phone</Label>
                                                <Input id="phone" value={profile.mobileNumber} onChange={(e)=>setProfile({...profile, mobileNumber: e.target.value})} />
                                        </div>
                                </div>
                        </CardContent>
                </Card>

                 <Card>
                        <CardHeader>
                                <CardTitle>Public Tutor Profile</CardTitle>
                                <CardDescription>This information will be visible to students.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                                 <div className="space-y-2">
                                        <Label htmlFor="expertise">Area of Expertise</Label>
                                        <Input id="expertise" value={profile.expertise} onChange={(e)=>setProfile({...profile, expertise: e.target.value})} />
                                </div>
                                 <div className="space-y-2">
                                        <Label htmlFor="bio">Short Bio</Label>
                                        <Textarea id="bio" placeholder="Tell students a little bit about yourself..." value={profile.bio} onChange={(e)=>setProfile({...profile, bio: e.target.value})} />
                                </div>
                                <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                                <Label htmlFor="qualification">Qualification</Label>
                                                <Input id="qualification" value={profile.qualification} onChange={(e)=>setProfile({...profile, qualification: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                                <Label htmlFor="experience">Experience</Label>
                                                <Input id="experience" value={profile.experience} onChange={(e)=>setProfile({...profile, experience: e.target.value})} />
                                        </div>
                                        <div className="space-y-2">
                                                <Label htmlFor="hourlyRate">Hourly Rate</Label>
                                                <Input id="hourlyRate" value={profile.hourlyRate} onChange={(e)=>setProfile({...profile, hourlyRate: e.target.value})} />
                                        </div>
                                </div>
                        </CardContent>
                </Card>

                <Card>
                        <CardHeader>
                                <CardTitle>Timeline</CardTitle>
                                <CardDescription>Important dates related to your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                                <Label htmlFor="createdAt">Account Created</Label>
                                                <Input id="createdAt" value={formatLocalDateTime(profile.createdAt)} disabled />
                                        </div>
                                        <div className="space-y-2">
                                                <Label htmlFor="updatedAt">Last Updated</Label>
                                                <Input id="updatedAt" value={formatLocalDateTime(profile.updatedAt)} disabled />
                                        </div>
                                        <div className="space-y-2">
                                                <Label htmlFor="lastLogin">Last Login</Label>
                                                <Input id="lastLogin" value={formatLocalDateTime(profile.lastLogin) || 'Never'} disabled />
                                        </div>
                                </div>
                        </CardContent>
                </Card>

                <div className="flex justify-end">
                        <Button onClick={saveChanges}>Save Changes</Button>
                </div>
            </main>
        </div>
    );
}
