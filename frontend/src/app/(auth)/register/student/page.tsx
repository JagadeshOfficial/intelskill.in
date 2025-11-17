
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getImage } from '@/lib/placeholder-data';

export default function StudentRegisterPage() {
    const studentRegisterImage = getImage('register_student');
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="student@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button className="w-full">Create Account</Button>
            <div className="text-center text-sm">
              Already have an account?{' '}
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
