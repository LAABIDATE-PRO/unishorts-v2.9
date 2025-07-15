import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Film } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import RejectFilmDialog from '@/components/admin/RejectFilmDialog';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

const AdminFilms = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('in_review');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filmToReject, setFilmToReject] = useState<Film | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilms = async () => {
      setIsLoading(true);
      let query = supabase.from('films').select('*').order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      if (debouncedSearchTerm) {
        query = query.ilike('title', `%${debouncedSearchTerm}%`);
      }

      const { data, error } = await query;
      if (error) {
        showError('Failed to fetch films.');
        console.error(error);
      } else {
        setFilms(data || []);
      }
      setIsLoading(false);
    };
    fetchFilms();
  }, [filter, debouncedSearchTerm]);

  const updateFilmStatus = async (filmId: string, status: Film['status'], rejection_reason?: string) => {
    const { error } = await supabase
      .from('films')
      .update({ status, rejection_reason: rejection_reason || null })
      .eq('id', filmId);
    
    if (error) {
      showError(`Failed to update film status.`);
    } else {
      showSuccess(`Film has been ${status}.`);
      setFilms(films.filter(f => f.id !== filmId));
    }
  };

  const deleteFilm = async (filmId: string) => {
    if (!confirm('Are you sure you want to permanently delete this film?')) return;
    const { error } = await supabase.from('films').delete().eq('id', filmId);
    if (error) {
      showError('Failed to delete film.');
    } else {
      showSuccess('Film deleted successfully.');
      setFilms(films.filter(f => f.id !== filmId));
    }
  };

  const getStatusBadge = (status: Film['status']) => {
    switch (status) {
      case 'published': return <Badge variant="default" className="bg-green-500">Published</Badge>;
      case 'in_review': return <Badge variant="secondary">In Review</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Film Management</CardTitle>
        <CardDescription>Approve, reject, and manage all film submissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button variant={filter === 'in_review' ? 'default' : 'outline'} onClick={() => setFilter('in_review')}>In Review</Button>
            <Button variant={filter === 'published' ? 'default' : 'outline'} onClick={() => setFilter('published')}>Published</Button>
            <Button variant={filter === 'rejected' ? 'default' : 'outline'} onClick={() => setFilter('rejected')}>Rejected</Button>
            <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
          </div>
          <Input 
            placeholder="Search by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Director</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
            ) : films.length > 0 ? films.map(film => (
              <TableRow key={film.id}>
                <TableCell className="font-medium">{film.title}</TableCell>
                <TableCell>{film.director_names}</TableCell>
                <TableCell>{getStatusBadge(film.status)}</TableCell>
                <TableCell>{new Date(film.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {film.status === 'in_review' && (
                        <>
                          <DropdownMenuItem onClick={() => updateFilmStatus(film.id, 'published')}><CheckCircle className="mr-2 h-4 w-4" />Approve</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFilmToReject(film)}><XCircle className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem onClick={() => navigate(`/film/${film.id}`)}><Eye className="mr-2 h-4 w-4" />View Film</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteFilm(film.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5} className="text-center">No films found for this filter.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        {filmToReject && (
          <RejectFilmDialog
            film={filmToReject}
            onClose={() => setFilmToReject(null)}
            onConfirm={(reason) => {
              updateFilmStatus(filmToReject.id, 'rejected', reason);
              setFilmToReject(null);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AdminFilms;