import { AdminHeader } from "./components/header";
import { Sidebar } from "./components/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-grow flex flex-col ml-64">
        <AdminHeader />
        <main className="flex-grow p-8 bg-muted/30 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
