'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImage } from '@/lib/placeholder-data';

export default function ForgotPasswordPage() {
    const forgotPasswordImage = getImage('forgot_password');
    return (
        <div className="w-full h-full lg:grid lg:grid-cols-2">
            <div className="hidden lg:flex items-center justify-center bg-muted/50 p-10">
                <div className='relative w-full h-full'>
                    <Image 
                        src={forgotPasswordImage.imageUrl}
                        alt={forgotPasswordImage.description}
                        data-ai-hint={forgotPasswordImage.imageHint}
                        fill
                        className="object-contain rounded-lg"
                    />
                </div>
            </div>
            <div className="flex items-center justify-center py-12 px-4">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-headline">Forgot Password</CardTitle>
                        <CardDescription>Enter your email to receive a password reset link.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button className="w-full">Send Reset Link</Button>
                         <div className="text-center text-sm">
                            Remember your password?{' '}
                            <Button variant="link" asChild className="px-0">
                                <Link href="/login/student">Sign In</Link>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
