
'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AuthAvatar from "@/components/layout/auth-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, PlusCircle, Loader2, Edit2, Trash2, Camera } from "lucide-react";
import { useEffect, useState } from "react";

interface Admin {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  photoUrl?: string;
  role: string;
  status: string;
  lastLogin: number[] | null;
  createdAt: number[];
}

interface AddAdminForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  profileImage?: File;
  role: string;
}

interface EditAdminForm {
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string;
  role: string;
  profileImage?: File;
  profileImagePreview?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Admin Dialog State
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formData, setFormData] = useState<AddAdminForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'ADMIN',
  });

  // Edit Admin Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [editFormError, setEditFormError] = useState('');
  const [editFormSuccess, setEditFormSuccess] = useState('');
  const [editFormData, setEditFormData] = useState<EditAdminForm>({
    firstName: '',
    lastName: '',
    role: 'ADMIN',
  });

  // Delete Admin Alert State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Fetch admins on mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/admin/list`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch admins: ${response.statusText}`);
      }

      const data = await response.json();
      setAdmins(data.admins || []);
    } catch (err) {
      console.error('Error fetching admins:', err);
      setError(err instanceof Error ? err.message : 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  // Add Admin Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setFormError('All fields are required');
      return;
    }

    try {
      setFormLoading(true);
      
      // Step 1: Create admin without image
      const createData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        mobileNumber: formData.mobileNumber,
        role: formData.role,
      };

      const createResponse = await fetch(`${API_BASE_URL}/api/v1/auth/admin/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });

      const createdAdmin = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createdAdmin.message || `Failed to create admin: ${createResponse.statusText}`);
      }

      // Step 2: Upload image if provided
      if (formData.profileImage && createdAdmin.id) {
        const formDataWithFile = new FormData();
        formDataWithFile.append('file', formData.profileImage);

        const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/auth/admin/${createdAdmin.id}/avatar`, {
          method: 'POST',
          body: formDataWithFile,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          console.warn('Image upload failed:', uploadData.message);
          // Continue anyway - admin was created, just image upload failed
        }
      }

      setFormSuccess('Admin created successfully!');
      setFormData({ email: '', password: '', firstName: '', lastName: '', role: 'ADMIN' });

      setTimeout(() => {
        fetchAdmins();
        setAddDialogOpen(false);
      }, 1000);

    } catch (err) {
      console.error('Error creating admin:', err);
      setFormError(err instanceof Error ? err.message : 'Failed to create admin');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit Admin Handlers
  const handleEditClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditFormData({
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
      mobileNumber: admin.mobileNumber,
      role: admin.role,
      profileImagePreview: admin.photoUrl ? `${API_BASE_URL}/api/v1/auth/admin/image/${admin.photoUrl}` : undefined,
    });
    setEditFormError('');
    setEditFormSuccess('');
    setEditDialogOpen(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditFormData(prev => ({ 
        ...prev, 
        profileImage: file,
        profileImagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleEditRoleChange = (value: string) => {
    setEditFormData(prev => ({ ...prev, role: value }));
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    setEditFormError('');
    setEditFormSuccess('');

    if (!editFormData.email || !editFormData.firstName || !editFormData.lastName) {
      setEditFormError('All fields are required');
      return;
    }

    try {
      setEditFormLoading(true);
      
      // Step 1: Update admin details
      const updateResponse = await fetch(`${API_BASE_URL}/api/v1/auth/admin/${selectedAdmin.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editFormData.email,
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          mobileNumber: editFormData.mobileNumber,
          role: editFormData.role,
        }),
      });

      const updatedAdminData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updatedAdminData.message || `Failed to update admin: ${updateResponse.statusText}`);
      }

      // Step 2: Upload image if new file selected
      if (editFormData.profileImage) {
        const formDataWithFile = new FormData();
        formDataWithFile.append('file', editFormData.profileImage);

        const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/auth/admin/${selectedAdmin.id}/avatar`, {
          method: 'POST',
          body: formDataWithFile,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          console.warn('Image upload failed:', uploadData.message);
          // Continue anyway - admin was updated, just image upload failed
        }
      }

      setEditFormSuccess('Admin updated successfully!');

      setTimeout(() => {
        fetchAdmins();
        setEditDialogOpen(false);
      }, 1000);

    } catch (err) {
      console.error('Error updating admin:', err);
      setEditFormError(err instanceof Error ? err.message : 'Failed to update admin');
    } finally {
      setEditFormLoading(false);
    }
  };

  // Delete Admin Handlers
  const handleDeleteClick = (admin: Admin) => {
    setAdminToDelete(admin);
    setDeleteError('');
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/admin/${adminToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to delete admin: ${response.statusText}`);
      }

      setDeleteDialogOpen(false);
      setAdminToDelete(null);
      fetchAdmins();

    } catch (err) {
      console.error('Error deleting admin:', err);
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete admin');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatLastLogin = (dateArray: number[] | null) => {
    if (!dateArray || dateArray.length === 0) return 'Never';
    const [year, month, day, hour, minute] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter">Manage Admins</h1>
            <p className="text-lg text-muted-foreground mt-2">
            View, edit, and manage administrator accounts.
            </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
              <DialogDescription>
                Create a new administrator account. All fields are required.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddAdmin} className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              {formSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">{formSuccess}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter secure password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={formLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number (Optional)</Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.mobileNumber || ''}
                  onChange={handleInputChange}
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Photo (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="profileImage"
                    name="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFormData(prev => ({ ...prev, profileImage: file }));
                    }}
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange} disabled={formLoading}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Admin'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {/* Edit Admin Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
            <DialogDescription>
              Update administrator details, email, and role.
            </DialogDescription>
          </DialogHeader>

          {selectedAdmin && (
            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              {editFormError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{editFormError}</p>
                </div>
              )}

              {editFormSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">{editFormSuccess}</p>
                </div>
              )}

              {/* Admin Avatar with Upload */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    {editFormData.profileImagePreview ? (
                        <>
                          <AuthAvatar src={editFormData.profileImagePreview} alt="Profile preview" />
                          <AvatarFallback>{(selectedAdmin.firstName?.[0] || 'A') + (selectedAdmin.lastName?.[0] || '')}</AvatarFallback>
                        </>
                    ) : selectedAdmin.photoUrl ? (
                      <>
                          <AuthAvatar photoKey={selectedAdmin.photoUrl} alt={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`} />
                          <AvatarFallback>{(selectedAdmin.firstName?.[0] || 'A') + (selectedAdmin.lastName?.[0] || '')}</AvatarFallback>
                      </>
                    ) : (
                      <>
                          <AuthAvatar src={`https://i.pravatar.cc/150?u=${selectedAdmin.email}`} alt={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`} />
                          <AvatarFallback>{(selectedAdmin.firstName?.[0] || 'A') + (selectedAdmin.lastName?.[0] || '')}</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition">
                    <Camera className="h-4 w-4" />
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                      disabled={editFormLoading}
                    />
                  </label>
                </div>
                <div>
                  <p className="font-semibold">{selectedAdmin.firstName} {selectedAdmin.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
                  <Badge variant="secondary" className="mt-2">{selectedAdmin.status}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editEmail">Email Address</Label>
                <Input
                  id="editEmail"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  required
                  disabled={editFormLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    name="firstName"
                    placeholder="John"
                    value={editFormData.firstName}
                    onChange={handleEditInputChange}
                    required
                    disabled={editFormLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    name="lastName"
                    placeholder="Doe"
                    value={editFormData.lastName}
                    onChange={handleEditInputChange}
                    required
                    disabled={editFormLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editMobile">Mobile Number</Label>
                <Input
                  id="editMobile"
                  name="mobileNumber"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={editFormData.mobileNumber || ''}
                  onChange={handleEditInputChange}
                  disabled={editFormLoading}
                />
              </div>

              {/* Profile photo is handled via the avatar upload button above. Removed duplicate file input. */}

              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select value={editFormData.role} onValueChange={handleEditRoleChange} disabled={editFormLoading}>
                  <SelectTrigger id="editRole">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="MODERATOR">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={editFormLoading}>
                {editFormLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Admin'
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-3">
            {adminToDelete && (
              <>
                <div>Are you sure you want to delete <strong>{adminToDelete.firstName} {adminToDelete.lastName}</strong> ({adminToDelete.email})?</div>
                <div className="text-red-600 text-sm">This action cannot be undone.</div>
              </>
            )}
            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <div className="text-sm text-red-700">{deleteError}</div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <main>
        <Card>
            <CardContent className="pt-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading admins...</p>
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No admins found</p>
                </div>
              ) : (
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Mobile</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.map(admin => (
                          <TableRow key={admin.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  {admin.photoUrl ? (
                                    <>
                                      <AuthAvatar photoKey={admin.photoUrl} alt={`${admin.firstName} ${admin.lastName}`} />
                                      <AvatarFallback>{(admin.firstName?.[0] || 'A') + (admin.lastName?.[0] || '')}</AvatarFallback>
                                    </>
                                  ) : (
                                    <>
                                      <AuthAvatar src={`https://i.pravatar.cc/150?u=${admin.email}`} alt={`${admin.firstName} ${admin.lastName}`} />
                                      <AvatarFallback>{(admin.firstName?.[0] || 'A') + (admin.lastName?.[0] || '')}</AvatarFallback>
                                    </>
                                  )}
                                </Avatar>
                                <span className="font-medium">{admin.firstName} {admin.lastName}</span>
                              </div>
                            </TableCell>
                            <TableCell>{admin.mobileNumber || '-'}</TableCell>
                            <TableCell>{admin.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{admin.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={admin.status === 'ACTIVE' ? 'default' : 'destructive'}>
                                {admin.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatLastLogin(admin.lastLogin)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditClick(admin)} className="flex items-center gap-2 cursor-pointer">
                                    <Edit2 className="h-4 w-4" />
                                    Edit Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteClick(admin)} className="text-destructive flex items-center gap-2 cursor-pointer">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Admin
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                </Table>
              )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
