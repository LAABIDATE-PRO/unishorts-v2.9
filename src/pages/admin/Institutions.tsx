import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Institution } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { showError, showSuccess } from '@/utils/toast';
import InstitutionDialog from '@/components/admin/InstitutionDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const fetchInstitutions = async (): Promise<Institution[]> => {
  const { data, error } = await supabase.from('institutions').select('*').order('name');
  if (error) throw new Error(error.message);
  return data;
};

const AdminInstitutions = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  const { data: institutions = [], isLoading } = useQuery<Institution[]>({
    queryKey: ['institutions'],
    queryFn: fetchInstitutions,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      setIsDialogOpen(false);
      setSelectedInstitution(null);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  };

  const saveMutation = useMutation({
    mutationFn: async ({ data, id }: { data: Partial<Institution>, id?: string }) => {
      if (id) {
        const { error } = await supabase.from('institutions').update(data).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('institutions').insert(data);
        if (error) throw error;
      }
    },
    ...mutationOptions,
    onSuccess: () => {
      showSuccess('Institution saved successfully.');
      mutationOptions.onSuccess();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('institutions').delete().eq('id', id);
      if (error) throw error;
    },
    ...mutationOptions,
    onSuccess: () => {
      showSuccess('Institution deleted successfully.');
      mutationOptions.onSuccess();
    },
  });

  const handleAddNew = () => {
    setSelectedInstitution(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>University Management</CardTitle>
              <CardDescription>Control the list of approved universities and their email domains.</CardDescription>
            </div>
            <Button onClick={handleAddNew}>Add Institution</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Approved Domains</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))
              ) : institutions.length > 0 ? (
                institutions.map(inst => (
                  <TableRow key={inst.id}>
                    <TableCell className="font-semibold">{inst.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {inst.approved_domains?.map(domain => <Badge key={domain} variant="secondary">{domain}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(inst)}>Edit</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the institution. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(inst.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">No institutions found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <InstitutionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        institution={selectedInstitution}
        onSave={(data, id) => saveMutation.mutate({ data, id })}
        isSaving={saveMutation.isPending}
      />
    </>
  );
};

export default AdminInstitutions;