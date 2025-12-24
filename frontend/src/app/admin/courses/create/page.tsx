"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function CreateCoursePage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleCreate = () => {
    // TODO: Replace with API call
    alert(`Course '${title}' created!`);
    router.push("/admin/courses");
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tighter">Create Course</h1>
        <p className="text-lg text-muted-foreground mt-2">Add a new course to the platform.</p>
      </header>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              className="border rounded px-3 py-2 w-full"
              placeholder="Course Title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            />
            <textarea
              className="border rounded px-3 py-2 w-full"
              placeholder="Course Description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            />
            <Button type="button" onClick={handleCreate}>
              Create Course
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
