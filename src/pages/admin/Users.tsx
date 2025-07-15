import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminUser } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle, Eye, Trash2, UserCog } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserDetailDialog from '@/components/admin/UserDetailDialog';
import RejectUserDialog from '@/components/admin/RejectUserDialog';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending_admin_approval');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userToReject, setUserToReject] = useState<AdminUser | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.rpc('get_admin_user_list');
    if (error) {
      showError('Failed to fetch users.');
      console.error(error);
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => filter === 'all' || user.account_status === filter)
      .filter(user =>
        debouncedSearchTerm ?
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) :
        true
      );
  }, [users, filter, debouncedSearchTerm]);

  const handleApproveUser = async (user: AdminUser) => {
    const { error } = await supabase.from('profiles').update({ account_status: 'active' }).eq('id', user.id);
    if (error) {
      showError('Failed to approve user.');
    } else {
      showSuccess('User approved. They can now log in.');
      fetchUsers();
    }
  };

  const handleRejectUser = async (user: AdminUser, reason: string) => {
    const { error } = await supabase.from('profiles').update({ account_status: 'rejected', rejection_reason: reason }).eq('id', user.id);
    if (error) {
      showError('Failed to reject user.');
    } else {
      showSuccess('User rejected.');
      fetchUsers();
    }
    setUserToReject(null);
  };

  const updateUserRole = async (userId: string, role: 'user' | 'moderator' | 'admin') => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    if (error) {
      showError('Failed to update user role.');
    } else {
      showSuccess('User role updated.');
      fetchUsers();
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This will permanently delete the user and all their data.')) return;
    const { error } = await supabase.functions.invoke('delete-user', { body: { user_id: userId } });
    if (error) {
      showError('Failed to delete user.');
    } else {
      showSuccess('User deleted successfully.');
      fetchUsers();
    }
  };

  const getStatusBadge = (status: AdminUser['account_status']) => {
    switch (status) {
      case 'active': return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'pending_admin_approval': return <Badge variant="secondary">Pending Approval</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'disabled': return <Badge variant="destructive">Disabled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage all registered users on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button variant={filter === 'pending_admin_approval' ? 'default' : 'outline'} onClick={() => setFilter('pending_admin_approval')}>Pending</Button>
            <Button variant={filter === 'active' ? 'default' : 'outline'} onClick={() => setFilter('active')}>Active</Button>
            <Button variant={filter === 'rejected' ? 'default' : 'outline'} onClick={() => setFilter('rejected')}>Rejected</Button>
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
          </div>
          <Input 
            placeholder="Search by name, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : filteredUsers.length > 0 ? filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>{getStatusBadge(user.account_status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.account_status === 'pending_admin_approval' && (
                        <>
                          <DropdownMenuItem onClick={() => handleApproveUser(user)}><CheckCircle className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setUserToReject(user)}><XCircle className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={() => setSelectedUser(user)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUserRole(user.id, 'admin')}><UserCog className="mr-2 h-4 w-4" />Make Admin</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUserRole(user.id, 'moderator')}><UserCog className="mr-2 h-4 w-4" />Make Moderator</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateUserRole(user.id, 'user')}><UserCog className="mr-2 h-4 w-4" />Make User</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteUser(user.id)}><Trash2 className="mr-2 h-4 w-4" />Delete User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5} className="text-center">No users found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <UserDetailDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
        {userToReject && (
          <RejectUserDialog
            user={userToReject}
            onClose={() => setUserToReject(null)}
            onConfirm={(reason) => handleRejectUser(userToReject, reason)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AdminUsers;