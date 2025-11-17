import { UserNav } from "@/components/layout/user-nav"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="h-16 flex items-center px-8 border-b bg-background z-10">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full max-w-sm pl-9"
        />
      </div>
      <UserNav profileUrl="/admin/profile" />
    </header>
  )
}
