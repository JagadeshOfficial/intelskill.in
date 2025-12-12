'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  GraduationCap,
  Home,
  Users,
  BookOpen,
  ShieldCheck,
  MessageSquare,
  UserCog,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Home },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/tutors', label: 'Tutors', icon: UserCheck },
  { href: '/admin/admins', label: 'Admins', icon: UserCog },
  { href: '/admin/courses', label: 'Courses', icon: GraduationCap },
  { href: '/admin/content', label: 'Content', icon: BookOpen },
  { href: '/admin/tutor-applications', label: 'Tutor Apps', icon: ShieldCheck },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background flex flex-col fixed top-0 left-0 h-full">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-headline font-semibold text-primary">
            Admin
          </h1>
        </Link>
      </div>
      <nav className="flex-grow px-4 py-6">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname?.startsWith(link.href) && link.href !== '/admin'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
