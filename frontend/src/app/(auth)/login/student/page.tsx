

'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImage } from '@/lib/placeholder-data';
import { Loader2, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export default function StudentLoginPage() {
  const studentLoginImage = getImage('login_student');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Login failed');
        return;
      }
      // store student info
      localStorage.setItem('studentToken', data.token);
      localStorage.setItem('studentFirstName', data.firstName || '');
      localStorage.setItem('studentLastName', data.lastName || '');
      localStorage.setItem('studentEmail', data.email || '');
      localStorage.setItem('studentPhotoUrl', data.photoUrl || '');
      // Ensure navigation completes; use replace and fallback to window.location if necessary
      try {
        await router.replace('/student/dashboard');
      } catch (navErr) {
        // fallback to full reload navigation
        window.location.href = '/student/dashboard';
      }
    } catch (e) {
      console.error(e);
      setError('Network error. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="w-full h-full lg:grid lg:grid-cols-2">
        <div className="hidden lg:flex items-center justify-center bg-muted/50 p-10">
            <div className='relative w-full h-full'>
                <Image 
                    src={studentLoginImage.imageUrl}
                    alt={studentLoginImage.description}
                    data-ai-hint={studentLoginImage.imageHint}
                    fill
                    className="object-contain rounded-lg"
                />
            </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Student Sign In</CardTitle>
            <CardDescription>Welcome back! Sign in to continue your learning journey.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-red-600 flex items-center gap-2"><AlertCircle className="h-4 w-4"/>{error}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="student@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
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
            <Button className="w-full" onClick={handleSignIn} disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Sign In</Button>
            <div className="text-center text-sm">
                Don't have an account?{' '}
                <Button variant="link" asChild className="px-0">
                    <Link href="/register/student">Register</Link>
                </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
