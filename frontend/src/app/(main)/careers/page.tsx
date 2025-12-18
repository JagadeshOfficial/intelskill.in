"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Briefcase, Globe, Users, Zap, Building, GraduationCap, Upload, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { storage, db, auth } from "@/lib/firebase";

export default function CareersPage() {
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        expertise: '',
        experience: '',
        portfolio: '',
        whyJoin: '',
        resumeUrl: ''
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!mounted) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            console.log("Attempting to sign in anonymously...");
            const userCred = await signInAnonymously(auth);
            console.log("User signed in anonymously:", userCred.user.uid);

            let downloadUrl = "";
            if (resumeFile) {
                const storageRef = ref(storage, `resumes/${Date.now()}_${resumeFile.name}`);
                const uploadTask = await uploadBytesResumable(storageRef, resumeFile);
                downloadUrl = await getDownloadURL(uploadTask.ref);
            }

            const payload = { ...formData, resumeUrl: downloadUrl };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/tutor-applications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to submit to backend");

            const data = await res.json();

            await addDoc(collection(db, "tutor_applications"), {
                ...payload,
                status: 'PENDING',
                createdAt: serverTimestamp(),
                backendId: data.id
            });

            toast({
                title: "Application Submitted Successfully!",
                description: "Check your email for confirmation. We will review your application soon.",
            });
            setFormData({ firstName: '', lastName: '', email: '', phone: '', expertise: '', experience: '', portfolio: '', whyJoin: '', resumeUrl: '' });
            setResumeFile(null);

        } catch (error: any) {
            console.error(error);
            // Alert the exact error so we can stop guessing
            alert("FIREBASE ERROR: " + error.message);
            toast({
                title: "Submission Failed",
                description: "There was an error submitting your application. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-slate-900 text-white">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[120px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>

                <div className="container mx-auto max-w-7xl relative z-10 text-center">
                    <Badge className="mb-6 bg-blue-500/20 text-blue-200 border-blue-500/30 px-4 py-1.5 text-sm font-medium rounded-full backdrop-blur-sm">
                        We are hiring instructors
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
                        Share Your Knowledge.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Inspire the Future.</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join a world-class team of educators and help shape the next generation of developers.
                        Flexible schedules, global reach, and competitive compensation.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 rounded-full font-bold shadow-xl shadow-white/10" onClick={() => document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth' })}>
                            Apply Now
                        </Button>
                    </div>
                </div>
            </section>

            {/* Trusted By Strip */}
            <div className="py-10 bg-white border-b border-slate-100">
                <div className="container mx-auto max-w-7xl px-6">
                    <p className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">
                        Our instructors come from top companies
                    </p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Simple Text Logos for specific tech companies as requested by "best logos" context */}
                        {['Google', 'Microsoft', 'Amazon', 'Netflix', 'Meta', 'Spotify'].map(company => (
                            <div key={company} className="flex items-center gap-2 group cursor-default">
                                <Building className="w-6 h-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                <span className="text-xl font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{company}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Why Join Section */}
            <section className="py-24 px-6 bg-white">
                <div className="container mx-auto max-w-7xl">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Why Teach with LearnFlow?</h2>
                        <p className="text-lg text-slate-600">We provide the platform, the tools, and the audience. You bring the expertise.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: <Globe className="w-10 h-10 text-blue-600" />,
                                title: "Global Reach",
                                desc: "Your content reaches students in over 150 countries. Impact lives across the globe from your home office."
                            },
                            {
                                icon: <Zap className="w-10 h-10 text-amber-500" />,
                                title: "Earn Revenue",
                                desc: "Get paid for every student who enrolls in your course. Top instructors earn over $100k annually."
                            },
                            {
                                icon: <Users className="w-10 h-10 text-indigo-600" />,
                                title: "Vibrant Community",
                                desc: "Join an exclusive community of expert instructors. Network, collaborate, and grow together."
                            }
                        ].map((feature, i) => (
                            <Card key={i} className="border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                <CardHeader>
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                                        {feature.icon}
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Application Form Section */}
            <section id="apply-form" className="py-24 px-6 bg-slate-50 relative overflow-hidden">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">

                        {/* Left Column: Context */}
                        <div className="space-y-8 sticky top-24">
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                                Ready to start your journey?
                            </h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Fill out the form to apply as an instructor. We review every application carefully to ensure the highest quality of education for our students.
                            </p>

                            <div className="space-y-6 pt-6">
                                {[
                                    "Complete your profile details",
                                    "Share your professional experience",
                                    "Briefly describe your course idea",
                                    "Our team reviews your application within 48h"
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                            {i + 1}
                                        </div>
                                        <span className="text-slate-700 font-medium">{step}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-indigo-900 text-white rounded-2xl mt-10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:bg-white/20 transition-all"></div>
                                <h3 className="text-xl font-bold mb-2">Need help?</h3>
                                <p className="text-indigo-200 mb-4 text-sm">Contact our support team for any questions regarding the application process.</p>
                                <Button variant="outline" size="sm" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                                    Contact Support
                                </Button>
                            </div>
                        </div>

                        {/* Right Column: Form */}
                        <Card className="border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            <CardHeader className="p-8 pb-0">
                                <CardTitle className="text-2xl font-bold text-slate-900">Instructor Application</CardTitle>
                                <CardDescription>Tell us about yourself and your expertise.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                placeholder="John"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                placeholder="Doe"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                placeholder="+1 (555) 000-0000"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="expertise">Area of Expertise</Label>
                                        <Input
                                            id="expertise"
                                            name="expertise"
                                            placeholder="e.g. Web Development, Data Science, Digital Marketing"
                                            value={formData.expertise}
                                            onChange={handleChange}
                                            required
                                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="experience">Teaching Experience (Years)</Label>
                                        <Input
                                            id="experience"
                                            name="experience"
                                            type="number"
                                            placeholder="e.g. 5"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="resume">Resume / CV (PDF)</Label>
                                        <div className="relative">
                                            <Upload className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                            <Input
                                                id="resume"
                                                name="resume"
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11 pt-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="portfolio">Portfolio / LinkedIn URL</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                            <Input
                                                id="portfolio"
                                                name="portfolio"
                                                placeholder="https://linkedin.com/in/..."
                                                value={formData.portfolio}
                                                onChange={handleChange}
                                                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors h-11"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="whyJoin">Why do you want to join?</Label>
                                        <Textarea
                                            id="whyJoin"
                                            name="whyJoin"
                                            placeholder="Tell us about your passion for teaching..."
                                            value={formData.whyJoin}
                                            onChange={handleChange}
                                            className="min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white transition-colors resize-none"
                                        />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Submitting...
                                            </div>
                                        ) : (
                                            <>
                                                Submit Application <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-center text-slate-500 mt-4">
                                        By clicking submit, you agree to our Terms of Service and Privacy Policy.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

        </div>
    );
}
