import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import Header from '@/components/Header';
import { FilmCard } from '@/components/FilmCard';
import { Film } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { showError } from '@/utils/toast';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';

const Favorites = () => {
  const { session } = useSession();
  const [favoriteFilms, setFavoriteFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('films(*)')
        .eq('user_id', session.user.id);

      if (error) {
        showError('Failed to fetch favorites.');
        console.error(error);
      } else {
        const films = data.flatMap(fav => fav.films).filter(Boolean) as Film[];
        setFavoriteFilms(films);
      }
      setIsLoading(false);
    };
    fetchFavorites();
  }, [session]);

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Heart className="mr-3 text-red-500" />
          Favorites
        </h1>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-60 w-full" />)}
          </div>
        ) : favoriteFilms.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favoriteFilms.map(film => (
              <FilmCard key={film.id} film={film} session={session} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-lg">
            <h2 className="text-xl font-semibold">Your favorites list is empty</h2>
            <p className="text-muted-foreground mt-2">Add films you like to watch them later.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Favorites;