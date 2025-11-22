
"use client"

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AuthAvatar from "@/components/layout/auth-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

// Helper to convert LocalDateTime array to ISO string or readable date
function formatLocalDateTime(dateArray: any): string {
    if (!dateArray) return '';
    if (typeof dateArray === 'string') {
        return new Date(dateArray).toLocaleString();
    }
    // Handle array format [year, month, day, hour, minute, second?, nanoOfSecond?]
    if (Array.isArray(dateArray) && dateArray.length >= 5) {
        const [year, month, day, hour, minute, second = 0] = dateArray;
        const date = new Date(year, month - 1, day, hour, minute, second);
        return date.toLocaleString();
    }
    return '';
}

export default function AdminProfilePage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profile, setProfile] = useState({
        id: "",
        email: "",
        firstName: "",
        lastName: "",
        mobileNumber: '',
        photoUrl: '',
        role: "",
        status: "",
        createdAt: "",
        updatedAt: "",
        lastLogin: ""
    });

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }

        fetch(`${API_BASE_URL}/api/v1/auth/admin/me`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || 'Failed to load profile');
                }
                return res.json();
            })
            .then((data) => {
                setProfile({
                    id: data.id || '',
                    email: data.email || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    mobileNumber: data.mobileNumber || '',
                    photoUrl: data.photoUrl || '',
                    role: data.role || '',
                    status: data.status || '',
                    createdAt: data.createdAt || '',
                    updatedAt: data.updatedAt || '',
                    lastLogin: data.lastLogin || ''
                });

                // Mirror some profile fields in localStorage so header and other components can read them
                try {
                    if (data.firstName) localStorage.setItem('adminFirstName', data.firstName);
                    if (data.lastName) localStorage.setItem('adminLastName', data.lastName);
                    if (data.email) localStorage.setItem('adminEmail', data.email);
                    if (data.photoUrl) localStorage.setItem('adminPhotoUrl', data.photoUrl);
                    if (data.mobileNumber) localStorage.setItem('adminMobileNumber', data.mobileNumber);
                    if (data.lastLogin) localStorage.setItem('adminLastLogin', JSON.stringify(data.lastLogin));
                } catch (e) {
                    // ignore localStorage errors
                }
            })
            .catch((err) => {
                console.error('Profile load error:', err);
                setError(err.message || 'Failed to load profile');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading profile...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="space-y-8">
       <header>
        <h1 className="text-4xl font-bold font-headline tracking-tighter">My Profile</h1>
        <p className="text-lg text-muted-foreground mt-2">
          View and manage your account details and settings.
        </p>
      </header>

      <main className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your admin account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="id">Admin ID</Label>
                        <Input id="id" value={profile.id || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={profile.email || ''} disabled />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input id="role" value={profile.role || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Input id="status" value={profile.status || ''} disabled />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your name and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        {profile.photoUrl ? (
                            <>
                              <AuthAvatar photoKey={profile.photoUrl} alt="User Avatar" />
                              <AvatarFallback>U</AvatarFallback>
                            </>
                        ) : (
                            <>
                              <AuthAvatar src="https://picsum.photos/seed/learnflow-user/80/80" alt="User Avatar" />
                              <AvatarFallback>U</AvatarFallback>
                            </>
                        )}
                    </Avatar>
                    <Button variant="outline">Change Picture</Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={profile.firstName || ''} onChange={(e) => setProfile({...profile, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={profile.lastName || ''} onChange={(e) => setProfile({...profile, lastName: e.target.value})} />
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

        <div className="flex justify-end">
            <Button>Save Changes</Button>
        </div>
      </main>
    </div>
  );
}
