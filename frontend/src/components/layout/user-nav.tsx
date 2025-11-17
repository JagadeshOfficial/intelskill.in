
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

  useEffect(() => {
    try {
      const f = localStorage.getItem('adminFirstName') || '';
      const l = localStorage.getItem('adminLastName') || '';
      const e = localStorage.getItem('adminEmail') || 'guest@example.com';
      const p = localStorage.getItem('adminPhotoUrl') || null;
      const full = `${f} ${l}`.trim();
      if (full) setName(full);
      setEmail(e);
      if (p) setPhotoUrl(p);
    } catch (e) {
      // ignore when localStorage not available
    }
  }, []);

  const handleLogout = () => {
    // Clear all admin data from localStorage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminFirstName');
    localStorage.removeItem('adminLastName');
    localStorage.removeItem('adminPhotoUrl');
    localStorage.removeItem('adminMobileNumber');
    localStorage.removeItem('adminLastLogin');
    
    // Redirect to landing page
    router.push('/');
  };

  const initials = name.split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {photoUrl ? (
              <AvatarImage src={`${API_BASE_URL}/api/v1/auth/admin/image/${photoUrl}`} alt="User Avatar" />
            ) : (
              <AvatarImage src="https://picsum.photos/seed/learnflow-user/40/40" alt="User Avatar" />
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
