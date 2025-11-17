

'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImage } from '@/lib/placeholder-data';
import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export default function AdminLoginPage() {
    const adminLoginImage = getImage('login_admin');
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
            // Call backend auth service
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/admin/login`, {
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

            // Store token and admin info in localStorage
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminId', data.id);
            localStorage.setItem('adminEmail', data.email);
            localStorage.setItem('adminRole', data.role);
            // Persist name parts returned from backend
            if (data.firstName) localStorage.setItem('adminFirstName', data.firstName);
            if (data.lastName) localStorage.setItem('adminLastName', data.lastName);

            // Fetch profile to get extra fields (photoUrl, mobileNumber, timestamps)
            try {
              const profileRes = await fetch(`${API_BASE_URL}/api/v1/auth/admin/me`, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.token}`,
                }
              });
              if (profileRes.ok) {
                const profile = await profileRes.json();
                if (profile.photoUrl) localStorage.setItem('adminPhotoUrl', profile.photoUrl);
                if (profile.mobileNumber) localStorage.setItem('adminMobileNumber', profile.mobileNumber);
                if (profile.lastLogin) localStorage.setItem('adminLastLogin', JSON.stringify(profile.lastLogin));
              }
            } catch (err) {
              // ignore profile fetch errors; login succeeded
              console.warn('Failed to fetch admin profile after login', err);
            }

            // Redirect to admin dashboard
            router.push('/admin/dashboard');
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-muted/50 p-10">
        <div className='relative w-full h-96'>
             <Image 
                src={adminLoginImage.imageUrl}
                alt={adminLoginImage.description}
                data-ai-hint={adminLoginImage.imageHint}
                fill
                className="object-contain rounded-lg"
            />
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Admin Sign In</CardTitle>
            <CardDescription>Enter your administrator credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="text-red-600 mt-0.5 h-5 w-5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@example.com"
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
              <Button 
                type="submit"
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
