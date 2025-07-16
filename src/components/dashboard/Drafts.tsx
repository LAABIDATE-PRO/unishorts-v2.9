import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { Film } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '../ui/skeleton';
import { Edit, Trash2 } from 'lucide-react';

const Drafts = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrafts = async () => {
      if (isSessionLoading) return;

      if (!session?.user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'draft');
      
      if (error) {
        showError('Failed to fetch drafts.');
        console.error('Error fetching drafts:', error);
      } else {
        setDrafts(data || []);
      }
      setIsLoading(false);
    };
    fetchDrafts();
  }, [session, isSessionLoading]);

  const deleteDraft = async (filmId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    
    const { error } = await supabase.from('films').delete().eq('id', filmId);
    if (error) {
      showError('Failed to delete draft.');
    } else {
      showSuccess('Draft deleted successfully.');
      setDrafts(drafts.filter(d => d.id !== filmId));
    }
  };

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Drafts</CardTitle>
        <CardDescription>Films you have saved but not yet published.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.length > 0 ? drafts.map(draft => (
              <TableRow key={draft.id}>
                <TableCell className="font-medium">{draft.title || 'Untitled'}</TableCell>
                <TableCell>{new Date(draft.created_at).toLocaleDateString('en-US')}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/film/${draft.id}/edit`)}><Edit className="mr-2 h-4 w-4" />Continue Editing</Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteDraft(draft.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={3} className="text-center">You have no drafts.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Drafts;