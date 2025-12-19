'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  GraduationCap,
  LayoutDashboard,
  BookCopy,
  PenSquare,
  MessageSquare,
  Code,
  Calendar,
  Terminal,
  Library,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/my-courses', label: 'My Courses', icon: Library },
  { href: '/student/assignments', label: 'Assignments', icon: Calendar },
  { href: '/student/tests', label: 'Online Tests', icon: PenSquare },
  { href: '/student/compiler', label: 'Practice', icon: Terminal },
  { href: '/student/sessions', label: 'Live Sessions', icon: Calendar },
]

export function StudentSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background flex flex-col fixed top-0 left-0 h-full">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/student/dashboard" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-headline font-semibold text-primary">
            Student
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
                  pathname === link.href
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
