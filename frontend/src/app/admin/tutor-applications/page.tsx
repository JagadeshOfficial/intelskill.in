
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AuthAvatar from "@/components/layout/auth-avatar";
import { Check, X, GraduationCap } from "lucide-react";

const applications = [
  {
    id: "APP001",
    name: "Dr. Anika Sharma",
    email: "anika.s@example.com",
    avatar: "https://i.pravatar.cc/150?u=app01",
    expertise: "Machine Learning, AI Ethics",
    appliedAt: "2 days ago",
    coverLetter: "I have over 10 years of experience in the AI field and have published several papers on ethical AI development. I'm passionate about educating the next generation of data scientists.",
  },
  {
    id: "APP002",
    name: "Carlos Rivera",
    email: "carlos.r@example.com",
    avatar: "https://i.pravatar.cc/150?u=app02",
    expertise: "Web Development (Vue.js, Nuxt)",
    appliedAt: "5 days ago",
    coverLetter: "As a senior front-end developer, I have extensive experience building scalable and accessible web applications. I would love to share my knowledge of the Vue.js ecosystem with students.",
  },
];

export default function AdminTutorAppsPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Tutor Applications</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Review and approve pending tutor applications. ({applications.length} pending)
        </p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map(app => (
            <Card key={app.id}>
                <CardHeader className="flex flex-row items-start gap-4">
                     <Avatar className="h-16 w-16">
                        <>
                          <AuthAvatar src={app.avatar} alt={app.name} />
                          <AvatarFallback>{app.name.charAt(0)}</AvatarFallback>
                        </>
                    </Avatar>
                    <div>
                        <CardTitle className="font-headline text-xl">{app.name}</CardTitle>
                        <CardDescription>{app.email}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                             <GraduationCap className="h-4 w-4 text-muted-foreground" />
                             <p className="text-sm font-medium">{app.expertise}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="italic text-muted-foreground">"{app.coverLetter}"</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="destructive">
                        <X className="mr-2 h-4 w-4" />
                        Deny
                    </Button>
                     <Button>
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </main>
    </div>
  );
}
