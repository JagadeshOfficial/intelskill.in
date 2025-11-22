'use client'

import type { ForumPost } from "@/lib/placeholder-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AuthAvatar from "@/components/layout/auth-avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Flag, ThumbsUp } from "lucide-react";
import { flagPostAction } from "../actions";
import { cn } from "@/lib/utils";

interface ThreadPostProps {
    post: ForumPost;
    isOriginalPost: boolean;
}

export function ThreadPost({ post, isOriginalPost }: ThreadPostProps) {
    const { toast } = useToast();

    const handleFlagPost = async () => {
        const result = await flagPostAction(post.id, post.content);
        toast({
            title: result.success ? "Moderation Report" : "Error",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
    }

    return (
        <Card className={cn(isOriginalPost ? "border-primary/50" : "")}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                                        <Avatar>
                                                <>
                                                    <AuthAvatar src={post.author.avatarUrl} alt={post.author.name} />
                                                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                                                </>
                                        </Avatar>
                    <div>
                        <p className="font-semibold">{post.author.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(post.timestamp, { addSuffix: true })}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 text-base">
                <p>{post.content}</p>
            </CardContent>
            <CardFooter className="p-4 flex justify-end gap-2 border-t">
                <Button variant="ghost" size="sm" onClick={handleFlagPost}>
                    <Flag className="h-4 w-4 mr-2" />
                    Flag
                </Button>
                <Button variant="ghost" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                </Button>
            </CardFooter>
        </Card>
    )
}
