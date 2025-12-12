"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Code,
  Database,
  Terminal,
  Cpu,
  Globe,
  Server,
  ChevronRight,
  Search,
  FileText,
  Layers,
  Briefcase
} from 'lucide-react';

// Mock Data for Preparation Materials (GFG Style)
const categories = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    icon: <Code className="h-6 w-6" />,
    description: 'Master the fundamental building blocks of programming.',
    color: 'bg-blue-50 text-blue-600',
    topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching']
  },
  {
    id: 'web',
    title: 'Web Development',
    icon: <Globe className="h-6 w-6" />,
    description: 'Full stack development guides from frontend to backend.',
    color: 'bg-green-50 text-green-600',
    topics: ['HTML & CSS', 'JavaScript', 'React', 'Node.js', 'Next.js', 'System Design', 'APIs']
  },
  {
    id: 'interview',
    title: 'Interview Preparation',
    icon: <Briefcase className="h-6 w-6" />,
    description: 'Curated questions and guides for top tech companies.',
    color: 'bg-purple-50 text-purple-600',
    topics: ['Top 100 Questions', 'Company Wise Prep', 'Mock Tests', 'Resumes', 'Behavioral Round', 'System Design']
  },
  {
    id: 'cs',
    title: 'CS Subjects',
    icon: <Cpu className="h-6 w-6" />,
    description: 'Core computer science concepts for interviews and exams.',
    color: 'bg-orange-50 text-orange-600',
    topics: ['Operating Systems', 'DBMS', 'Computer Networks', 'OOPs', 'Compiler Design', 'Digital Logic']
  },
  {
    id: 'languages',
    title: 'Programming Languages',
    icon: <Terminal className="h-6 w-6" />,
    description: 'In-depth tutorials for popular programming languages.',
    color: 'bg-pink-50 text-pink-600',
    topics: ['C++', 'Java', 'Python', 'C#', 'Go', 'Rust', 'TypeScript']
  },
  {
    id: 'database',
    title: 'Databases',
    icon: <Database className="h-6 w-6" />,
    description: 'Learn SQL and NoSQL database management systems.',
    color: 'bg-indigo-50 text-indigo-600',
    topics: ['SQL Basics', 'MongoDB', 'PostgreSQL', 'Redis', 'Normalization', 'Indexing']
  }
];

const popularArticles = [
  { title: "Kadane's Algorithm", category: "DSA", reads: "15k" },
  { title: "React useEffect Hook Explained", category: "Web", reads: "12k" },
  { title: "System Design: URL Shortener", category: "System Design", reads: "10k" },
  { title: "Difference between Process and Thread", category: "OS", reads: "8k" },
  { title: "Top 50 Java Interview Questions", category: "Java", reads: "20k" },
  { title: "ACID Properties in DBMS", category: "DBMS", reads: "9k" },
];

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* Hero Section */}
      <section className="bg-slate-50 border-b border-slate-200 pt-20 pb-16 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none mb-6 px-4 py-1.5 text-sm font-medium rounded-full">
            Preparation Hub
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Your Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Preparation Library</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Comprehensive tutorials, interview questions, and practice problems to help you crack your dream job.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
            <div className="relative flex items-center bg-white rounded-full shadow-xl p-2 pl-6">
              <Search className="h-5 w-5 text-slate-400 mr-4" />
              <input
                type="text"
                placeholder="Search for 'Arrays', 'React', 'System Design'..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 h-10"
              />
              <Button className="rounded-full bg-slate-900 hover:bg-blue-600 text-white ml-2 px-8 h-10 transition-colors">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-7xl px-6 py-16">

        {/* Featured Popular Articles */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ZapIcon /> Trending Topics
            </h2>
            <Link href="#" className="text-sm font-medium text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {popularArticles.map((article, i) => (
              <div key={i} className="flex items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group">
                <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{article.title}</h4>
                  <p className="text-xs text-slate-400">{article.reads} reads • {article.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <Tabs defaultValue="all" className="space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-slate-900">Explore by Category</h2>
            <TabsList className="bg-slate-100 p-1 rounded-full border border-slate-200">
              <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">All Topics</TabsTrigger>
              <TabsTrigger value="dsa" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">DSA</TabsTrigger>
              <TabsTrigger value="web" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">Development</TabsTrigger>
              <TabsTrigger value="cs" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">CS Core</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Card key={category.id} className="border-slate-100 shadow-sm hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300 group">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${category.color}`}>
                      {category.icon}
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{category.title}</CardTitle>
                    <CardDescription className="text-slate-500">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.topics.map((topic, index) => (
                        <li key={index} className="flex items-center text-sm text-slate-600 hover:text-blue-600 transition-colors cursor-pointer p-1 -ml-1 rounded hover:bg-slate-50">
                          <ChevronRight className="h-4 w-4 mr-2 text-slate-300 group-hover:text-blue-300" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button asChild variant="ghost" className="w-full justify-between hover:bg-blue-50 hover:text-blue-600 group-hover:translate-x-1 transition-all cursor-pointer">
                      <Link href={`/content/${category.id}`}>
                        Start Learning <ArrowRightIcon />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          {/* Additional TabsContent can be added here filtering the categories array */}
        </Tabs>

        {/* Newsletter / Updates */}
        <div className="mt-20 bg-slate-900 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] opacity-20"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-slate-400 mb-8">Get the latest interview questions, articles, and cheat sheets delivered to your inbox.</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input placeholder="Enter your email" className="bg-white/10 border-white/10 text-white placeholder:text-slate-500 rounded-full h-12 px-6 focus-visible:ring-offset-0 focus-visible:ring-blue-500" />
              <Button className="rounded-full bg-blue-600 hover:bg-blue-500 h-12 px-8">Subscribe</Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Simple Icons Components if imports fail or for quick usage
function ZapIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-yellow-500 fill-current"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
}

function ArrowRightIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
}
