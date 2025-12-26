"use client";

import { CompilerView } from '@/app/student/compiler/components/compiler-view';

export default function PublicCompilerPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 px-4 md:px-8 pb-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Online Compiler</h1>
                    <p className="text-lg text-slate-600 mt-2 max-w-2xl">
                        Write, compile, and run code in multiple languages instantly. No setup required.
                    </p>
                </div>

                {/* Embed the Functional Compiler component */}
                <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 overflow-hidden p-1">
                    <CompilerView />
                </div>
            </div>
        </div>
    );
}
