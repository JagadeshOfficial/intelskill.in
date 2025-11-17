import { GraduationCap, Twitter, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

const platformLinks = [
  { href: '/courses', label: 'Courses' },
  { href: '/content', label: 'Content' },
  { href: '/compiler', label: 'Compiler' },
  { href: '/forum', label: 'Forum' },
];

const communityLinks = [
    { href: '#', label: 'Blog' },
    { href: '#', label: 'Events' },
    { href: '#', label: 'Partners' },
];

const legalLinks = [
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
    { href: '#', label: 'Contact Us' },
];


export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-4 md:col-span-1">
                 <Link href="/" className="flex items-center gap-2 w-fit">
                    <GraduationCap className="h-7 w-7 text-primary" />
                    <h1 className="text-2xl font-headline font-semibold text-primary">
                        LearnFlow
                    </h1>
                </Link>
                <p className="text-muted-foreground text-sm max-w-xs">
                    The all-in-one platform to watch, practice, and discuss. Your collaborative learning journey starts here.
                </p>
            </div>
          
            <div className="md:col-span-1">
                <h3 className="font-semibold mb-4 font-headline text-lg">Platform</h3>
                <ul className="space-y-3">
                {platformLinks.map((link, index) => (
                    <li key={`${link.label}-${index}`}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>

             <div className="md:col-span-1">
                <h3 className="font-semibold mb-4 font-headline text-lg">Community</h3>
                <ul className="space-y-3">
                {communityLinks.map((link, index) => (
                    <li key={`${link.label}-${index}`}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>

            <div className="md:col-span-1">
                <h3 className="font-semibold mb-4 font-headline text-lg">Legal</h3>
                <ul className="space-y-3">
                {legalLinks.map((link, index) => (
                    <li key={`${link.label}-${index}`}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                    </li>
                ))}
                </ul>
            </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LearnFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
