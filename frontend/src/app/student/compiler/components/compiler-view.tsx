'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Play } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
];

const sampleCode: Record<string, string> = {
    javascript: "console.log('Hello from JavaScript!');",
    python: "print('Hello from Python!')",
    cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}',
};


export function CompilerView() {
  const [language, setLanguage] = useState(languages[0].value);
  const [code, setCode] = useState(sampleCode[languages[0].value]);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(sampleCode[lang] || '');
    setOutput('');
  }

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('Running code...');
    // Simulate code execution
    setTimeout(() => {
      console.log(`Running ${language} code:\n${code}`);
      // In a real scenario, you would send the code to a backend service for execution
      setOutput(`> ${sampleCode[language] || 'No output'}\n\nExecution finished.`);
      setIsRunning(false);
    }, 1000);
  };

  return (
    <Card className="flex-grow flex flex-col shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between border-b p-4">
        <CardTitle className="text-lg font-headline">Code Editor</CardTitle>
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleRunCode} disabled={isRunning}>
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-grow grid grid-cols-1 md:grid-cols-2 gap-0">
        <div className="flex flex-col">
            <ScrollArea className='h-[400px] md:h-full'>
                <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Write your code here..."
                    className="h-[400px] md:h-full w-full resize-none border-0 rounded-none font-code text-base focus-visible:ring-0"
                />
            </ScrollArea>
        </div>
        <div className="bg-muted/30 border-t md:border-t-0 md:border-l">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-lg font-headline">Output</h3>
          </div>
          <ScrollArea className='h-[200px] md:h-full'>
            <pre className="p-4 text-sm font-code whitespace-pre-wrap">
              <code>{output || 'Click "Run" to see the output.'}</code>
            </pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
