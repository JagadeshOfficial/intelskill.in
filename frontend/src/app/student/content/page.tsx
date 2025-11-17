
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { contentData } from '@/lib/placeholder-data';
import type { Content } from '@/lib/placeholder-data';
import { Download, PlayCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function ContentCard({ item }: { item: Content }) {
  return (
    <Card className="flex flex-col overflow-hidden transition-transform transform-gpu hover:-translate-y-1 hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative aspect-video">
          <Image
            src={item.image.imageUrl}
            alt={item.image.description}
            data-ai-hint={item.image.imageHint}
            fill
            className="object-cover"
          />
          {item.type === 'video' && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <PlayCircle className="h-16 w-16 text-white/80" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <div className='flex justify-between items-start mb-2'>
            <Badge variant={item.type === 'video' ? 'default' : 'secondary'} className='capitalize flex items-center gap-1'>
                {item.type === 'video' ? <PlayCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                {item.type}
            </Badge>
            {item.duration && <span className="text-sm text-muted-foreground">{item.duration}</span>}
        </div>
        <CardTitle className="font-headline text-xl mb-2">{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 border-t">
        <div className="flex w-full justify-end gap-2">
            <Button variant="ghost">
                {item.type === 'video' ? <PlayCircle className="mr-2 h-4 w-4" /> : <FileText className="mr-2 h-4 w-4" />}
                {item.type === 'video' ? 'Watch' : 'Read'}
            </Button>
            <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function ContentPage() {
  return (
    <div className="container mx-auto py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Content Library</h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          Browse our curated collection of videos and documents to fuel your learning.
        </p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {contentData.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
