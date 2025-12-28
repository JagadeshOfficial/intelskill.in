"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Search, Plus, ThumbsUp, Eye, TrendingUp, Users, Filter, Hash, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Import Backend Service
import { getThreads, createThread, ForumThread } from '@/lib/forum-service';

export default function ForumPage() {
  const { toast } = useToast();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Auth State
  const [user, setUser] = useState<{ name: string, role: string, uid: string, avatar?: string } | null>(null);

  // Form State
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    const data = await getThreads();
    setThreads(data);
    setLoading(false);
  };

  useEffect(() => {
    // 1. Check Authentication Status from LocalStorage
    const checkAuth = () => {
      try {
        if (typeof window !== 'undefined') {
          // Check Admin
          const adminToken = localStorage.getItem('adminToken');
          if (adminToken) {
            const adminStr = localStorage.getItem('adminUser');
            const admin = adminStr ? JSON.parse(adminStr) : { username: 'Admin' };
            setUser({ name: admin.username || 'Administrator', role: 'Admin', uid: 'admin-1', avatar: '' });
            return;
          }

          // Check Tutor
          const tutorToken = localStorage.getItem('tutorToken');
          if (tutorToken) {
            const tutorStr = localStorage.getItem('tutorUser');
            const tutor = tutorStr ? JSON.parse(tutorStr) : { name: 'Instructor' };
            setUser({ name: tutor.name, role: 'Instructor', uid: `tutor-${tutor.id || 'x'}`, avatar: '' });
            return;
          }

          // Check Student
          const studentToken = localStorage.getItem('studentToken');
          if (studentToken) {
            const studentStr = localStorage.getItem('studentUser');
            const student = studentStr ? JSON.parse(studentStr) : { name: 'Student' };
            setUser({ name: student.name, role: 'Student', uid: `student-${student.id || 'x'}`, avatar: '' });
            return;
          }
        }
      } catch (e) {
        console.error("Auth check failed", e);
      }
    };

    checkAuth();
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "You must be logged in to create a post." });
      // Ideally redirect to login, but for now just validation
      return;
    }

    if (!newPost.title || !newPost.content) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please provide a Title and Content." });
      return;
    }

    setCreating(true);
    try {
      await createThread({
        title: newPost.title,
        content: newPost.content,
        tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
        author: {
          uid: user.uid,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      });
      toast({ title: "Success", description: "Post created successfully! 🎉" });
      setIsCreateOpen(false);
      setNewPost({ title: '', content: '', tags: '' });
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to create post. Try again." });
    } finally {
      setCreating(false);
    }
  };

  const filteredThreads = threads.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentUser');
    localStorage.removeItem('tutorToken');
    localStorage.removeItem('tutorUser');
    setUser(null);
    toast({ title: "Logged out", description: "You are now viewing as a guest." });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b sticky top-20 z-10 pt-4">
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
                <Input
                  placeholder="Search topics..."
                  className="pl-9 bg-slate-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">New Post</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Create a New Discussion</DialogTitle>
                    <DialogDescription>
                      Share your knowledge or ask a question to the community.
                    </DialogDescription>
                  </DialogHeader>

                  {!user ? (
                    <div className="py-8 text-center space-y-4">
                      <p className="text-slate-600">You must be logged in to post.</p>
                      <div className="flex justify-center gap-2">
                        <Button asChild variant="outline"><Link href="/login/student">Student Login</Link></Button>
                        <Button asChild variant="outline"><Link href="/login/tutor">Tutor Login</Link></Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 rounded text-sm">
                        <span className="text-slate-500">Posting as:</span>
                        <span className="font-bold text-slate-900">{user.name}</span>
                        <Badge variant="secondary" className="text-xs">{user.role}</Badge>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} placeholder="How do I..." />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input id="tags" value={newPost.tags} onChange={e => setNewPost({ ...newPost, tags: e.target.value })} placeholder="React, Java, Help" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea id="content" value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} placeholder="Write your post here..." className="min-h-[100px]" />
                      </div>
                    </div>
                  )}

                  {user && (
                    <DialogFooter>
                      <Button disabled={creating} onClick={handleCreate}>
                        {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {creating ? 'Posting...' : 'Create Post'}
                      </Button>
                    </DialogFooter>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Sidebar */}
          <div className="hidden lg:block space-y-6">
            <div className="px-4 py-3 bg-white rounded-lg border border-slate-200 mb-4 shadow-sm">
              {user ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarImage src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm truncate">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.role}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-slate-500 text-center">
                  Join the discussion!
                  <div className="flex gap-2 justify-center mt-2">
                    <Link href="/login/student" className="text-blue-600 hover:underline">Login</Link>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start font-semibold text-blue-600 bg-blue-50">
                <MessageSquare className="mr-2 h-4 w-4" /> All Discussions
              </Button>
              <Button variant="ghost" className="w-full justify-start text-slate-600">
                <TrendingUp className="mr-2 h-4 w-4" /> Popular
              </Button>
            </div>
            <div className="pt-4 border-t">
              <h3 className="mb-2 px-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Top Categories</h3>
              <div className="space-y-1">
                {['General', 'Frontend', 'Backend', 'DevOps', 'Career'].map(cat => (
                  <Button key={cat} variant="ghost" className="w-full justify-start text-slate-600 h-8 text-sm" onClick={() => setSearchQuery(cat)}>
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
                <TabsTrigger value="top" disabled>Top (Soon)</TabsTrigger>
                <TabsTrigger value="following" disabled>Following</TabsTrigger>
              </TabsList>
              <TabsContent value="latest" className="space-y-4">
                {loading ? (
                  <div className="text-center py-20 text-slate-500">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-blue-500" />
                    <p>Loading discussions...</p>
                  </div>
                ) : filteredThreads.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                    <MessageSquare className="h-10 w-10 mx-auto mb-4 text-slate-300" />
                    <p>No discussions found. Be the first to post!</p>
                  </div>
                ) : (
                  filteredThreads.map((thread) => (
                    <Card key={thread.id} className="hover:border-blue-300 transition-all hover:shadow-md cursor-pointer group">
                      <CardHeader className="flex flex-row items-start gap-4 pb-2">
                        <Avatar className="mt-1">
                          <AvatarImage src={thread.author.avatar || `https://ui-avatars.com/api/?name=${thread.author.name}&background=random`} />
                          <AvatarFallback>{thread.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-slate-900">{thread.author.name}</span>
                            <span className="text-xs text-slate-400">&middot; {thread.createdAt ? formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true }) : 'Just now'}</span>
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
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {thread.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 pb-4 text-xs text-slate-500 border-t bg-slate-50/50 flex justify-between rounded-b-xl mt-2">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"><ThumbsUp className="h-3.5 w-3.5" /> {thread.likes || 0} Likes</span>
                          <span className="flex items-center gap-1 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"><MessageSquare className="h-3.5 w-3.5" /> {thread.repliesCount || 0} Replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> {thread.views || 0} Views
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-blue-800">Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-blue-900/80 space-y-2">
                <p>1. Be respectful and kind.</p>
                <p>2. No spam or self-promotion.</p>
                <p>3. Use appropriate tags.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
