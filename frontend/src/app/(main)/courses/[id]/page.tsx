import { notFound } from 'next/navigation';
import { getCourseById, type Course } from '@/lib/placeholder-data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, DollarSign, CheckCircle, Video, FileText } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

function CourseSidebar({ course }: { course: Course }) {
  return (
    <div className="sticky top-24">
      <Card className="overflow-hidden shadow-lg">
        <div className="relative aspect-video">
          <Image
            src={course.image.imageUrl}
            alt={course.image.description}
            data-ai-hint={course.image.imageHint}
            fill
            className="object-cover"
          />
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-6 w-6 text-primary" />
            <p className="text-3xl font-bold font-headline text-primary">${course.price}</p>
          </div>
          <Button size="lg" className="w-full" asChild>
            <Link href={`/payment?courseId=${course.id}`}>Enroll Now</Link>
          </Button>
          <ul className="text-sm text-muted-foreground space-y-3 mt-6">
            <li className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span><span className="font-bold text-foreground">{course.lessons}</span> lessons</span>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <span><span className="font-bold text-foreground">{course.duration}</span> total hours</span>
            </li>
            <li className="flex items-center gap-3">
              <Badge variant={course.level === 'Beginner' ? 'default' : course.level === 'Intermediate' ? 'secondary' : 'destructive'} className='capitalize'>
                {course.level}
              </Badge>
              <span>Skill level</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = getCourseById(params.id);

  if (!course) {
    notFound();
  }

  return (
    <div className="bg-muted/20">
      <header className="bg-background border-b">
        <div className="container mx-auto py-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tighter max-w-3xl">{course.title}</h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-3xl">{course.description}</p>
        </div>
      </header>

      <div className="container mx-auto py-12 grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
        <main className="lg:col-span-2 space-y-12">
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">About this course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{course.longDescription}</p>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">What you'll learn</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                  {course.learnPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Course content</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {course.curriculum.map((module, i) => (
                    <AccordionItem value={`item-${i}`} key={i}>
                      <AccordionTrigger className="font-semibold text-lg">{module.module}</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-3">
                          {module.lessons.map((lesson, j) => (
                            <li key={j} className="flex items-center justify-between text-muted-foreground">
                              <div className="flex items-center gap-3">
                                {lesson.duration.includes('h') ? <Video className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                <span>{lesson.title}</span>
                              </div>
                              <span className="text-sm">{lesson.duration}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Tools you'll learn</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                {course.tools.map((tool, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                    <tool.icon className="h-6 w-6" />
                    <span className="font-semibold">{tool.name}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </main>
        <aside>
          <CourseSidebar course={course} />
        </aside>
      </div>
    </div>
  );
}
