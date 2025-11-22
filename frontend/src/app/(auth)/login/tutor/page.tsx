'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import { getImage } from '@/lib/placeholder-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export default function TutorLoginPage() {
    const tutorLoginImage = getImage('login_tutor');
    const router = useRouter();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/tutor/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.message || 'Login failed. Please try again.');
                setLoading(false);
                return;
            }

            // Store token and tutor info in localStorage
            localStorage.setItem('tutorToken', data.token);
            localStorage.setItem('tutorId', data.id);
            localStorage.setItem('tutorEmail', data.email);
            localStorage.setItem('tutorFirstName', data.firstName);
            localStorage.setItem('tutorLastName', data.lastName);

            // Redirect to tutor dashboard
            router.push('/tutor/dashboard');
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
            console.error('Login error:', err);
            setLoading(false);
        }
    }

    return (
        <div className="w-full h-full lg:grid lg:grid-cols-2">
            <div className="hidden lg:flex items-center justify-center bg-muted/50 p-10">
                <div className='relative w-full h-full'>
                    <Image 
                        src={tutorLoginImage.imageUrl}
                        alt={tutorLoginImage.description}
                        data-ai-hint={tutorLoginImage.imageHint}
                        fill
                        className="object-contain rounded-lg"
                    />
                </div>
            </div>
            <div className="flex items-center justify-center py-12 px-4">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-headline">Tutor Sign In</CardTitle>
                        <CardDescription>Enter your credentials to access the tutor portal.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSignIn}>
                        <CardContent className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="tutor@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="text-right">
                                <Button variant="link" asChild className="px-0">
                                    <Link href="/forgot-password">
                                        Forgot password?
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                            <div className="text-center text-sm">
                                Don't have an account?{' '}
                                <Button variant="link" asChild className="px-0">
                                    <Link href="/register/tutor">Register</Link>
                                </Button>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
