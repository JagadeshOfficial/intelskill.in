import Link from 'next/link';
import { GraduationCap, Twitter, Github, Linkedin, Zap, Globe, Users } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-16 px-6 shrink-0 relative z-10 font-sans">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
                <Zap className="h-5 w-5 fill-current" />
              </div>
              LearnFlow
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              The all-in-one platform to watch, practice, and discuss. Your collaborative learning journey starts here.
            </p>
            <div className="flex gap-4 pt-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer"><Users className="h-4 w-4" /></div>
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-100 hover:text-blue-600 transition-colors cursor-pointer"><Globe className="h-4 w-4" /></div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-6 text-lg">Platform</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link href="/courses" className="text-slate-500 hover:text-blue-600 transition-colors">Courses</Link></li>
              <li><Link href="/content" className="text-slate-500 hover:text-blue-600 transition-colors">Preparation</Link></li>
              <li><Link href="/compiler" className="text-slate-500 hover:text-blue-600 transition-colors">Compiler</Link></li>
              <li><Link href="/forum" className="text-slate-500 hover:text-blue-600 transition-colors">Forum</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-6 text-lg">Community</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Events</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Partners</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-6 text-lg">Legal</h3>
            <ul className="space-y-3 font-medium text-sm">
              <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-slate-500 hover:text-blue-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© 2025 LearnFlow. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Github className="h-5 w-5" /></Link>
            <Link href="#" className="text-slate-400 hover:text-blue-600 transition-colors"><Linkedin className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
