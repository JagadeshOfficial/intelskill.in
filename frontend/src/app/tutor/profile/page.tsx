
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TutorProfilePage() {
  return (
    <div className="space-y-8">
       <header>
        <h1 className="text-4xl font-bold font-headline tracking-tighter">My Profile</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Manage your account details and public tutor profile.
        </p>
      </header>

      <main className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>This information is private and will not be displayed on your public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src="https://i.pravatar.cc/150?u=t02" alt="Tutor Avatar" />
                        <AvatarFallback>K</AvatarFallback>
                    </Avatar>
                     <Button variant="outline">Change Picture</Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue="Kenji Tanaka" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="k.tanaka@example.com" disabled />
                    </div>
                </div>
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle>Public Tutor Profile</CardTitle>
                <CardDescription>This information will be visible to students.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="expertise">Area of Expertise</Label>
                    <Input id="expertise" defaultValue="Python, Data Science" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="bio">Short Bio</Label>
                    <Textarea id="bio" placeholder="Tell students a little bit about yourself..." defaultValue="I am a data scientist with 5 years of experience in the industry, specializing in machine learning and data visualization. I'm passionate about making data accessible and understandable for everyone." />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>For security, choose a strong password that you haven't used before.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end">
            <Button>Save Changes</Button>
        </div>
      </main>
    </div>
  );
}
