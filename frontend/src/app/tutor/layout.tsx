
import { TutorHeader } from "./components/header";
import { TutorSidebar } from "./components/sidebar";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <TutorSidebar />
      <div className="flex-grow flex flex-col ml-64">
        <TutorHeader />
        <main className="flex-grow p-8 bg-muted/30 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
