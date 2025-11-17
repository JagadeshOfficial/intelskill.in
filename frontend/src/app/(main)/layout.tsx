import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

export default function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow flex">
                {children}
            </main>
            <Footer />
        </div>
    )
}
