import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, User, Trash2, Shield, UserCheck, UserX, Search, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { showError, showSuccess } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import UserDetailDialog from '@/components/admin/UserDetailDialog';
import { AdminUser } from '@/types';
import { logEvent } from '@/utils/logger';
import RejectUserDialog from '@/components/admin/RejectUserDialog';

const fetchUsers = async (): Promise<AdminUser[]> => {
  const { data, error } = await supabase.rpc('get_admin_user_list');
  if (error) throw new Error(error.message);
  return data || [];
};

const timeAgo = (date: string | null): string => {
  if (!date) return 'N/A';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isRejecting, setIsRejecting] = useState<AdminUser | null>(null);

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['adminUsers'],
    queryFn: fetchUsers,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  };

  const updateUserProfile = useMutation({
    mutationFn: async (variables: { id: string; data: object }) => {
      const { error } = await supabase.from('profiles').update(variables.data).eq('id', variables.id);
      if (error) throw error;
      return null;
    },
    ...mutationOptions,
  });

  const deleteUser = useMutation({
    mutationFn: (userId: string) =>
      supabase.functions.invoke('delete-user', { body: { user_id: userId } }),
    ...mutationOptions,
    onSuccess: () => {
      showSuccess('User deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const handleApprove = (user: AdminUser) => {
    updateUserProfile.mutate({ id: user.id, data: { account_status: 'active' } }, {
      onSuccess: async () => {
        showSuccess(`User ${user.email} has been approved.`);
        logEvent('ADMIN_USER_APPROVED', { 
            targetUserId: user.id, 
            targetUserEmail: user.email, 
            message: `User account for ${user.email} was approved.`
        });
        await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'account_approved',
            message: 'Congratulations! Your account has been approved. You can now access all of UniShorts.',
            url: '/dashboard',
            related_entity_id: user.id
        });
      }
    });
  };

  const handleReject = (user: AdminUser, reason: string) => {
    updateUserProfile.mutate({ id: user.id, data: { account_status: 'rejected' } }, {
      onSuccess: async () => {
        showSuccess(`User ${user.email} has been rejected.`);
        logEvent('ADMIN_USER_REJECTED', { 
            targetUserId: user.id, 
            targetUserEmail: user.email, 
            reason: reason,
            message: `User account for ${user.email} was rejected.`
        });
        await supabase.from('notifications').insert({
            user_id: user.id,
            type: 'account_rejected',
            message: `Your account was not approved. Reason: ${reason}`,
            url: '/rejected',
            related_entity_id: user.id
        });
        setIsRejecting(null);
      }
    });
  };

  const handleRoleChange = (id: string, role: string) => {
    const user = users.find(u => u.id === id);
    updateUserProfile.mutate({ id, data: { role } });
    showSuccess(`User role updated to ${role}.`);
    if (user) {
        logEvent('ADMIN_ROLE_CHANGE', { 
            targetUserId: user.id, 
            targetUserEmail: user.email, 
            newRole: role,
            message: `Role of ${user.email} changed to ${role}.`
        });
    }
  };

  const handleStatusChange = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    const user = users.find(u => u.id === id);
    updateUserProfile.mutate({ id, data: { account_status: newStatus } });
    showSuccess(`User account has been ${newStatus}.`);
    if (user) {
        logEvent('ADMIN_USER_STATUS_CHANGE', { 
            targetUserId: user.id, 
            targetUserEmail: user.email, 
            newStatus: newStatus,
            message: `Account status of ${user.email} changed to ${newStatus}.`
        });
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active': return <Badge variant="outline" className="border-green-500 text-green-500">Active</Badge>;
      case 'pending_admin_approval': return <Badge variant="secondary">Pending Approval</Badge>;
      case 'pending_email_verification': return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending Email</Badge>;
      case 'disabled': return <Badge variant="destructive">Disabled</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View, search, and manage all users on the platform.</CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-1/3"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Films</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-10 w-full" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TableRow key={user.id} onClick={() => setSelectedUser(user)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                  <TableCell>{getStatusBadge(user.account_status)}</TableCell>
                  <TableCell>{user.film_count}</TableCell>
                  <TableCell>{(user.total_views || 0).toLocaleString()}</TableCell>
                  <TableCell>{timeAgo(user.last_sign_in_at)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {user.account_status === 'pending_admin_approval' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(user)}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                <span>Approve User</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setIsRejecting(user)} className="text-red-600">
                                <XCircle className="mr-2 h-4 w-4" />
                                <span>Reject User</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger><Shield className="mr-2 h-4 w-4" /><span>Change Role</span></DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuRadioGroup value={user.role || 'user'} onValueChange={(role) => handleRoleChange(user.id, role)}>
                                <DropdownMenuRadioItem value="user">User</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="moderator">Moderator</DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem onClick={() => handleStatusChange(user.id, user.account_status || 'active')}>
                            {user.account_status === 'active' ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}
                            <span>{user.account_status === 'active' ? 'Disable Account' : 'Enable Account'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /><span>Delete User</span></DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user and their data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteUser.mutate(user.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={7} className="text-center h-24">No users found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <UserDetailDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
      {isRejecting && (
        <RejectUserDialog
          user={isRejecting}
          onClose={() => setIsRejecting(null)}
          onConfirm={(reason) => {
            handleReject(isRejecting, reason);
          }}
        />
      )}
    </Card>
  );
};

export default AdminUsers;