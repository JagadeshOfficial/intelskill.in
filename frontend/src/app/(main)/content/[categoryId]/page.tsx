"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { categories, topicContent } from '../data';
import { Button } from '@/components/ui/button';
import { ChevronRight, Menu, BookOpen, Share2, Star, Code } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function CategoryPage() {
    const params = useParams();
    const categoryId = params.categoryId as string;
    const category = categories.find(c => c.id === categoryId);

    const [activeTopic, setActiveTopic] = useState(category?.topics[0] || '');

    if (!category) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
                <p className="text-slate-500 mb-8">The requested topic category does not exist.</p>
                <Button asChild><Link href="/content">Back to Preparation Hub</Link></Button>
            </div>
        );
    }

    const TopicList = () => (
        <div className="py-4">
            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {category.title}
            </h3>
            <div className="space-y-1">
                {category.topics.map((topic) => (
                    <button
                        key={topic}
                        onClick={() => setActiveTopic(topic)}
                        className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors border-l-2 ${activeTopic === topic
                            ? 'border-blue-600 text-blue-600 bg-blue-50'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                    >
                        {topic}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-white pl-14">

            {/* Sidebar (Desktop) */}
            <aside className="hidden md:block w-72 border-r border-slate-200 shrink-0 sticky top-20 h-[calc(100vh-5rem)] bg-slate-50/50">
                <ScrollArea className="h-full">
                    <TopicList />
                </ScrollArea>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="p-6 md:p-10 max-w-4xl mx-auto">

                    {/* Mobile Sidebar Trigger & Breadcrumbs */}
                    <div className="flex items-center gap-4 mb-8 md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="-ml-2">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 p-0">
                                <div className="pt-6">
                                    <TopicList />
                                </div>
                            </SheetContent>
                        </Sheet>
                        <span className="text-sm font-semibold text-slate-900 truncate">
                            {category.title} / {activeTopic}
                        </span>
                    </div>

                    {/* Content Article */}
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                            <Link href="/content" className="hover:underline">Preparation</Link>
                            <ChevronRight className="h-4 w-4 text-slate-400" />
                            <span>{category.title}</span>
                        </div>

                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            {activeTopic}
                        </h1>

                        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> 15 min read</span>
                                <span>Updated yesterday</span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm"><Star className="h-4 w-4 mr-2" /> Save</Button>
                                <Button variant="ghost" size="sm"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none prose-lg">
                            <p className="lead text-xl text-slate-600">
                                Mastering {activeTopic} is crucial for {category.title.toLowerCase()} interviews. This comprehensive guide covers definitions, examples, and common interview questions.
                            </p>

                            <h3>Introduction to {activeTopic}</h3>
                            <p>
                                {activeTopic} is a fundamental concept in computing. Understanding it allows you to write more efficient and scalable code.
                                In this tutorial, we will explore the core principles, implementation details, and real-world applications.
                            </p>

                            <div className="not-prose bg-slate-50 p-6 rounded-2xl border border-slate-200 my-8">
                                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <Code className="h-5 w-5 text-blue-600" /> Key Takeaways
                                </h4>
                                <ul className="list-disc pl-5 space-y-2 text-slate-600">
                                    <li>Definition and basic syntax of {activeTopic}</li>
                                    <li>Time and Space complexity analysis</li>
                                    <li>Common algorithms utilizing {activeTopic}</li>
                                    <li>Top 10 Interview questions asked in FAANG</li>
                                </ul>
                            </div>

                            <h3>Implementation</h3>
                            <p>
                                Let's look at how we can implement {activeTopic} in code. Below is a standard example showing the initialization and basic operations.
                            </p>

                            <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-x-auto">
                                <code>{`// Example Implementation for ${activeTopic}

function example() {
  console.log("Initializing ${activeTopic}...");
  // Core logic here
  return true;
}`}</code>
                            </pre>

                            <h3>Next Steps</h3>
                            <p>
                                Once you have grasped the basics, try solving practice problems on our <Link href="/compiler" className="text-blue-600 no-underline hover:underline">Compiler</Link>.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Footer */}
                    <div className="flex justify-between mt-16 pt-8 border-t border-slate-200">
                        <Button variant="outline" className="gap-2">
                            Previous Topic
                        </Button>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            Next Topic <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
