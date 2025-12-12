import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Clock, Search, Plus, ThumbsUp, Eye, Hash, TrendingUp, Users, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// --- Extended Mock Data ---
const tags = ['React', 'Next.js', 'Spring Boot', 'DSA', 'System Design', 'CSS', 'Career'];
const threads = [
  {
    id: 1,
    title: "How to manage state in large React applications?",
    content: "I'm struggling with Redux vs Context API vs Zustand. What do you recommend for a dashboard app?",
    author: { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=a', role: 'Student' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    replies: 12,
    views: 340,
    likes: 45,
    tags: ['React', 'State Management']
  },
  {
    id: 2,
    title: "Best resources for Dynamic Programming?",
    content: "I keep getting stuck on DP problems. Any good visuals or guides?",
    author: { name: 'Bob Smith', avatar: 'https://i.pravatar.cc/150?u=b', role: 'Premium' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    replies: 5,
    views: 120,
    likes: 23,
    tags: ['DSA', 'Algorithms']
  },
  {
    id: 3,
    title: "Spring Boot 3.0 Migration Guide",
    content: "Sharing my experience migrating a monolith to microservices using Spring Boot 3.",
    author: { name: 'Charlie Davis', avatar: 'https://i.pravatar.cc/150?u=c', role: 'Instructor' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    replies: 8,
    views: 890,
    likes: 112,
    tags: ['Spring Boot', 'Backend']
  },
  {
    id: 4,
    title: "Is Tailwind CSS good for large teams?",
    content: "We are debating whether to use Tailwind or CSS Modules.",
    author: { name: 'Diana Prince', avatar: 'https://i.pravatar.cc/150?u=d', role: 'Student' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    replies: 24,
    views: 560,
    likes: 67,
    tags: ['CSS', 'Tailwind']
  }
];

export default function ForumPage() {
  return (
    <div className="min-h-screen bg-slate-50 pl-14">
      {/* Hero Section */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" /> Community Forum
              </h1>
              <p className="text-sm text-slate-500">Connect, learn, and grow with 10k+ developers.</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search topics..." className="pl-9 bg-slate-50" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">New Post</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Sidebar function - Navigation */}
          <div className="hidden lg:block space-y-6">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start font-semibold text-blue-600 bg-blue-50">
                <MessageSquare className="mr-2 h-4 w-4" /> All Discussions
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-600">
                <TrendingUp className="mr-2 h-4 w-4" /> Popular
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-600">
                <Filter className="mr-2 h-4 w-4" /> Unanswered
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Top Categories</h3>
              <div className="space-y-1">
                {['General', 'Frontend', 'Backend', 'DevOps', 'Career'].map(cat => (
                  <Button key={cat} variant="ghost" className="w-full justify-start text-slate-600 h-8 text-sm">
                    <Hash className="mr-2 h-3 w-3 text-slate-400" /> {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="latest" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="latest">Latest</TabsTrigger>
                <TabsTrigger value="top">Top</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
              <TabsContent value="latest" className="space-y-4">
                {threads.map((thread) => (
                  <Link href={`/forum/${thread.id}`} key={thread.id} className="block group">
                    <Card className="hover:border-blue-300 transition-all hover:shadow-md cursor-pointer">
                      <CardHeader className="flex flex-row items-start gap-4 pb-2">
                        <Avatar className="mt-1">
                          <AvatarImage src={thread.author.avatar} />
                          <AvatarFallback>{thread.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-900">{thread.author.name}</span>
                            {thread.author.role === 'Instructor' && <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700">Instructor</Badge>}
                            <span className="text-xs text-slate-400">&middot; {formatDistanceToNow(thread.timestamp, { addSuffix: true })}</span>
                          </div>
                          <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {thread.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-slate-600 line-clamp-2 text-sm">
                          {thread.content}
                        </p>
                        <div className="flex gap-2 mt-3">
                          {thread.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 pb-4 text-xs text-slate-500 border-t bg-slate-50/50 flex justify-between rounded-b-xl mt-2">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"><ThumbsUp className="h-3.5 w-3.5" /> {thread.likes} Likes</span>
                          <span className="flex items-center gap-1 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"><MessageSquare className="h-3.5 w-3.5" /> {thread.replies} Replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> {thread.views} Views
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - Widgets */}
          <div className="space-y-6">
            {/* Trending Tags */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" /> Trending Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} className="cursor-pointer hover:bg-blue-600 bg-slate-100 text-slate-700 hover:text-white transition-colors">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-blue-800">Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-blue-900/80 space-y-2">
                <p>1. Be respectful and kind.</p>
                <p>2. No spam or self-promotion.</p>
                <p>3. Use appropriate tags.</p>
                <Button variant="link" className="p-0 h-auto text-blue-700 text-xs mt-2">Read full guidelines &rarr;</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
