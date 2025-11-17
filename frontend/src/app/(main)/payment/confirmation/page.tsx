

'use client'

import { Suspense } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCourseById, getImage, type Course } from '@/lib/placeholder-data';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


function ConfirmationContent() {
    const searchParams = useSearchParams();
    const courseId = searchParams.get('courseId');
    const course = courseId ? getCourseById(courseId) : undefined;
    const confirmationImage = getImage('order_confirmation');

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Invalid confirmation. Please check your email for enrollment details or contact support.
                    </AlertDescription>
                </Alert>
                <Button asChild className="mt-4">
                    <a href="/courses">Back to Courses</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <div className="grid lg:grid-cols-2 max-w-4xl w-full gap-8 items-center">
                 <div className="relative h-64 lg:h-full w-full rounded-lg overflow-hidden order-last lg:order-first">
                    <Image
                        src={confirmationImage.imageUrl}
                        alt={confirmationImage.description}
                        data-ai-hint={confirmationImage.imageHint}
                        fill
                        className="object-cover"
                    />
                </div>
                <Card className="w-full text-center">
                    <CardHeader className="items-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <CardTitle className="text-3xl font-headline">Enrollment Confirmed!</CardTitle>
                        <CardDescription className="max-w-sm mx-auto">
                            You have successfully enrolled in <strong>{course.title}</strong>. A confirmation has been sent to your email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg">
                            Get ready to start your learning journey!
                        </p>
                    </CardContent>
                    <CardContent>
                        <Button asChild size="lg">
                            <Link href="/student/dashboard">Start Learning</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading confirmation...</div>}>
            <ConfirmationContent />
        </Suspense>
    )
}
