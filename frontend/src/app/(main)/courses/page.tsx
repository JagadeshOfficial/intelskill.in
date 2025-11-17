import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, ArrowRight, DollarSign } from 'lucide-react';
import { coursesData } from '@/lib/placeholder-data';
import type { Course } from '@/lib/placeholder-data';

function CourseCard({ course }: { course: Course }) {
  const badgeVariants = {
    Beginner: 'default',
    Intermediate: 'secondary',
    Advanced: 'destructive',
  } as const;

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={course.image.imageUrl}
            alt={course.image.description}
            data-ai-hint={course.image.imageHint}
            fill
            className="object-cover"
          />
           <div className="absolute top-4 right-4">
             <Badge variant={badgeVariants[course.level] || 'default'}>
              {course.level}
            </Badge>
           </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <CardTitle className="font-headline text-xl mb-3">{course.title}</CardTitle>
        <CardDescription className="mb-4">{course.description}</CardDescription>
        <div className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{course.lessons} Lessons</span>
            </div>
             <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-6 pt-0">
         <div className='w-full flex justify-between items-center border-t pt-4'>
             <div className='flex items-center gap-2'>
                <DollarSign className="h-5 w-5 text-primary"/>
                <p className='text-2xl font-bold font-headline text-primary'>${course.price}</p>
             </div>
            <Button asChild className="group">
              <Link href={`/courses/${course.id}`}>
                Enroll Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}


export default function CoursesPage() {
  return (
    <div className="bg-muted/20">
      <section className="bg-muted/50 border-b">
        <div className="container mx-auto py-16 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter mb-4">
                Our Course Catalog
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From beginner fundamentals to advanced specializations, find the perfect course to advance your skills and career.
            </p>
        </div>
       </section>

      <div className="container mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coursesData.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}
