import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Film, Notification as NotificationType } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Check, X, Trash2, Edit, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import RejectFilmDialog from '@/components/admin/RejectFilmDialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logEvent } from '@/utils/logger';

type FilmWithProfile = Film & { first_name: string | null; last_name: string | null };

// Function to fetch films, to be used with React Query
const fetchAdminFilms = async (): Promise<FilmWithProfile[]> => {
  const { data, error } = await supabase.rpc('get_all_films_with_profiles');
  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

const AdminFilms = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isRejecting, setIsRejecting] = useState<FilmWithProfile | null>(null);

  // Use useQuery to fetch films
  const { data: films = [], isLoading, error: fetchError } = useQuery<FilmWithProfile[]>({
    queryKey: ['adminFilms'],
    queryFn: fetchAdminFilms,
  });

  // Show error if fetching fails
  useEffect(() => {
    if (fetchError) {
      showError('Failed to fetch films: ' + fetchError.message);
      console.error('Error fetching films:', fetchError);
    }
  }, [fetchError]);

  // Mutation for updating film status
  const updateFilmStatusMutation = useMutation({
    mutationFn: async ({ film, status, rejection_reason }: { film: FilmWithProfile; status: Film['status']; rejection_reason: string | null }) => {
      let updateData: Partial<Film> = { status, rejection_reason };
      if (status === 'published') {
        updateData.visibility = 'public'; // Ensure film is public when published
      }
      const { error } = await supabase.from('films').update(updateData).eq('id', film.id);
      if (error) throw error;

      // Create notification
      let notificationMessage = '';
      let notificationType: NotificationType['type'] | null = null;
      let url = `/film/${film.id}`;

      if (status === 'published') {
        notificationMessage = `Your film "${film.title}" has been approved and is now live!`;
        notificationType = 'film_approved';
      } else if (status === 'rejected') {
        notificationMessage = `Your film "${film.title}" was not approved. Reason: ${rejection_reason || 'No reason provided.'}`;
        notificationType = 'film_rejected';
        url = `/film/${film.id}/edit`; // Link to edit page for rejection
      }

      if (notificationType && film.user_id) {
        const { error: notificationError } = await supabase.from('notifications').insert({
          user_id: film.user_id,
          type: notificationType,
          message: notificationMessage,
          url: url,
          related_entity_id: film.id,
        });
        if (notificationError) {
          console.error('Failed to create notification:', notificationError);
        }
      }
      return null;
    },
    onSuccess: () => {
      showSuccess('Film status updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['adminFilms'] }); // Invalidate to re-fetch films
    },
    onError: (error: Error) => {
      showError(`Failed to update film status: ${error.message}`);
    },
  });

  // Mutation for deleting film
  const deleteFilmMutation = useMutation({
    mutationFn: async (filmId: string) => {
      const { error } = await supabase.from('films').delete().eq('id', filmId);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      showSuccess('Film deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['adminFilms'] }); // Invalidate to re-fetch films
    },
    onError: (error: Error) => {
      showError(`Failed to delete film: ${error.message}`);
    },
  });

  const handleUpdateFilmStatus = (film: FilmWithProfile, status: Film['status'], rejection_reason: string | null = null) => {
    updateFilmStatusMutation.mutate({ film, status, rejection_reason });
    if (status === 'published') {
      logEvent('FILM_APPROVED', { filmId: film.id, filmTitle: film.title, message: `Film "${film.title}" was approved.` });
    } else if (status === 'rejected') {
      logEvent('FILM_REJECTED', { filmId: film.id, filmTitle: film.title, reason: rejection_reason, message: `Film "${film.title}" was rejected.` });
    }
  };

  const handleDeleteFilm = (filmId: string) => {
    if (!confirm('Are you sure you want to permanently delete this film?')) return;
    const filmToDelete = films.find(f => f.id === filmId);
    deleteFilmMutation.mutate(filmId);
    if (filmToDelete) {
      logEvent('FILM_DELETED', { filmId: filmToDelete.id, filmTitle: filmToDelete.title, message: `Film "${filmToDelete.title}" was deleted.` });
    }
  };

  const getStatusBadge = (status: Film['status']) => {
    switch (status) {
      case 'published': return <Badge variant="default" className="bg-green-500">Published</Badge>;
      case 'in_review': return <Badge variant="secondary">In Review</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <Card><CardContent className="p-6"><Skeleton className="h-80 w-full" /></CardContent></Card>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Manage Films</CardTitle>
          <CardDescription>Review, approve, reject, or delete film submissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {films.length > 0 ? films.map(film => (
                <TableRow key={film.id}>
                  <TableCell className="font-medium">{film.title}</TableCell>
                  <TableCell>{(film.first_name && film.last_name) ? `${film.first_name} ${film.last_name}` : 'N/A'}</TableCell>
                  <TableCell>{getStatusBadge(film.status)}</TableCell>
                  <TableCell>{(film.view_count || 0).toLocaleString()}</TableCell>
                  <TableCell>{new Date(film.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {film.status === 'in_review' && (
                          <>
                            <DropdownMenuItem onClick={() => handleUpdateFilmStatus(film, 'published')}><Check className="mr-2 h-4 w-4 text-green-500" />Approve</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsRejecting(film)}><X className="mr-2 h-4 w-4" />Reject</DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem onClick={() => navigate(`/film/${film.id}`)}><Eye className="mr-2 h-4 w-4" />Preview</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/film/${film.id}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteFilm(film.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} className="text-center">No films found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {isRejecting && (
        <RejectFilmDialog
          film={isRejecting}
          onClose={() => setIsRejecting(null)}
          onConfirm={(reason) => {
            if (isRejecting) {
              handleUpdateFilmStatus(isRejecting, 'rejected', reason);
            }
            setIsRejecting(null);
          }}
        />
      )}
    </>
  );
};

export default AdminFilms;