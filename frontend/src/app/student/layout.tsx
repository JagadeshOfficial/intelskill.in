
import { StudentHeader } from "./components/header";
import { StudentSidebar } from "./components/sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <StudentSidebar />
      <div className="flex-grow flex flex-col ml-64">
        <StudentHeader />
        <main className="flex-grow p-8 bg-muted/30 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
