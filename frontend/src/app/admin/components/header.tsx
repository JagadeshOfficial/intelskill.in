"use client";
import { UserNav } from "@/components/layout/user-nav"
import { Input } from "@/components/ui/input"
import { Search, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function AdminHeader() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<{id:number,action:string}|null>(null);

  useEffect(() => {
    if (showNotifications) {
      setLoading(true);
      fetch('/api/v1/auth/admin/notifications')
        .then(res => res.json())
        .then(data => setNotifications(Array.isArray(data) ? data : (data.notifications || [])))
        .finally(() => setLoading(false));
    }
  }, [showNotifications]);

  const handleAction = async (id:number, action:string) => {
    setConfirm(null);
    await fetch(`/api/v1/auth/admin/notifications/${id}/action`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    setNotifications(notifications.filter((n:any) => n.id !== id));
  };

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
      <div className="relative">
        <Button variant="ghost" onClick={() => setShowNotifications(v => !v)}>
          <Bell />
        </Button>
        {showNotifications && (
          <div className="absolute right-0 top-12 bg-white shadow-lg rounded w-96 z-50">
            <h4 className="p-4 font-bold">Notifications</h4>
            <ul>
              {loading ? <li className="p-4">Loading...</li> : null}
              {notifications.map((n:any) => (
                <li key={n.id} className="p-4 border-b">
                  <div>{n.message}</div>
                  {n.status === 'PENDING' && (
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" className="bg-green-500 text-white" onClick={() => setConfirm({id:n.id,action:'ACCEPT'})}>Accept</Button>
                      <Button size="sm" className="bg-red-500 text-white" onClick={() => setConfirm({id:n.id,action:'REJECT'})}>Reject</Button>
                    </div>
                  )}
                </li>
              ))}
              {notifications.length === 0 && !loading && <li className="p-4 text-gray-500">No notifications</li>}
            </ul>
          </div>
        )}
        {confirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setConfirm(null)} />
            <div className="relative bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-bold mb-2">Confirm {confirm.action === 'ACCEPT' ? 'Accept' : 'Reject'} Tutor?</h3>
              <p>Are you sure you want to {confirm.action === 'ACCEPT' ? 'accept' : 'reject'} this tutor registration?</p>
              <div className="mt-4 flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
                <Button onClick={() => handleAction(confirm.id, confirm.action)}>{confirm.action === 'ACCEPT' ? 'Accept' : 'Reject'}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <UserNav profileUrl="/admin/profile" />
    </header>
  )
}
