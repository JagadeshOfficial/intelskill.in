
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
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { getImage } from '@/lib/placeholder-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

type RegistrationStep = 'email-verification' | 'otp-verification' | 'details' | 'success';

export default function StudentRegisterPage() {
  const studentRegisterImage = getImage('register_student');
  const router = useRouter();

  const [step, setStep] = useState<RegistrationStep>('email-verification');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/student/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (!response.ok || !data.success) { setError(data.message || 'Failed to send OTP'); return; }
      setSuccess('OTP sent to your email. Check spam folder if not found.');
      setStep('otp-verification');
    } catch (err) {
      console.error(err); setError('Network error. Please try again.');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/student/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      const data = await response.json();
      if (!response.ok || !data.success) { setError(data.message || 'OTP verification failed'); return; }
      setSuccess('Email verified successfully!'); setStep('details');
    } catch (err) { console.error(err); setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setError(''); setSuccess(''); setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/student/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (!response.ok || !data.success) { setError(data.message || 'Failed to resend OTP'); return; }
      setSuccess('OTP resent to your email.');
    } catch (err) { console.error(err); setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/student/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) { setError(data.message || 'Registration failed'); return; }
      setStep('success');
    } catch (err) { console.error(err); setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full h-full lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center bg-muted/50 p-10">
        <div className='relative w-full h-full'>
          <Image 
            src={studentRegisterImage.imageUrl}
            alt={studentRegisterImage.description}
            data-ai-hint={studentRegisterImage.imageHint}
            fill
            className="object-contain rounded-lg"
          />
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Create a Student Account</CardTitle>
            <CardDescription>Join our learning community and start your journey today.</CardDescription>
          </CardHeader>

          {step === 'email-verification' && (
            <form onSubmit={handleSendOtp}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" name="email" placeholder="student@example.com" value={formData.email} onChange={handleInputChange} required />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Send OTP</Button>
                <div className="text-center text-sm">Already have an account? <Button variant="link" asChild className="px-0"><Link href="/login/student">Sign In</Link></Button></div>
              </CardFooter>
            </form>
          )}

          {step === 'otp-verification' && (
            <form onSubmit={handleVerifyOtp}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-muted-foreground">Enter the 6-digit OTP sent to {formData.email}</p>
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP *</Label>
                  <Input id="otp" name="otp" type="text" maxLength={6} placeholder="000000" value={formData.otp} onChange={handleInputChange} required />
                </div>
                <Button type="button" variant="outline" className="w-full" onClick={() => { setStep('email-verification'); setFormData({ ...formData, otp: '' }); }}>Change Email</Button>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Verify OTP</Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleResendOtp} disabled={loading}>Resend OTP</Button>
              </CardFooter>
            </form>
          )}

          {step === 'details' && (
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" name="firstName" placeholder="Jane" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" name="lastName" placeholder="Smith" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input id="phoneNumber" name="phoneNumber" placeholder="Optional" value={formData.phoneNumber} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Register as Student</Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => { setStep('otp-verification'); setError(''); }}>Back</Button>
              </CardFooter>
            </form>
          )}

          {step === 'success' && (
            <>
              <CardContent className="space-y-4 text-center">
                <div className="flex justify-center"><CheckCircle className="h-16 w-16 text-green-600" /></div>
                <h3 className="text-xl font-semibold">Registration Successful!</h3>
                <p className="text-muted-foreground">Your student account has been created. You can log in now.</p>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button className="w-full" asChild>
                  <Link href="/login/student">Go to Login</Link>
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
