
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { forumData } from '@/lib/placeholder-data';
import { MessageSquare, Clock, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function TutorForumPage() {
  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter">Community Forum</h1>
            <p className="text-lg text-muted-foreground mt-2">
            Engage with students and other tutors, answer questions, and share your expertise.
            </p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Start New Discussion
        </Button>
      </header>
      <main className="space-y-4">
        {forumData.map((thread) => (
          <Link href={`/forum/${thread.id}`} key={thread.id} className="block">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src={thread.author.avatarUrl} alt={thread.author.name} />
                  <AvatarFallback>{thread.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <CardTitle className="text-lg font-headline hover:text-primary">{thread.title}</CardTitle>
                  <CardDescription>
                    Started by {thread.author.name} &middot; {formatDistanceToNow(thread.timestamp, { addSuffix: true })}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>{thread.repliesCount} {thread.repliesCount === 1 ? 'reply' : 'replies'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Last reply {formatDistanceToNow(thread.lastReply.timestamp, { addSuffix: true })}</span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </main>
    </div>
  );
}
