import { CompilerView } from './components/compiler-view';

export default function CompilerPage() {
    return (
        <div className="container mx-auto py-12 flex-grow flex flex-col h-full">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold font-headline tracking-tighter">Online Compiler</h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Write, run, and debug code in real-time. Our compiler supports multiple languages and provides instant feedback.
                </p>
            </header>
            <div className="flex-grow flex">
                <CompilerView />
            </div>
        </div>
    )
}
