import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { Film } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '../ui/skeleton';

const MyFilms = () => {
  const { session, isLoading: isSessionLoading } = useSession();
  const navigate = useNavigate();
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFilms = async () => {
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
        .in('status', ['published', 'in_review', 'rejected']);
      
      if (error) {
        showError('Failed to fetch films.');
        console.error('Error fetching films:', error);
      } else {
        setFilms(data || []);
      }
      setIsLoading(false);
    };
    fetchFilms();
  }, [session, isSessionLoading]);

  const deleteFilm = async (filmId: string) => {
    if (!confirm('Are you sure you want to delete this film? This action cannot be undone.')) return;
    
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

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Films</CardTitle>
        <CardDescription>A list of all your published, in-review, or rejected films.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Publish Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {films.length > 0 ? films.map(film => (
              <TableRow key={film.id}>
                <TableCell className="font-medium">{film.title}</TableCell>
                <TableCell>{getStatusBadge(film.status)}</TableCell>
                <TableCell>{film.view_count.toLocaleString()}</TableCell>
                <TableCell>{new Date(film.created_at).toLocaleDateString('en-US')}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/film/${film.id}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem disabled><BarChart className="mr-2 h-4 w-4" />Analytics</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/film/${film.id}`)}><Eye className="mr-2 h-4 w-4" />Preview</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteFilm(film.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5} className="text-center">You haven't published any films yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MyFilms;