import { Film } from '@/types';
import FilmInfoSidebar from './FilmInfoSidebar';
import DirectorCard from './DirectorCard';

type FilmWithProfile = Film & {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  username: string | null;
  short_bio: string | null;
};

interface FilmDescriptionTabProps {
  film: FilmWithProfile;
}

const FilmDescriptionTab = ({ film }: FilmDescriptionTabProps) => {
  const directorName = film.first_name && film.last_name ? `${film.first_name} ${film.last_name}` : (film.director_names || 'Unknown Director');

  return (
    <div className="grid lg:grid-cols-3 gap-8 mt-6">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
        <p className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {film.description}
        </p>
      </div>
      <div className="lg:col-span-1 space-y-8">
        <FilmInfoSidebar 
          duration={film.duration_minutes ? `${film.duration_minutes} minutes` : undefined}
          year={film.production_year || undefined}
          genre={film.genre || undefined}
          language={film.language || undefined}
          country={film.filming_country || undefined}
        />
        <DirectorCard 
          name={directorName}
          bio={film.short_bio || "No bio available."}
          imageUrl={film.avatar_url || undefined}
          profileUrl={film.username ? `/u/${film.username}` : '#'}
        />
      </div>
    </div>
  );
};

export default FilmDescriptionTab;