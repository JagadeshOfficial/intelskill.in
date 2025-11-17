

'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImage } from '@/lib/placeholder-data';

export default function TutorLoginPage() {
    const tutorLoginImage = getImage('login_tutor');
    const router = useRouter();

    const handleSignIn = () => {
        // In a real app, you'd perform authentication here
        router.push('/tutor/dashboard');
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tutor@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
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
            <Button className="w-full" onClick={handleSignIn}>Sign In</Button>
             <div className="text-center text-sm">
                Don't have an account?{' '}
                <Button variant="link" asChild className="px-0">
                    <Link href="/register/tutor">Register</Link>
                </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
