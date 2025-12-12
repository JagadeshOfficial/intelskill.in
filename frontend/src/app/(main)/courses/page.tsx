"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, ArrowRight, DollarSign, Search, Filter, Star, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { coursesData } from '@/lib/placeholder-data';
import { tutorCourses } from '../../tutor/content/data';
import type { Course } from '@/lib/placeholder-data';

function CourseCard({ course }: { course: Course }) {
  const badgeColors = {
    Beginner: 'bg-slate-100 text-slate-700 border border-slate-200',
    Intermediate: 'bg-blue-50 text-blue-700 border border-blue-100',
    Advanced: 'bg-slate-900 text-white border border-slate-900',
  } as const;

  return (
    <div className="group rounded-3xl overflow-hidden border border-slate-200 bg-white hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={course.image.imageUrl}
          alt={course.image.description}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 left-4">
          <Badge className={`backdrop-blur-md shadow-sm px-3 py-1 text-xs font-bold uppercase tracking-wide border-none ${badgeColors[course.level as keyof typeof badgeColors] || 'bg-slate-100 text-slate-700'}`}>
            {course.level}
          </Badge>
        </div>
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-sm">
          <Star className="h-3 w-3 text-yellow-500 fill-current" /> 4.8
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{course.title}</h3>
          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{course.description}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400 mb-6 mt-auto">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md">
            <BookOpen className="h-3.5 w-3.5" /> {course.lessons} Lessons
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md">
            <Clock className="h-3.5 w-3.5" /> {course.duration}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Price</span>
            <span className="text-2xl font-bold text-slate-900">${course.price}</span>
          </div>
          <Button asChild className="rounded-full bg-slate-900 text-white hover:bg-blue-600 transition-colors px-6 h-10 shadow-lg shadow-slate-900/10 group-hover:shadow-blue-600/20">
            <Link href={`/courses/${course.id}`}>
              Enroll Now
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Page Header */}
      <section className="relative bg-white pt-24 pb-20 border-b overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"></div>
        <div className="container mx-auto px-6 max-w-7xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Explore Our Catalog
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Find the Perfect Course <br className="hidden md:block" /> to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Upgrade Your Skills.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse our expertly curated courses ranging from beginner basics to advanced masterclasses. Start your learning journey today.
          </p>

          {/* Search Bar Mockup */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
            <div className="relative flex items-center bg-white rounded-full shadow-xl p-2 pl-6">
              <Search className="h-5 w-5 text-slate-400 mr-4" />
              <input
                type="text"
                placeholder="Search for Python, React, Design..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 h-10"
              />
              <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
                <select className="bg-transparent text-sm font-medium text-slate-600 outline-none cursor-pointer">
                  <option>All Categories</option>
                  <option>Development</option>
                  <option>Design</option>
                  <option>Business</option>
                </select>
              </div>
              <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white ml-2 px-6 h-10">Search</Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-7xl py-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">All Courses ({coursesData.length + tutorCourses.length})</h2>
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Filter className="h-4 w-4" /> Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coursesData.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}
