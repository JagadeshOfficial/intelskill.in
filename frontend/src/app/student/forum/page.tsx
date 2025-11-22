
"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForumPage() {
  const router = useRouter();

  useEffect(() => {
    // Forum removed for student dashboard — redirect to student dashboard
    router.replace('/student/dashboard');
  }, [router]);

  return null;
}
