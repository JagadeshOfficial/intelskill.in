"use client";

import { useEffect, useState } from 'react';
import { getThreadById, ForumThread } from '@/lib/forum-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MessageSquare, Share2, Flag, MoreHorizontal, ChevronLeft, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function ThreadDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThread = async () => {
      setLoading(true);
      const data = await getThreadById(params.id);
      if (!data) {
        // Determine if we should redirect or show 404
      }
      setThread(data);
      setLoading(false);
    };
    fetchThread();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Discussion Not Found</h1>
        <p className="text-slate-500">This topic may have been deleted or does not exist.</p>
        <Button asChild>
          <Link href="/forum">Return to Forum</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4 md:px-6">

        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/forum" className="flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Discussions
          </Link>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => { toast({ title: "Link Copied!" }) }}><Share2 className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Thread Card */}
            <Card className="border-blue-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-white pb-4 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                    {thread.title}
                  </h1>
                  <Button variant="ghost" size="icon" className="shrink-0 text-slate-400"><Flag className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {thread.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">#{tag}</Badge>
                  ))}
                  <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                    <Eye className="h-3 w-3" /> {thread.views || 0} views
                  </span>
                </div>
              </CardHeader>

              <div className="px-6 pb-6 bg-white">
                <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage src={thread.author.avatar || `https://ui-avatars.com/api/?name=${thread.author.name}&background=random`} />
                    <AvatarFallback>{thread.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-slate-900">{thread.author.name}</div>
                    <div className="text-xs text-slate-500">
                      {thread.createdAt ? formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true }) : ''}
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-base whitespace-pre-wrap">
                  {thread.content}
                </div>
              </div>

              <CardFooter className="bg-slate-50 border-t py-3 flex justify-between items-center px-6">
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                    <ThumbsUp className="h-4 w-4 mr-2" /> {thread.likes || 0}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                    <MessageSquare className="h-4 w-4 mr-2" /> Reply
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400"><MoreHorizontal className="h-4 w-4" /></Button>
              </CardFooter>
            </Card>

            {/* Coming Soon: Replies */}
            <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-xl bg-slate-50">
              Reply functionality coming soon!
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-sm font-bold text-slate-800">About this Discussion</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm text-slate-600">
                <p>This discussion was started by <span className="font-semibold">{thread.author.name}</span>.</p>
                <p className="mt-2">Join the conversation to help them out!</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
