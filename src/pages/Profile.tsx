import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Calendar, Film as FilmIcon } from 'lucide-react';
import Header from '@/components/Header';
import { useSession } from '@/components/SessionContextProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { FilmCard } from '@/components/FilmCard';
import { Profile as ProfileType, Film as FilmType } from '@/types';
import BackButton from '@/components/BackButton';

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { session } = useSession();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [films, setFilms] = useState<FilmType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) {
        setError('User not found.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError || !profileData) {
          throw new Error('User not found.');
        }
        setProfile(profileData);

        const { data: filmsData, error: filmsError } = await supabase
          .from('films')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('visibility', 'public')
          .order('created_at', { ascending: false });

        if (filmsError) {
          console.error('Failed to fetch films:', filmsError.message);
          setFilms([]);
        } else {
          setFilms(filmsData || []);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  const isOwnProfile = session?.user?.id === profile?.id;

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center text-center gap-4 mb-8">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
          <div className="p-4 border-t border-border text-center space-y-2">
            <Skeleton className="h-6 w-24 mx-auto" />
            <Skeleton className="h-4 w-full max-w-lg mx-auto" />
            <Skeleton className="h-4 w-48 mt-4 mx-auto" />
          </div>
          <div className="mt-8">
            <Skeleton className="h-8 w-56 mb-4 mx-auto" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-60 w-full" />)}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 text-center">
          <h2 className="text-2xl font-bold text-destructive">{error || 'Profile not found'}</h2>
          <p className="text-muted-foreground mt-2">The user you are looking for does not exist.</p>
          <Link to="/"><Button variant="link">Return to Home</Button></Link>
        </div>
      </>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <BackButton />
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <Avatar className="h-32 w-32 border-4 border-primary">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback>
              <User className="h-16 w-16" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{profile.first_name} {profile.last_name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          {isOwnProfile && (
            <Link to="/settings" className="mt-2">
              <Button>Edit Profile</Button>
            </Link>
          )}
        </div>
        
        <div className="p-4 border-t border-border text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-semibold text-lg mb-2">Bio</h2>
            <p className="text-muted-foreground">{profile.short_bio || 'No bio provided.'}</p>
          </div>
          <div className="flex items-center justify-center text-muted-foreground mt-4 text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            Joined in {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold flex items-center justify-center mb-4">
            <FilmIcon className="mr-2" />
            Published Films
          </h2>
          {films.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {films.map(film => <FilmCard key={film.id} film={film as any} session={session} />)}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">This user has not published any films yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;