import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Phone, Building, BookOpen, Calendar, Film as FilmIcon } from 'lucide-react';
import { AdminUser, Film } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { FilmCard } from '@/components/FilmCard';
import { Link } from 'react-router-dom';
import { useSession } from '../SessionContextProvider';

interface UserDetailDialogProps {
  user: AdminUser | null;
  onClose: () => void;
}

const UserDetailDialog = ({ user, onClose }: UserDetailDialogProps) => {
  const [userFilms, setUserFilms] = useState<Film[]>([]);
  const [isLoadingFilms, setIsLoadingFilms] = useState(true);
  const { session } = useSession();

  useEffect(() => {
    const fetchUserFilms = async () => {
      if (!user?.id) return;
      setIsLoadingFilms(true);
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .eq('user_id', user.id)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user films:', error);
        setUserFilms([]);
      } else {
        setUserFilms(data || []);
      }
      setIsLoadingFilms(false);
    };

    if (user) {
      fetchUserFilms();
    } else {
      setUserFilms([]);
    }
  }, [user]);

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback><User /></AvatarFallback>
            </Avatar>
            <div>
              {user.first_name} {user.last_name}
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            User profile details and published films.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" /> {user.email}
              </p>
              {user.university_email && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" /> {user.university_email} (University)
                </p>
              )}
              {user.phone_number && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" /> {user.phone_number}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Additional Information</h3>
              {user.institution_name && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" /> {user.institution_name}
                </p>
              )}
              {user.field_of_study && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" /> {user.field_of_study}
                </p>
              )}
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" /> Joined on {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          {user.short_bio && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Short Bio</h3>
              <p className="text-sm text-muted-foreground">{user.short_bio}</p>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
              <FilmIcon className="h-5 w-5" /> Published Films ({userFilms.length})
            </h3>
            {isLoadingFilms ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
              </div>
            ) : userFilms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userFilms.map(film => (
                  <Link to={`/film/${film.id}`} key={film.id} onClick={onClose}>
                    <FilmCard film={film} session={session} />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center">This user has no published films.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailDialog;