"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Check, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { db, auth } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function AdminTutorAppsPage() {
  const { toast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startListener = async () => {
      try {
        await signInAnonymously(auth);
        console.log("Admin authenticated");

        const q = collection(db, "tutor_applications");
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const appsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          appsData.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setApps(appsData);
          setLoading(false);
        }, (error) => {
          console.error("Firestore error:", error);
          toast({ title: "Firestore Error", description: error.message, variant: "destructive" });
          setLoading(false);
        });
        return unsubscribe;
      } catch (err: any) {
        console.error("Admin Auth failed:", err);
        toast({ title: "Auth Error", description: err.message, variant: "destructive" });
        setLoading(false);
      }
    };

    let unsub: any;
    startListener().then(u => unsub = u);

    return () => { if (unsub) unsub(); };
  }, []);

  const handleAction = async (app: any, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'delete') {
        if (confirm("Are you sure you want to delete this application permanently?")) {
          await deleteDoc(doc(db, "tutor_applications", app.id));
          toast({ title: "Deleted", description: "Application removed from Firestore." });
        }
        return;
      }

      const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
      const appRef = doc(db, "tutor_applications", app.id);
      await updateDoc(appRef, { status: newStatus });

      if (app.backendId) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/tutor-applications/${app.backendId}/${action}`, {
          method: 'PUT'
        }).catch(err => console.error("Backend sync failed", err));
      }

      toast({ title: `Application ${action}d`, description: "Status updated successfully." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update application.", variant: "destructive" });
    }
  };

  if (loading) return <div className="p-8">Loading applications...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold font-headline tracking-tighter">Tutor Applications</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Review and manage applications. ({apps.length} total)
          </p>
        </div>
      </header>
      <main className="grid grid-cols-1 gap-6">
        {apps.length === 0 && <div className="text-muted-foreground text-center py-12 border rounded-lg bg-muted/20">No applications found.</div>}
        {apps.map(app => (
          <Card key={app.id} className={cn("transition-all", app.status === 'APPROVED' ? 'border-green-500/30 bg-green-50/10' : app.status === 'REJECTED' ? 'border-red-500/30 bg-red-50/10' : '')}>
            <CardHeader className="flex flex-row items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">{app.firstName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="font-headline text-xl">{app.firstName} {app.lastName}</CardTitle>
                      {app.status === 'APPROVED' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Approved</Badge>}
                      {app.status === 'REJECTED' && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Rejected</Badge>}
                      {app.status === 'PENDING' && <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Pending</Badge>}
                    </div>
                    <CardDescription className="text-base">{app.email} • {app.phone}</CardDescription>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {app.createdAt?.seconds ? new Date(app.createdAt.seconds * 1000).toLocaleDateString() : 'New'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">{app.expertise} • {app.experience} years exp.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1 text-muted-foreground">Application Pitch:</h4>
                <p className="italic text-slate-700 text-sm bg-muted/30 p-4 rounded-md border border-slate-200 leading-relaxed font-serif">"{app.whyJoin}"</p>
              </div>

              <div className="flex gap-4 pt-2">
                {app.resumeUrl && (
                  <Button variant="secondary" size="sm" asChild className="rounded-full shadow-sm">
                    <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4 text-blue-600" /> View Resume (PDF)
                    </a>
                  </Button>
                )}
                {app.portfolio && (
                  <Button variant="secondary" size="sm" asChild className="rounded-full shadow-sm">
                    <a href={app.portfolio} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4 text-purple-600" /> View Portfolio
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/10 p-4 rounded-b-lg border-t space-x-2">
              <Button variant="ghost" size="sm" onClick={() => handleAction(app, 'delete')} className="text-muted-foreground hover:text-red-600 hover:bg-red-50">
                Delete Application
              </Button>
              <div className="flex gap-2">
                {app.status === 'PENDING' && (
                  <>
                    <Button variant="destructive" size="sm" onClick={() => handleAction(app, 'reject')} className="rounded-md">
                      <X className="mr-2 h-4 w-4" />
                      Deny
                    </Button>
                    <Button size="sm" onClick={() => handleAction(app, 'approve')} className="bg-green-600 hover:bg-green-700 rounded-md">
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </main>
    </div>
  );
}
