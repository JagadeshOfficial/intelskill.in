
"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TutorForumPage() {
  const router = useRouter();

  useEffect(() => {
    // Forum removed for tutors — redirect to tutor dashboard
    router.replace('/tutor/dashboard');
  }, [router]);

  return null;
}
