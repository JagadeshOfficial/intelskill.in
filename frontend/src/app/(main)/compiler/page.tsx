"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Download, Copy, Trash2, Terminal, Code2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CompilerPage() {
    const [code, setCode] = useState(`// Write your code here
console.log("Hello, World!");
`);
    const [output, setOutput] = useState<string>("// Output will appear here...");
    const [isRunning, setIsRunning] = useState(false);
    const [language, setLanguage] = useState('javascript');

    const handleRun = () => {
        setIsRunning(true);
        setOutput("Compiling...");

        // Simulate execution speed
        setTimeout(() => {
            setIsRunning(false);
            // Simple mock outputs based on language
            if (language === 'python') {
                setOutput(`> python main.py\nHello, World!\n\n[Program finished with exit code 0]`);
            } else if (language === 'java') {
                setOutput(`> javac Main.java\n> java Main\nHello, World!\n\n[Program finished with exit code 0]`);
            } else {
                setOutput(`> node index.js\nHello, World!\n\n[Program finished with exit code 0]`);
            }
        }, 1500);
    };

    const clearOutput = () => setOutput("");

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 pl-14">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm sticky top-20 z-10">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-900 rounded-lg text-white">
                        <Code2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">Polychrome Compiler</h1>
                        <p className="text-xs text-slate-500 font-medium">Online IDE & Execution Environment</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-40 h-9 bg-slate-100 border-slate-200">
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="javascript">JavaScript (Node.js)</SelectItem>
                            <SelectItem value="python">Python 3.9</SelectItem>
                            <SelectItem value="java">Java 17</SelectItem>
                            <SelectItem value="cpp">C++ (GCC)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" className="h-9 w-9 p-0 text-slate-500 hover:text-slate-900">
                        <Settings className="h-4 w-4" />
                    </Button>

                    <div className="h-6 w-px bg-slate-200 mx-2"></div>

                    <Button
                        onClick={handleRun}
                        disabled={isRunning}
                        className={cn(
                            "h-9 px-6 rounded-full font-bold shadow-lg transition-all",
                            isRunning ? "bg-slate-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white hover:scale-105 shadow-green-600/20"
                        )}
                    >
                        <Play className="h-4 w-4 mr-2 fill-current" /> {isRunning ? "Running..." : "Run Code"}
                    </Button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">

                {/* Editor Pane */}
                <div className="flex-1 flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-white">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-medium text-slate-500">
                        <span>main.{language === 'python' ? 'py' : language === 'java' ? 'java' : 'js'}</span>
                        <div className="flex gap-2">
                            <button className="hover:text-blue-600 transition-colors" title="Copy Code"><Copy className="h-3.5 w-3.5" /></button>
                            <button className="hover:text-blue-600 transition-colors" title="Download File"><Download className="h-3.5 w-3.5" /></button>
                        </div>
                    </div>
                    <div className="relative flex-1 bg-white group">
                        {/* Line Numbers Mock */}
                        <div className="absolute top-4 left-0 bottom-4 w-10 text-right pr-3 text-slate-300 font-mono text-sm leading-6 select-none border-r border-slate-100 bg-white">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i}>{i + 1}</div>
                            ))}
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full pl-12 pr-4 py-4 resize-none outline-none font-mono text-sm leading-6 text-slate-800 selection:bg-blue-100"
                            spellCheck={false}
                        />
                    </div>
                </div>

                {/* Output Pane */}
                <div className="flex-1 md:flex-[0.5] flex flex-col rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950/50 border-b border-white/10 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-2"><Terminal className="h-3.5 w-3.5" /> Console Output</span>
                        <button onClick={clearOutput} className="hover:text-white transition-colors" title="Clear Console"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm text-green-400 bg-slate-900 overflow-auto whitespace-pre-wrap">
                        {output}
                        {isRunning && <span className="animate-pulse">_</span>}
                    </div>
                </div>

            </div>
        </div>
    );
}
