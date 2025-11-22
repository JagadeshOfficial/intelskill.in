
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import AuthAvatar from "@/components/layout/auth-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserNavProps {
  profileUrl?: string;
}


export function UserNav({ profileUrl = "/admin/profile" }: UserNavProps) {
  const router = useRouter();
  const [name, setName] = useState('Guest User');
  const [email, setEmail] = useState('guest@example.com');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

  // Track which type of user is logged in
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  useEffect(() => {
    try {
      // Prefer student info, then tutor, then admin
      let f = localStorage.getItem('studentFirstName') || '';
      let l = localStorage.getItem('studentLastName') || '';
      let e = localStorage.getItem('studentEmail') || '';
      let p = localStorage.getItem('studentPhotoUrl') || null;
      let studentMode = false;
      let adminMode = false;

      if (f || l || e || p) {
        studentMode = true;
      } else {
        // fallback to tutor
        f = localStorage.getItem('tutorFirstName') || '';
        l = localStorage.getItem('tutorLastName') || '';
        e = localStorage.getItem('tutorEmail') || '';
        p = localStorage.getItem('tutorPhotoUrl') || null;
        if (!(f || l || e || p)) {
          // fallback to admin
          f = localStorage.getItem('adminFirstName') || '';
          l = localStorage.getItem('adminLastName') || '';
          e = localStorage.getItem('adminEmail') || 'guest@example.com';
          p = localStorage.getItem('adminPhotoUrl') || null;
          adminMode = true;
        }
      }

      const full = `${f} ${l}`.trim();
      if (full) setName(full);
      setEmail(e || 'guest@example.com');
      if (p) setPhotoUrl(p);
      setIsAdmin(adminMode);
      setIsStudent(studentMode);
    } catch (e) {
      // ignore when localStorage not available
    }
  }, []);

  // If no photo is present in localStorage for student or tutor, try fetching profile using token
  useEffect(() => {
    const tryFetchProfile = async () => {
      try {
        // student first
        const studentStored = localStorage.getItem('studentPhotoUrl');
        const studentToken = localStorage.getItem('studentToken');
        if (!studentStored && studentToken) {
          const res = await fetch(`${API_BASE_URL}/api/v1/student/me`, { headers: { Authorization: `Bearer ${studentToken}` } });
          if (res.ok) {
            const data = await res.json();
            if (data && data.photoUrl) {
              localStorage.setItem('studentPhotoUrl', data.photoUrl);
              setPhotoUrl(data.photoUrl);
              setName(((data.firstName || '') + ' ' + (data.lastName || '')).trim());
              setEmail(data.email || email);
              setIsStudent(true);
              return;
            }
          }
        }

        // then tutor
        const tutorStored = localStorage.getItem('tutorPhotoUrl');
        const tutorToken = localStorage.getItem('tutorToken');
        if (!studentStored && !tutorStored && tutorToken) {
          const res = await fetch(`${API_BASE_URL}/api/v1/tutor/me`, { headers: { Authorization: `Bearer ${tutorToken}` } });
          if (res.ok) {
            const data = await res.json();
            if (data && data.photoUrl) {
              localStorage.setItem('tutorPhotoUrl', data.photoUrl);
              setPhotoUrl(data.photoUrl);
              setName(((data.firstName || '') + ' ' + (data.lastName || '')).trim());
              setEmail(data.email || email);
            }
          }
        }
      } catch (err) {
        // ignore fetch errors
      }
    };

    tryFetchProfile();
  }, []);

  const handleLogout = () => {
    // Clear student, tutor, and admin data from localStorage
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentEmail');
    localStorage.removeItem('studentFirstName');
    localStorage.removeItem('studentLastName');
    localStorage.removeItem('studentPhotoUrl');
    localStorage.removeItem('studentMobileNumber');
    localStorage.removeItem('studentLastLogin');

    localStorage.removeItem('tutorToken');
    localStorage.removeItem('tutorId');
    localStorage.removeItem('tutorEmail');
    localStorage.removeItem('tutorRole');
    localStorage.removeItem('tutorFirstName');
    localStorage.removeItem('tutorLastName');
    localStorage.removeItem('tutorPhotoUrl');
    localStorage.removeItem('tutorMobileNumber');
    localStorage.removeItem('tutorLastLogin');

    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminFirstName');
    localStorage.removeItem('adminLastName');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminPhotoUrl');
    // Redirect to landing page
    router.push('/');
  };

  const initials = name.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();
  // Build image src safely: support filenames, full URLs, or already-built API paths
  const buildImageSrc = (photo?: string | null) => {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    if (photo.includes('/api/')) return photo;
    return `${API_BASE_URL}/api/v1/auth/admin/image/${photo}`;
  };

  const imageSrc = buildImageSrc(photoUrl);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {photoUrl ? (
              // AuthAvatar will fetch protected images when a token is present,
              // or use the public URL when available.
              <AuthAvatar src={photoUrl.startsWith('http') || photoUrl.includes('/api/') ? photoUrl : undefined} photoKey={!photoUrl.startsWith('http') && !photoUrl.includes('/api/') ? photoUrl : undefined} alt="User Avatar" />
            ) : (
              <img src="https://picsum.photos/seed/learnflow-user/40/40" alt="User Avatar" className="h-8 w-8 rounded-full" />
            )}
            <AvatarFallback>{initials || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={profileUrl}>Profile</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
