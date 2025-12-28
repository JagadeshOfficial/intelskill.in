import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'


export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col font-sans bg-white text-slate-900 selection:bg-blue-100">
            <Header />
            <main className="flex-grow flex flex-col">
                {children}
            </main>
            <Footer />
        </div>
    )
}
