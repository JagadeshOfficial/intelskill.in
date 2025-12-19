'use client'

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Loader2, RotateCw, Terminal, Download, FileCode } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

// Mapping for Piston API
const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript (Node.js)', version: '18.15.0', aliases: ['js', 'node'] },
  { id: 'python', name: 'Python', version: '3.10.0', aliases: ['py'] },
  { id: 'java', name: 'Java', version: '15.0.2', aliases: [] },
  { id: 'cpp', name: 'C++', version: '10.2.0', aliases: ['cpp', 'g++'] },
  { id: 'c', name: 'C', version: '10.2.0', aliases: ['gcc'] },
  { id: 'go', name: 'Go', version: '1.16.2', aliases: ['golang'] },
  { id: 'rust', name: 'Rust', version: '1.68.2', aliases: ['rs'] },
  { id: 'typescript', name: 'TypeScript', version: '5.0.3', aliases: ['ts'] },
];

const STARTER_CODE: Record<string, string> = {
  javascript: `// JavaScript Playground
console.log('Hello, World!');
// console.log('Math.max(5, 10) =', Math.max(5, 10));`,
  python: `# Python Playground
print("Hello, World!")
print(f"Sum of 5 + 3 = {5 + 3}")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  go: `package main
import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
  rust: `fn main() {
    println!("Hello, World!");
}`,
  typescript: `// TypeScript Playground
const greeting: string = "Hello, World!";
console.log(greeting);`
};

export function CompilerView() {
  const { toast } = useToast();
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(STARTER_CODE['javascript']);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');

  const handleLanguageChange = (langId: string) => {
    const selectedLang = LANGUAGES.find(l => l.id === langId);
    if (selectedLang) {
      setLanguage(selectedLang);
      setCode(STARTER_CODE[langId] || '// Write your code here');
      setOutput('');
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Compiling and Executing...');

    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language.id,
          version: language.version,
          files: [
            {
              content: code
            }
          ]
        })
      });

      const data = await response.json();

      if (data.run) {
        let finalOutput = '';
        if (data.run.stdout) finalOutput += data.run.stdout;
        if (data.run.stderr) finalOutput += `\n[Error]: ${data.run.stderr}`;
        if (!data.run.stdout && !data.run.stderr) finalOutput = 'Program executed successfully with no output.';

        // --- CLEAN UP OUTPUT TRACES ---
        // This removes internal stack traces from the execution environment (Piston/Node)
        // so the user only sees their own code's errors.
        const cleanedOutput = finalOutput
          .split('\n')
          .filter(line =>
            !line.includes('/piston/jobs/') &&
            !line.includes('/piston/packages/') &&
            !line.includes('node:internal') &&
            !line.includes('Module._compile') &&
            !line.includes('Object.Module') &&
            !line.includes('runMain')
          )
          .join('\n')
          .trim();

        setOutput(cleanedOutput || finalOutput.trim());
      } else {
        setOutput('Error: Failed to execute code via Piston API.');
      }

    } catch (error) {
      console.error('Execution error:', error);
      setOutput('Error: Could not connect to execution server. Please check your internet connection.');
      toast({ variant: 'destructive', title: 'Execution Failed', description: 'Network error or API is down.' });
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script.${language.id === 'python' ? 'py' : language.id === 'javascript' ? 'js' : language.id === 'typescript' ? 'ts' : language.id}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md">
            <FileCode className="h-5 w-5" />
            <span className="font-semibold text-sm">Language:</span>
          </div>
          <Select value={language.id} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[200px] border-slate-300">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang.id} value={lang.id}>{lang.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={() => setTheme(prev => prev === 'vs-dark' ? 'light' : 'vs-dark')}>
            {theme === 'vs-dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} title="Download Code">
            <Download className="h-4 w-4" />
          </Button>
          <Button
            onClick={runCode}
            disabled={isRunning}
            className={`min-w-[120px] gap-2 font-bold transition-all ${isRunning ? 'bg-slate-800' : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'}`}
          >
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4">

        {/* Editor Panel */}
        <Card className="lg:col-span-2 shadow-md border-0 flex flex-col overflow-hidden ring-1 ring-slate-200">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={language.id}
              value={code}
              theme={theme}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                padding: { top: 16 }
              }}
            />
          </div>
        </Card>

        {/* Output Panel */}
        <Card className="shadow-md border-0 flex flex-col overflow-hidden ring-1 ring-slate-200 bg-slate-900 text-slate-100">
          <CardHeader className="py-3 px-4 border-b border-slate-800 bg-slate-950 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-400">
              <Terminal className="h-4 w-4" /> Output Console
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-white" onClick={() => setOutput('')} title="Clear Output">
              <RotateCw className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative font-mono text-sm">
            <ScrollArea className="h-full w-full absolute inset-0">
              <div className="p-4 whitespace-pre-wrap">
                {output ? (
                  <span className={output.startsWith('Error') || output.includes('[Error]') ? 'text-red-400' : 'text-green-300'}>
                    {output}
                  </span>
                ) : (
                  <div className="text-slate-600 italic mt-10 text-center">
                    <Play className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    Ready to execute. Press "Run Code" to start.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
