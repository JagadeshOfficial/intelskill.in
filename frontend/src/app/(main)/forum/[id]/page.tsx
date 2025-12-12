import { notFound } from 'next/navigation';
import { getThreadById } from '@/lib/placeholder-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MessageSquare, Share2, Flag, MoreHorizontal, ChevronLeft, Eye, Hash } from 'lucide-react';
import Link from 'next/link';

// Mock Data extension since placeholder might be limited
const relatedTopics = [
  { title: "Understand React useEffect dependency array", replies: 24, id: 101 },
  { title: "Best practices for API Error Handling", replies: 12, id: 102 },
  { title: "Next.js App Router vs Pages Router", replies: 56, id: 103 },
];

export default function ThreadPage({ params }: { params: { id: string } }) {
  // Graceful fallback if ID not found in placeholder
  let thread = getThreadById(params.id);

  // Create a mock thread if placeholder fails (demo purpose)
  if (!thread) {
    if (params.id === '2') {
      thread = {
        id: '2',
        title: "Best practices for REST API design",
        author: { name: 'David', avatarUrl: 'https://i.pravatar.cc/150?u=david' },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
        content: "What are some key principles for designing clean, scalable, and easy-to-use REST APIs? I'm particularly interested in versioning strategies and how to handle nested resources.",
        repliesCount: 3,
        posts: [
          { id: 'p1', content: "Great question! For versioning, I recommend using a URI path prefix, like `/api/v1/...`. It's explicit and clear.", author: { name: 'Eve', avatarUrl: 'https://i.pravatar.cc/150?u=eve' }, timestamp: new Date(Date.now() - 1000 * 3600 * 24) },
          { id: 'p2', content: "Also consider HATEOAS if you want true REST compliance, though it's often overkill for internal APIs.", author: { name: 'Frank', avatarUrl: 'https://i.pravatar.cc/150?u=frank' }, timestamp: new Date(Date.now() - 1000 * 3600 * 5) }
        ]
      } as any;
    } else {
      return <div className="p-20 text-center">Post not found</div>;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pl-14">
      <div className="container mx-auto py-8 px-4 md:px-6">

        {/* Navigation / Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/forum" className="flex items-center text-sm text-slate-500 hover:text-blue-600 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Discussions
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Subscribe</Button>
            <Button variant="ghost" size="icon"><Share2 className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Post & Replies */}
          <div className="lg:col-span-2 space-y-6">

            {/* Original Post */}
            <Card className="border-blue-100 shadow-sm overflow-hidden">
              <CardHeader className="bg-white pb-4 pt-6">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
                    {thread.title}
                  </h1>
                  <Button variant="ghost" size="icon" className="shrink-0 text-slate-400"><Flag className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Question</Badge>
                  <Badge variant="outline" className="text-slate-600 border-slate-200">API Design</Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                    <Eye className="h-3 w-3" /> 1.2k views
                  </span>
                </div>
              </CardHeader>

              <div className="px-6 pb-6">
                <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                    <AvatarImage src={thread.author.avatarUrl} alt={thread.author.name} />
                    <AvatarFallback>{thread.author.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-slate-900">{thread.author.name}</div>
                    <div className="text-xs text-slate-500">{formatDistanceToNow(new Date(thread.timestamp), { addSuffix: true })}</div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-base bg-white">
                  {/* Rendering content directly if plain text, in real scenario this would be Markdown */}
                  {thread.content || (thread.posts && thread.posts[0]?.content)}
                </div>
              </div>

              <CardFooter className="bg-slate-50 border-t py-3 flex justify-between items-center px-6">
                <div className="flex gap-4">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                    <ThumbsUp className="h-4 w-4 mr-2" /> 45
                  </Button>
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                    <MessageSquare className="h-4 w-4 mr-2" /> Reply
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400"><MoreHorizontal className="h-4 w-4" /></Button>
              </CardFooter>
            </Card>

            {/* Replies Section */}
            <div className="ml-0 md:ml-4 lg:ml-0 space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {thread.posts?.length || 0} Replies
              </h3>

              {thread.posts?.map((post: any, index: number) => (
                index > 0 && ( // Skip first post if it's the OP (depending on data structure)
                  <Card key={post.id || index} className="group hover:border-blue-200 transition-colors">
                    <CardHeader className="py-4 flex flex-row items-center gap-3 space-y-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={post.author.avatarUrl} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-900">{post.author.name}</span>
                          <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4 text-slate-700 text-sm leading-relaxed">
                      {post.content}
                    </CardContent>
                    <CardFooter className="py-2 border-t bg-slate-50/30 flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600"><ThumbsUp className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 text-slate-500 hover:text-blue-600 text-xs">Reply</Button>
                    </CardFooter>
                  </Card>
                )
              ))}

              {/* Simplified list if 'posts' is just replies */}
              {(!thread.posts || thread.posts.length <= 1) && (
                <div className="text-center py-8 text-slate-500 bg-white rounded-lg border border-dashed">
                  No replies yet. Be the first to help!
                </div>
              )}
            </div>

            {/* Reply Editor */}
            <Card className="mt-8 border-blue-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <CardHeader className="pb-2">
                <h3 className="font-semibold text-slate-900">Your Answer</h3>
              </CardHeader>
              <CardContent>
                <Textarea className="min-h-[150px] border-slate-200 focus-visible:ring-blue-500 resize-none" placeholder="Type your solution here... Use Markdown for formatting." />
              </CardContent>
              <CardFooter className="flex justify-end pt-0">
                <Button className="bg-blue-600 hover:bg-blue-700">Post Answer</Button>
              </CardFooter>
            </Card>

          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Related Topics */}
            <Card>
              <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-sm font-bold text-slate-800">Related Discussions</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {relatedTopics.map(topic => (
                  <div key={topic.id} className="group cursor-pointer">
                    <h4 className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {topic.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <MessageSquare className="h-3 w-3" /> {topic.replies} replies
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tags Widget */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-800">Tags</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {['API', 'REST', 'Backend', 'Design'].map(tag => (
                  <Badge key={tag} variant="secondary" className="hover:bg-blue-100 cursor-pointer transition-colors text-slate-600">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
