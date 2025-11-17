import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Code, MessageSquare, ArrowRight, Star, Globe, Users, BrainCircuit } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Image from 'next/image'
import Link from 'next/link'
import { coursesData } from '@/lib/placeholder-data'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    title: 'Explore Content',
    description: 'Dive into our curated library of learning materials and resources.',
    href: '/content',
    icon: <BookOpen className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Online Compiler',
    description: 'Write, run, and debug code in real-time. Supports multiple languages with instant output.',
    href: '/compiler',
    icon: <Code className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Join Discussions',
    description: 'Engage with the community, ask questions, and share your knowledge in the forum.',
    href: '/forum',
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
  },
]

const whyChooseUs = [
    {
        icon: <BrainCircuit className="h-10 w-10 text-primary" />,
        title: 'Expert-Led Curriculum',
        description: 'Our courses are designed and taught by industry experts with years of real-world experience.'
    },
    {
        icon: <Users className="h-10 w-10 text-primary" />,
        title: 'Vibrant Community',
        description: 'Connect with peers, mentors, and instructors in our forums and collaborative projects.'
    },
    {
        icon: <Globe className="h-10 w-10 text-primary" />,
        title: 'Flexible Learning',
        description: 'Learn at your own pace, anytime, anywhere. Our platform is designed for your busy schedule.'
    }
];

const testimonials = [
    {
        name: 'Alex Johnson',
        role: 'Software Engineer',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        rating: 5,
        comment: 'LearnFlow has been a game-changer for my professional development. The content is top-notch and the community is incredibly supportive.'
    },
    {
        name: 'Maria Garcia',
        role: 'UX Designer',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e290267072',
        rating: 5,
        comment: 'The interactive compiler is fantastic for practicing front-end code. I love how everything is integrated into one platform.'
    },
    {
        name: 'Sam Chen',
        role: 'Student',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707e',
        rating: 5,
        comment: 'As a student, having access to such high-quality resources and a place to ask questions has accelerated my learning curve immensely.'
    }
]

export default function Home() {
  const featuredCourses = coursesData.slice(0, 3);
  return (
    <div className="flex flex-col min-h-full space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="py-12 md:py-24">
        <div className="container mx-auto grid md:grid-cols-2 items-center gap-12">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter">
              Unlock Your Potential with <span className="text-primary">LearnFlow</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground mx-auto md:mx-0">
              The all-in-one platform to watch, practice, and discuss. Your collaborative learning journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="group">
                <Link href="/courses">
                  Explore Courses
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/forum">
                  Join the Community
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-auto md:aspect-square">
            <Image 
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8dGVhbSUyMGNvbGxhYm9yYXRpb258ZW58MHx8fHwxNzYzMDk3ODE4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Collaborative learning environment"
                fill
                className="object-cover rounded-xl shadow-2xl"
                data-ai-hint="team collaboration"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-24 bg-muted/50">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Everything You Need to Succeed</h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">
                One platform to supercharge your skills.
            </p>
            <div className="grid gap-8 md:grid-cols-3 w-full max-w-6xl mx-auto">
                {features.map((feature) => (
                    <Card key={feature.href} className="flex flex-col text-left hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                        {feature.icon}
                        <CardTitle className="font-headline text-2xl">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <CardDescription>{feature.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                        <Button asChild variant="outline" className="group w-full">
                            <Link href={feature.href}>
                                {feature.title.split(' ')[0]} Now
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section id="featured-courses" className="py-12 md:py-24">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Explore Our Featured Courses</h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">
            Handpicked courses to help you get started on your learning journey.
          </p>
          <div className="grid gap-8 md:grid-cols-3 w-full max-w-6xl mx-auto">
            {featuredCourses.map((course) => (
                <Card key={course.id} className="flex flex-col text-left overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl">
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
                            <Badge variant={course.level === 'Beginner' ? 'default' : course.level === 'Intermediate' ? 'secondary' : 'destructive'}>{course.level}</Badge>
                        </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 flex-grow">
                        <CardTitle className="font-headline text-xl mb-3">{course.title}</CardTitle>
                        <CardDescription>{course.description}</CardDescription>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="group w-full">
                            <Link href={`/courses/${course.id}`}>
                                View Course
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-12 md:py-24 bg-muted/50">
        <div className="container mx-auto">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Why LearnFlow?</h2>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">
                    We provide a holistic learning experience designed for the modern developer.
                </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 w-full max-w-6xl mx-auto">
                {whyChooseUs.map((reason) => (
                    <div key={reason.title} className="flex flex-col items-center text-center gap-4 p-6">
                        {reason.icon}
                        <h3 className="font-headline text-2xl font-semibold">{reason.title}</h3>
                        <p className="text-muted-foreground">{reason.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 md:py-24">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl md-text-4xl font-bold font-headline mb-4">Loved by Learners Worldwide</h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">
                Don't just take our word for it. Here's what our community is saying.
            </p>
            <div className="grid gap-8 md:grid-cols-3 w-full max-w-6xl mx-auto">
                {testimonials.map((t) => (
                    <Card key={t.name} className="flex flex-col text-left p-6">
                        <div className="flex mb-4">
                            {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <p className="flex-grow text-muted-foreground mb-6">"{t.comment}"</p>
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={t.avatar} alt={t.name} />
                                <AvatarFallback>{t.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{t.name}</p>
                                <p className="text-sm text-muted-foreground">{t.role}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
      </section>

       {/* Final CTA Section */}
       <section className="py-12 md:py-24">
            <div className="container mx-auto">
                <div className="bg-primary text-primary-foreground rounded-xl p-12 text-center shadow-lg">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Ready to Start Your Journey?</h2>
                    <p className="max-w-xl mx-auto text-lg text-primary-foreground/80 mb-8">
                        Join thousands of learners and take your skills to the next level. It's free to get started.
                    </p>
                    <Button asChild size="lg" variant="secondary" className="group">
                        <Link href="/courses">
                            Explore All Courses
                            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </div>
       </section>
    </div>
  )
}
