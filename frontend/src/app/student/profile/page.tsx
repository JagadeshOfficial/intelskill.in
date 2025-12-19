"use client"

import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AuthAvatar from "@/components/layout/auth-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, User, Mail, Shield, Smartphone, Save, Settings, CheckCircle2, Lock } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

// Helper to convert LocalDateTime array to ISO string or readable date
function formatLocalDateTime(dateArray: any): string {
    if (!dateArray) return '';
    if (typeof dateArray === 'string') {
        const d = new Date(dateArray);
        return isNaN(d.getTime()) ? '' : d.toLocaleString();
    }
    if (Array.isArray(dateArray) && dateArray.length >= 5) {
        const [year, month, day, hour, minute, second = 0] = dateArray;
        const date = new Date(year, month - 1, day, hour, minute, second);
        return date.toLocaleString();
    }
    return '';
}

export default function StudentProfilePage() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    // Password state
    const [pwOpen, setPwOpen] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [profile, setProfile] = useState({
        id: "",
        email: "",
        firstName: "",
        lastName: "",
        mobileNumber: '',
        photoUrl: '',
        role: "STUDENT",
        status: "",
        createdAt: "",
        updatedAt: "",
        lastLogin: ""
    });

    const fetchProfile = async () => {
        const token = localStorage.getItem('studentToken');
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/student/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    id: data.id || '',
                    email: data.email || '',
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    mobileNumber: data.mobileNumber || '',
                    photoUrl: data.photoUrl || '',
                    role: "STUDENT",
                    status: data.status || '',
                    createdAt: data.createdAt || '',
                    updatedAt: data.updatedAt || '',
                    lastLogin: data.lastLogin || ''
                });

                localStorage.setItem('studentFirstName', data.firstName || '');
                localStorage.setItem('studentLastName', data.lastName || '');
                localStorage.setItem('studentPhotoUrl', data.photoUrl || '');
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('studentToken') : null;
        if (!token) {
            setError('Not authenticated');
            setLoading(false);
            return;
        }

        fetchProfile().finally(() => setLoading(false));
    }, []);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const token = localStorage.getItem('studentToken');
        if (!token) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_BASE_URL}/api/v1/student/me/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Failed to upload image");
            }

            const data = await res.json();
            setProfile(prev => ({ ...prev, photoUrl: data.photoUrl }));

            toast({
                title: "Success",
                description: "Profile picture updated successfully.",
            });

            localStorage.setItem('studentPhotoUrl', data.photoUrl);

        } catch (err: any) {
            toast({
                title: "Upload failed",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setUpdating(true);
        const token = localStorage.getItem('studentToken');
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/student/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    photoUrl: profile.photoUrl,
                    phoneNumber: profile.mobileNumber
                })
            });

            if (!res.ok) throw new Error("Failed to save profile changes");

            toast({
                title: "Profile Updated",
                description: "Your information has been saved successfully.",
            });
            await fetchProfile();
        } catch (err: any) {
            toast({
                title: "Update failed",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
            return;
        }

        const token = localStorage.getItem('studentToken');
        if (!token) return;

        setPwLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/student/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword: passwords.new
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to update password");

            setPwOpen(false);
            setPasswords({ current: '', new: '', confirm: '' });
            toast({
                title: "Success",
                description: "Your password has been updated successfully.",
            });
        } catch (err: any) {
            toast({
                title: "Update failed",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setPwLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[500px]">
            <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
        </div>
    );

    if (error) return (
        <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-xl">
            <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <Button className="rounded-xl w-full" onClick={() => window.location.href = '/login'}>Return to Login</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAFBFC] p-4 md:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">
                            <Settings className="h-3.5 w-3.5" /> Account Management
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Student Profile</h1>
                        <p className="text-slate-500 text-lg font-medium">Manage your personal information and account security.</p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={updating || uploading}
                        className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-200"
                    >
                        {updating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Save Changes
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN */}
                    <aside className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden p-8">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="relative group/avatar">
                                    <Avatar className="h-40 w-40 border-8 border-slate-50 shadow-inner bg-slate-100 overflow-hidden transition-all duration-500 group-hover:border-slate-100">
                                        {profile.photoUrl ? (
                                            <AuthAvatar photoKey={profile.photoUrl} alt="Student" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-slate-900 text-white font-black text-6xl">
                                                {profile.firstName?.[0]}
                                            </div>
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                                                <Loader2 className="h-8 w-8 text-black animate-spin mb-1" />
                                                <span className="text-[8px] font-black uppercase">Switching...</span>
                                            </div>
                                        )}
                                    </Avatar>
                                    <button
                                        onClick={handleFileClick}
                                        disabled={uploading}
                                        className="absolute bottom-2 right-2 p-3 bg-white text-slate-900 rounded-full shadow-2xl hover:bg-slate-50 transition-all border border-slate-100"
                                    >
                                        <Camera className="h-5 w-5" />
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-slate-900 capitalize">{profile.firstName} {profile.lastName}</h2>
                                    <div className="flex items-center justify-center gap-2">
                                        <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{profile.role}</Badge>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {profile.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full pt-6 border-t border-slate-50 space-y-4">
                                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-600 truncate">{profile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                                        <Smartphone className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-600 truncate">{profile.mobileNumber || "No Phone"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Account Activity</h4>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member Since</p>
                                    <p className="text-lg font-bold">{formatLocalDateTime(profile.createdAt).split(',')[0]}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Last Login</p>
                                    <p className="text-lg font-bold">{formatLocalDateTime(profile.lastLogin).split(',')[0] || 'Recently'}</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT COLUMN */}
                    <main className="lg:col-span-8 space-y-8">
                        <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 md:p-14">
                            <h3 className="text-2xl font-black text-slate-900 mb-10">Personal Details</h3>

                            <div className="grid md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</Label>
                                    <Input
                                        value={profile.firstName}
                                        onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                                        className="h-14 bg-slate-50/50 border-slate-100 focus:bg-white focus:border-slate-900 transition-all rounded-2xl px-6 text-slate-900 font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</Label>
                                    <Input
                                        value={profile.lastName}
                                        onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                                        className="h-14 bg-slate-50/50 border-slate-100 focus:bg-white focus:border-slate-900 transition-all rounded-2xl px-6 text-slate-900 font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</Label>
                                    <Input
                                        value={profile.mobileNumber}
                                        onChange={e => setProfile({ ...profile, mobileNumber: e.target.value })}
                                        className="h-14 bg-slate-50/50 border-slate-100 focus:bg-white focus:border-slate-900 transition-all rounded-2xl px-6 text-slate-900 font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Student ID</Label>
                                    <div className="h-14 flex items-center px-6 bg-slate-100/30 border border-slate-100 rounded-2xl text-slate-400 font-mono text-xs">
                                        #{profile.id}
                                    </div>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div className="mt-20 pt-10 border-t border-slate-50">
                                <div className="flex items-center gap-3 mb-8">
                                    <Shield className="h-5 w-5 text-slate-900" />
                                    <h4 className="text-xl font-black text-slate-900">Security & Credentials</h4>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Password Dialog */}
                                    <Dialog open={pwOpen} onOpenChange={setPwOpen}>
                                        <DialogTrigger asChild>
                                            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 cursor-pointer">
                                                <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 transition-all group-hover:bg-slate-900 group-hover:text-white">
                                                    <Lock className="h-5 w-5" />
                                                </div>
                                                <h5 className="font-black text-slate-900 mb-2">Password Update</h5>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">Secure your account by regularly updating your access key.</p>
                                                <span className="text-slate-900 font-black text-xs uppercase tracking-widest group-hover:underline flex items-center gap-2">Update Now →</span>
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] rounded-[32px] p-8">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-black">Change Password</DialogTitle>
                                                <DialogDescription className="font-medium text-slate-500">
                                                    Enter your current password to authorize this update.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handlePasswordUpdate} className="space-y-6 pt-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest">Current Password</Label>
                                                    <Input
                                                        type="password"
                                                        className="h-12 rounded-xl bg-slate-50 border-none"
                                                        value={passwords.current}
                                                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest">New Password</Label>
                                                    <Input
                                                        type="password"
                                                        className="h-12 rounded-xl bg-slate-50 border-none"
                                                        value={passwords.new}
                                                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest">Confirm New Password</Label>
                                                    <Input
                                                        type="password"
                                                        className="h-12 rounded-xl bg-slate-50 border-none"
                                                        value={passwords.confirm}
                                                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <DialogFooter className="pt-4">
                                                    <Button type="submit" disabled={pwLoading} className="w-full h-14 rounded-2xl bg-black font-black uppercase tracking-widest text-xs">
                                                        {pwLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize Change"}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    {/* MFA Section */}
                                    <div
                                        onClick={() => toast({ title: "Setup App", description: "Multi-Factor Authentication module is currently under maintenance.", variant: "default" })}
                                        className="p-8 rounded-3xl bg-slate-50 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100 cursor-pointer"
                                    >
                                        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 transition-all group-hover:bg-blue-600 group-hover:text-white">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <h5 className="font-black text-slate-900 mb-2">Authenticator App</h5>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">Add an extra layer of protection with 2FA verification.</p>
                                        <span className="text-slate-900 font-black text-xs uppercase tracking-widest group-hover:underline">Setup App →</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 flex items-center justify-center text-center">
                            <p className="text-sm font-bold text-slate-400">
                                All profile data is managed in accordance with our internal security protocols.
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
