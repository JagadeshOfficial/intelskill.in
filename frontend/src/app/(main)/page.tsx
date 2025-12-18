"use client";

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Code, MessageSquare, ArrowRight, Star, Globe, Users, PlayCircle, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { coursesData } from '@/lib/placeholder-data'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    title: 'Explore Content',
    description: 'Dive into our curated library of learning materials and resources.',
    href: '/content',
    icon: <BookOpen className="h-6 w-6 text-white" />,
    color: "bg-blue-600"
  },
  {
    title: 'Online Compiler',
    description: 'Write, run, and debug code in real-time. Supports multiple languages.',
    href: '/compiler',
    icon: <Code className="h-6 w-6 text-white" />,
    color: "bg-indigo-600"
  },
  {
    title: 'Join Discussions',
    description: 'Engage with the community, ask questions, and share your knowledge.',
    href: '/forum',
    icon: <MessageSquare className="h-6 w-6 text-white" />,
    color: "bg-teal-600"
  },
]

const stats = [
  { label: "Active Students", value: "15,000+" },
  { label: "Courses", value: "120+" },
  { label: "Expert Instructors", value: "50+" },
  { label: "Satisfaction", value: "4.9/5" },
]

export default function Home() {
  const featuredCourses = coursesData?.slice(0, 3) || [];

  return (
    <div className="flex flex-col w-full relative overflow-x-hidden">

      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)] opacity-40"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 px-6 shrink-0">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in slide-in-from-left duration-700 fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                New: AI-Powered Learning Paths
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Master Skills for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Future</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                The all-in-one platform to watch, practice, and discuss. Join a community of developers mastering the craft through collaborative learning.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-105 rounded-full" asChild>
                  <Link href="/courses">Start Learning Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-slate-200 hover:bg-slate-50 transition-all hover:scale-105 rounded-full text-slate-700" asChild>
                  <Link href="/forum">Explore Community</Link>
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
                <p>Joined by <span className="font-bold text-slate-900">15,000+</span> students</p>
              </div>
            </div>

            <div className="relative animate-in slide-in-from-right duration-700 fade-in delay-200 hidden md:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white group hover:shadow-blue-500/20 transition-shadow duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1742&q=80"
                  alt="Student Dashboard"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-lg flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">Full Stack Development</p>
                    <p className="text-sm text-slate-500">4 Modules • 12 Projects</p>
                  </div>
                  <Button size="sm" className="rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"><PlayCircle className="h-4 w-4 mr-1" /> Preview</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 py-16 text-white shrink-0 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="container mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl hover:bg-white/5 transition-colors">
                <h3 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">{stat.value}</h3>
                <p className="text-slate-400 mt-2 font-medium tracking-wide uppercase text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50/50 relative overflow-hidden shrink-0">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-slate-600">A comprehensive suite of tools designed to accelerate your learning and help you achieve mastery.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="group relative border-none shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden bg-white">
                <div className={`absolute top-0 left-0 w-full h-1 ${feature.color}`}></div>
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-slate-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Link href={feature.href} className="text-blue-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Showcase */}
      <section className="py-24 px-6 shrink-0 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Featured Courses</h2>
              <p className="text-slate-600 text-lg">Start your journey with our most popular tracks.</p>
            </div>
            <Button variant="outline" size="lg" className="hidden md:flex rounded-full" asChild>
              <Link href="/courses">View All Courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div key={course.id} className="group rounded-3xl overflow-hidden border border-slate-200 bg-white hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-2">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={course.image.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-slate-900 hover:bg-white backdrop-blur-sm shadow-sm px-3 py-1 text-xs font-bold uppercase tracking-wide">{course.level}</Badge>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{course.title}</h3>
                  <p className="text-slate-600 mb-6 line-clamp-2 text-sm leading-relaxed">{course.description}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>1.2k Enrolled</span>
                    </div>
                    <Button size="sm" className="rounded-full bg-slate-900 text-white hover:bg-blue-600 transition-colors px-4">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Button variant="outline" size="lg" className="w-full rounded-full" asChild>
              <Link href="/courses">View All Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Become an Instructor Section */}
      <section className="py-24 px-6 shrink-0 bg-white relative overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="rounded-[2.5rem] bg-indigo-900 overflow-hidden relative shadow-2xl shadow-indigo-900/20">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-2/3 h-full bg-indigo-800/20 skew-x-12 translate-x-1/4"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>

            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="p-12 lg:p-20 space-y-8">
                <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-500 border-none px-4 py-1.5 text-sm font-bold uppercase tracking-wider rounded-full">
                  Join Our Team
                </Badge>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                  Become an Instructor <br />
                  <span className="text-indigo-300">Share your impact.</span>
                </h2>
                <p className="text-lg text-indigo-100 leading-relaxed max-w-md">
                  Instructors from around the world teach millions of students on LearnFlow. We provide the tools and skills to teach what you love.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="h-14 px-8 text-lg bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl rounded-full font-bold transition-all hover:scale-105" asChild>
                    <Link href="/careers">Start Teaching Today</Link>
                  </Button>
                </div>
              </div>

              <div className="relative h-full min-h-[400px] lg:min-h-full">
                {/* Abstract/Representative Image Area */}
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 to-transparent z-10 lg:bg-gradient-to-l"></div>
                <Image
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Instructor teaching"
                  fill
                  className="object-cover object-center lg:object-left"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 shrink-0 bg-slate-50">
        <div className="container mx-auto max-w-5xl">
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 text-white px-8 py-20 md:px-20 md:py-24 text-center shadow-2xl shadow-blue-900/20">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px] opacity-40"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px] opacity-40"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>

            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">Ready to Transform Your Career?</h2>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Join the fastest growing community of developers and start building specific skills today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-blue-50 shadow-xl rounded-full font-bold" asChild>
                  <Link href="/courses">Get Started for Free</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/10 text-white rounded-full font-medium backdrop-blur-sm" asChild>
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </div>
              <p className="text-sm text-slate-400 mt-8 font-medium">No credit card required • Free tier available</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
