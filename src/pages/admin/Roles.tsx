import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Permission, RolePermission } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';

const roles = ['admin', 'moderator', 'user'];

const AdminRoles = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, number[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: perms, error: permsError } = await supabase.from('permissions').select('*');
    const { data: rolePerms, error: rolePermsError } = await supabase.from('role_permissions').select('*');

    if (permsError || rolePermsError) {
      showError('Failed to load permissions data.');
    } else {
      setPermissions(perms || []);
      const rpMap: Record<string, number[]> = {};
      (rolePerms || []).forEach(rp => {
        if (!rpMap[rp.role]) rpMap[rp.role] = [];
        rpMap[rp.role].push(rp.permission_id);
      });
      setRolePermissions(rpMap);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePermissionChange = (role: string, permissionId: number, checked: boolean) => {
    setRolePermissions(prev => {
      const currentPerms = prev[role] || [];
      if (checked) {
        return { ...prev, [role]: [...currentPerms, permissionId] };
      } else {
        return { ...prev, [role]: currentPerms.filter(id => id !== permissionId) };
      }
    });
  };

  const handleSaveChanges = async (role: string) => {
    const permissionIds = rolePermissions[role] || [];
    
    // Delete existing permissions for the role
    const { error: deleteError } = await supabase.from('role_permissions').delete().eq('role', role);
    if (deleteError) {
      showError(`Failed to update permissions for ${role}.`);
      return;
    }

    // Insert new permissions
    if (permissionIds.length > 0) {
      const newRolePerms = permissionIds.map(pid => ({ role, permission_id: pid }));
      const { error: insertError } = await supabase.from('role_permissions').insert(newRolePerms);
      if (insertError) {
        showError(`Failed to update permissions for ${role}.`);
        return;
      }
    }
    
    showSuccess(`Permissions for ${role} updated successfully.`);
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {roles.map(role => (
        <Card key={role}>
          <CardHeader>
            <CardTitle className="capitalize">{role}</CardTitle>
            <CardDescription>Set permissions for the {role} role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {permissions.map(permission => (
              <div key={permission.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${role}-${permission.id}`}
                  checked={(rolePermissions[role] || []).includes(permission.id)}
                  onCheckedChange={(checked) => handlePermissionChange(role, permission.id, !!checked)}
                />
                <label htmlFor={`${role}-${permission.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {permission.action}
                </label>
              </div>
            ))}
            <Button className="w-full mt-4" onClick={() => handleSaveChanges(role)}>Save Changes</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminRoles;