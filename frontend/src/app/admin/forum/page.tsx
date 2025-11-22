
"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminForumPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard — forum module removed
    router.replace('/admin/dashboard');
  }, [router]);

  return null;
}
