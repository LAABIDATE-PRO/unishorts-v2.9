import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Institution } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import InstitutionDialog from '@/components/admin/InstitutionDialog';

const AdminInstitutions = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  const fetchInstitutions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('institutions').select('*').order('name');
    if (error) {
      showError('Failed to fetch institutions.');
    } else {
      setInstitutions(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleSave = async (values: { name: string; approved_domains?: string[] }, id?: string) => {
    setIsSaving(true);
    const { error } = id
      ? await supabase.from('institutions').update(values).eq('id', id).select().single()
      : await supabase.from('institutions').insert(values).select().single();

    if (error) {
      showError(error.message);
    } else {
      showSuccess(`Institution ${id ? 'updated' : 'created'} successfully.`);
      setIsDialogOpen(false);
      fetchInstitutions();
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this institution?')) return;
    const { error } = await supabase.from('institutions').delete().eq('id', id);
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Institution deleted.');
      fetchInstitutions();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Institution Management</CardTitle>
            <CardDescription>Manage approved universities and their email domains.</CardDescription>
          </div>
          <Button onClick={() => { setSelectedInstitution(null); setIsDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Institution
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Approved Domains</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
            ) : institutions.map(inst => (
              <TableRow key={inst.id}>
                <TableCell className="font-medium">{inst.name}</TableCell>
                <TableCell>{inst.approved_domains?.join(', ')}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="icon" onClick={() => { setSelectedInstitution(inst); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(inst.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <InstitutionDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          institution={selectedInstitution}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </CardContent>
    </Card>
  );
};

export default AdminInstitutions;