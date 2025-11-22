"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentMessagesPage() {
  const router = useRouter();

  useEffect(() => {
    // Messages removed for student dashboard — redirect to student dashboard
    router.replace('/student/dashboard');
  }, [router]);

  return null;
}
