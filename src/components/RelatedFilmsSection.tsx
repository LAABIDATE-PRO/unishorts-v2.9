import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Film } from '@/types';
import FilmCarousel from './FilmCarousel';
import { Skeleton } from '@/components/ui/skeleton';
import { showError } from '@/utils/toast';

interface RelatedFilmsSectionProps {
  currentFilm: Film;
}

type CarouselFilm = {
  id: string;
  title: string;
  director: string;
  thumbnailUrl: string;
};

const RelatedFilmsSection = ({ currentFilm }: RelatedFilmsSectionProps) => {
  const [filmsBySameDirector, setFilmsBySameDirector] = useState<CarouselFilm[]>([]);
  const [filmsBySameGenre, setFilmsBySameGenre] = useState<CarouselFilm[]>([]);
  const [filmsBySameLanguage, setFilmsBySameLanguage] = useState<CarouselFilm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mapToCarouselFilm = (film: Partial<Film>): CarouselFilm => ({
      id: film.id!,
      title: film.title || 'Untitled Film',
      director: film.director_names || 'Unknown Director',
      thumbnailUrl: film.thumbnail_url || `https://source.unsplash.com/random/300x450?film,poster&sig=${film.id}`,
    });

    const fetchRelatedFilms = async () => {
      setIsLoading(true);
      
      const directorQuery = currentFilm.user_id ? supabase
        .from('films')
        .select('id, title, director_names, thumbnail_url')
        .eq('user_id', currentFilm.user_id)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .neq('id', currentFilm.id)
        .limit(10) : Promise.resolve({ data: [], error: null });

      const genreQuery = currentFilm.genre ? supabase
        .from('films')
        .select('id, title, director_names, thumbnail_url')
        .eq('genre', currentFilm.genre)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .neq('id', currentFilm.id)
        .limit(10) : Promise.resolve({ data: [], error: null });

      const languageQuery = currentFilm.language ? supabase
        .from('films')
        .select('id, title, director_names, thumbnail_url')
        .eq('language', currentFilm.language)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .neq('id', currentFilm.id)
        .limit(10) : Promise.resolve({ data: [], error: null });

      try {
        const [directorResults, genreResults, languageResults] = await Promise.all([
          directorQuery,
          genreQuery,
          languageQuery
        ]);

        if (directorResults.error) console.error('Director films error:', directorResults.error);
        if (genreResults.error) console.error('Genre films error:', genreResults.error);
        if (languageResults.error) console.error('Language films error:', languageResults.error);

        setFilmsBySameDirector(directorResults.data?.map(mapToCarouselFilm) || []);
        setFilmsBySameGenre(genreResults.data?.map(mapToCarouselFilm) || []);
        setFilmsBySameLanguage(languageResults.data?.map(mapToCarouselFilm) || []);

      } catch (error) {
        showError('Failed to load related films.');
        console.error('Error fetching related films:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedFilms();
  }, [currentFilm]);

  const LoadingCarousel = () => (
    <section className="space-y-6">
      <Skeleton className="h-8 w-64 mb-4" />
      <div className="relative">
        <div className="flex space-x-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/8">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  if (isLoading) {
    return (
      <div className="space-y-12 mt-12">
        <LoadingCarousel />
        <LoadingCarousel />
        <LoadingCarousel />
      </div>
    );
  }

  return (
    <div className="space-y-12 mt-12">
      {filmsBySameDirector.length > 0 && (
        <FilmCarousel title="More by this Director" films={filmsBySameDirector} />
      )}
      {filmsBySameGenre.length > 0 && (
        <FilmCarousel title="More in this Genre" films={filmsBySameGenre} />
      )}
      {filmsBySameLanguage.length > 0 && (
        <FilmCarousel title="More in this Language" films={filmsBySameLanguage} />
      )}
      {!filmsBySameDirector.length && !filmsBySameGenre.length && !filmsBySameLanguage.length && (
        <p className="text-muted-foreground text-center py-8">No related films found.</p>
      )}
    </div>
  );
};

export default RelatedFilmsSection;