import Link from 'next/link'
import { GraduationCap, PanelLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MainNav } from '@/components/layout/main-nav'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-headline font-semibold text-primary">
            LearnFlow
          </h1>
        </Link>
        <div className="hidden md:flex flex-grow items-center justify-end gap-4">
          <MainNav />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Sign In</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/login/admin">Admin Sign-In</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login/tutor">Tutor Sign-In</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login/student">Student Sign-In</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 md:hidden">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">Sign In</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem asChild>
                <Link href="/login/admin">Admin Sign-In</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login/tutor">Tutor Sign-In</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login/student">Student Sign-In</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <PanelLeft className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Link href="/" className="flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span className="text-xl font-headline font-semibold text-primary">
                      LearnFlow
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-4">
                <MainNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
