import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Permission, RolePermission } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { showError, showSuccess } from '@/utils/toast';

const fetchPermissions = async (): Promise<Permission[]> => {
  const { data, error } = await supabase.from('permissions').select('*');
  if (error) throw new Error(error.message);
  return data;
};

const fetchRolePermissions = async (): Promise<RolePermission[]> => {
  const { data, error } = await supabase.from('role_permissions').select('*');
  if (error) throw new Error(error.message);
  return data;
};

const ROLES = ['admin', 'moderator', 'reviewer', 'user'];

const AdminRoles = () => {
  const queryClient = useQueryClient();

  const { data: permissions = [], isLoading: isLoadingPermissions } = useQuery<Permission[]>({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
  });

  const { data: rolePermissions = [], isLoading: isLoadingRolePermissions } = useQuery<RolePermission[]>({
    queryKey: ['rolePermissions'],
    queryFn: fetchRolePermissions,
  });

  const permissionsMap = useMemo(() => {
    const map = new Map<string, Set<number>>();
    for (const rp of rolePermissions) {
      if (!map.has(rp.role)) {
        map.set(rp.role, new Set());
      }
      map.get(rp.role)!.add(rp.permission_id);
    }
    return map;
  }, [rolePermissions]);

  const togglePermissionMutation = useMutation({
    mutationFn: async ({ role, permissionId, hasPermission }: { role: string; permissionId: number; hasPermission: boolean }) => {
      if (hasPermission) {
        const { error } = await supabase.from('role_permissions').delete().match({ role, permission_id: permissionId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('role_permissions').insert({ role, permission_id: permissionId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rolePermissions'] });
      showSuccess('Permission updated.');
    },
    onError: (error: Error) => {
      showError(`Update failed: ${error.message}`);
    },
  });

  const isLoading = isLoadingPermissions || isLoadingRolePermissions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roles & Permissions</CardTitle>
        <CardDescription>Define what each user role can and cannot do across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission</TableHead>
              {ROLES.map(role => <TableHead key={role} className="text-center capitalize">{role}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={ROLES.length + 1}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))
            ) : (
              permissions.map(permission => {
                return (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <p className="font-medium">{permission.action}</p>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    </TableCell>
                    {ROLES.map(role => {
                      const hasPermission = permissionsMap.get(role)?.has(permission.id) ?? false;
                      return (
                        <TableCell key={role} className="text-center">
                          <Checkbox
                            checked={hasPermission}
                            disabled={role === 'admin'}
                            onCheckedChange={() => togglePermissionMutation.mutate({ role, permissionId: permission.id, hasPermission })}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminRoles;