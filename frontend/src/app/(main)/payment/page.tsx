
'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, notFound, useRouter } from 'next/navigation';
import { getCourseById, getImage, type Course } from '@/lib/placeholder-data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Lock, Calendar, AlertCircle, User, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Link from 'next/link';

function PaymentForm({ course }: { course: Course }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // For now, we'll assume the user is not logged in.
  // In a real app, you would check the user's authentication state.
  const isLoggedIn = false;

  const handlePayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
        setShowAuthDialog(true);
        return;
    }

    toast({
      title: "Processing Payment...",
      description: "Please wait while we securely process your transaction.",
    });

    // Simulate payment processing
    setTimeout(() => {
      router.push(`/payment/confirmation?courseId=${course.id}`);
    }, 2000);
  };

  return (
    <>
      <form onSubmit={handlePayment} className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="card-number">Card Number</Label>
          <div className="relative">
            <Input id="card-number" placeholder="0000 0000 0000 0000" required />
            <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="expiry-date">Expiry Date</Label>
            <div className="relative">
              <Input id="expiry-date" placeholder="MM / YY" required />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cvc">CVC</Label>
            <div className="relative">
              <Input id="cvc" placeholder="CVC" required />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full">
          Pay ${course.price}
        </Button>
      </form>

      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create an Account to Continue</AlertDialogTitle>
            <AlertDialogDescription>
              To complete your enrollment, please sign in to your student account or create a new one.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-row sm:justify-center gap-2 pt-4">
            <AlertDialogAction asChild className="w-full">
                <Link href="/login/student">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                </Link>
            </AlertDialogAction>
            <AlertDialogCancel asChild className="w-full mt-0">
                <Link href="/register/student">
                    <User className="mr-2 h-4 w-4" />
                    Create Account
                </Link>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const course = courseId ? getCourseById(courseId) : undefined;
  const paymentImage = getImage('payment_gateway');

  if (!course) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                Course not found. Please go back to the courses page and select a course.
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
      <div className="grid lg:grid-cols-2 max-w-6xl w-full gap-8 lg:gap-16 items-center">
        <div className="hidden lg:block relative aspect-square rounded-lg overflow-hidden">
          <Image 
            src={paymentImage.imageUrl}
            alt={paymentImage.description}
            data-ai-hint={paymentImage.imageHint}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-3xl font-bold font-headline">Secure Checkout</h2>
            <p className="text-lg">Your information is safe with us.</p>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Complete Your Enrollment</CardTitle>
            <CardDescription>You are enrolling in <strong>{course.title}</strong>.</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentForm course={course} />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                <span>Secure SSL encryption. Your payment details are protected.</span>
            </div>
            <p>By clicking "Pay", you agree to our Terms of Service.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}


export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentPageContent />
        </Suspense>
    )
}
