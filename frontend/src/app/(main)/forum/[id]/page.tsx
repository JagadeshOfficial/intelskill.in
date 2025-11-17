import { notFound } from 'next/navigation';
import { getThreadById } from '@/lib/placeholder-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { ThreadPost } from '@/app/forum/[id]/components/thread-post';

export default function ThreadPage({ params }: { params: { id: string } }) {
  const thread = getThreadById(params.id);

  if (!thread) {
    notFound();
  }

  return (
    <div className="container mx-auto py-12">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tighter">{thread.title}</h1>
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarImage src={thread.author.avatarUrl} alt={thread.author.name} />
            <AvatarFallback>{thread.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>
            Started by <strong>{thread.author.name}</strong> &middot; {formatDistanceToNow(thread.timestamp, { addSuffix: true })}
          </span>
        </div>
      </header>

      <main className="space-y-6">
        {thread.posts.map((post, index) => (
          <ThreadPost key={post.id} post={post} isOriginalPost={index === 0} />
        ))}

        <Separator />

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold font-headline">Post a Reply</h3>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Write your reply here..." rows={5} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>Submit Reply</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
