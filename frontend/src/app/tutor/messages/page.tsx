"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TutorMessagesPage() {
  const router = useRouter();

  useEffect(() => {
    // Messages removed for tutors — redirect to tutor dashboard
    router.replace('/tutor/dashboard');
  }, [router]);

  return null;
}
