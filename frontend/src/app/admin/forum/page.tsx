
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ShieldAlert } from "lucide-react";

const reportedContent = [
    {
        id: "R001",
        postId: "P345",
        content: "This is spam, buy my new crypto now!",
        reason: "Spam / Commercial",
        reportedBy: "Alex Johnson",
        timestamp: "2 hours ago"
    },
    {
        id: "R002",
        postId: "P678",
        content: "This comment is offensive and inappropriate.",
        reason: "Harassment",
        reportedBy: "Maria Garcia",
        timestamp: "1 day ago"
    }
]


export default function AdminForumPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Manage Forum</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Moderate discussions and handle reported content.
        </p>
      </header>
      <main>
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-6 w-6 text-destructive"/>
                    <CardTitle className="font-headline">Reported Content Queue</CardTitle>
                </div>
                <CardDescription>Review content flagged by users as inappropriate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {reportedContent.map(report => (
                    <Card key={report.id} className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-lg">"
                                <span className="italic text-muted-foreground">{report.content}</span>
                            "</CardTitle>
                            <CardDescription>
                                Reported by {report.reportedBy} ({report.timestamp}) for: <Badge variant="destructive">{report.reason}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-end gap-2">
                             <Button variant="outline">Dismiss Report</Button>
                             <Button variant="destructive">Remove Content & Warn User</Button>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
