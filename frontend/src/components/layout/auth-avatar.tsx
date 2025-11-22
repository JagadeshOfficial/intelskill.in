"use client"

import React, { useEffect, useState } from "react";
import { AvatarImage } from "@/components/ui/avatar";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

interface AuthAvatarProps {
  src?: string | null;
  photoKey?: string | null;
  alt?: string;
}

export default function AuthAvatar({ src, photoKey, alt }: AuthAvatarProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function load() {
      try {
        // If src is an absolute URL, use it directly
        if (src && src.startsWith('http')) {
          if (!cancelled) setImgSrc(src);
          return;
        }

        // Build the expected image URL if we have a photoKey
        const builtUrl = src || (photoKey ? `${API_BASE_URL}/api/v1/auth/admin/image/${photoKey}` : null);
        if (!builtUrl) {
          if (!cancelled) setImgSrc(null);
          return;
        }

        // Try to fetch with any available token (admin or tutor)
        const token = typeof window !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('tutorToken')) : null;

        if (token) {
          const res = await fetch(builtUrl, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) throw new Error('Image fetch failed');
          const blob = await res.blob();
          objectUrl = URL.createObjectURL(blob);
          if (!cancelled) setImgSrc(objectUrl);
          return;
        }

        // No token available, try using the direct URL (public endpoint)
        if (!cancelled) setImgSrc(builtUrl);
      } catch (err) {
        if (!cancelled) setImgSrc(null);
      }
    }

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, photoKey]);

  if (!imgSrc) return null;
  return <AvatarImage src={imgSrc} alt={alt || 'Avatar'} />;
}
