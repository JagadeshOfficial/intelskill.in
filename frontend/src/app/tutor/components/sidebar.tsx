"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookCopy,
  ClipboardCheck,
  User,
  Video,
  FileText,
  MessageSquare,
  PenSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/tutor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tutor/courses', label: 'Courses', icon: BookCopy },
  { href: '/tutor/assignments', label: 'Assignments', icon: ClipboardCheck },
  { href: '/tutor/content', label: 'Content', icon: FileText },
  { href: '/tutor/tests', label: 'Tests', icon: PenSquare },
  { href: '/messages', label: 'Messages', icon: MessageSquare },
  { href: '/tutor/sessions', label: 'Online Sessions', icon: Video },
]

import { tutorCourses } from '../content/data'

export function TutorSidebar() {
  const pathname = usePathname()
  const [coursesOpen, setCoursesOpen] = useState(false)
  const [courses, setCourses] = useState(tutorCourses)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [newBatchName, setNewBatchName] = useState('')

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background flex flex-col fixed top-0 left-0 h-full">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/tutor/dashboard" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-headline font-semibold text-primary">
            Tutor
          </h1>
        </Link>
      </div>
      <nav className="flex-grow px-4 py-6">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                target={link.href.startsWith('/') ? '_self' : '_blank'}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  (pathname ?? '').startsWith(link.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}

          {/* Courses collapsible section removed - navigation now via /tutor/courses page */}
        </ul>
      </nav>
    </aside>
  )
}
