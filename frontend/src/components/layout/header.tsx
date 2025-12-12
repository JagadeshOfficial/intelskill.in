"use client"

import Link from 'next/link'
import { Zap, ChevronDown, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md transition-all h-20 flex items-center">
      <div className="container mx-auto flex h-full items-center justify-between px-6">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
          <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          LearnFlow
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <Link href="/courses" className="hover:text-blue-600 transition-colors">Courses</Link>
          <Link href="/content" className="hover:text-blue-600 transition-colors">Preparation</Link>
          <Link href="/compiler" className="hover:text-blue-600 transition-colors">Compiler</Link>
        </div>

        {/* ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 gap-2 font-medium shadow-lg shadow-blue-600/20">
                Sign In <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-[200]">
              <DropdownMenuLabel>Select Account Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login/student" className="cursor-pointer">Student Sign In</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login/tutor" className="cursor-pointer">Tutor Sign In</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login/admin" className="cursor-pointer">Admin Sign In</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* MOBILE MENU */}
        <div className="md:hidden flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-blue-600 text-white rounded-full">Sign In</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[200]">
              <DropdownMenuItem asChild><Link href="/login/student">Student</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/login/tutor">Tutor</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/login/admin">Admin</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <PanelLeft className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 z-[200]">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                      <Zap className="h-4 w-4 fill-current" />
                    </div>
                    LearnFlow
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-4 font-medium text-slate-600">
                <Link href="/" className="hover:text-blue-600">Home</Link>
                <Link href="/courses" className="hover:text-blue-600">Courses</Link>
                <Link href="/content" className="hover:text-blue-600">Preparation</Link>
                <Link href="/compiler" className="hover:text-blue-600">Compiler</Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
