

'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImage } from '@/lib/placeholder-data';

export default function StudentLoginPage() {
  const studentLoginImage = getImage('login_student');
  const router = useRouter();

    const handleSignIn = () => {
        // In a real app, you'd perform authentication here
        router.push('/student/dashboard');
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
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="student@example.com" required />
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
                    <Link href="/register/student">Register</Link>
                </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
