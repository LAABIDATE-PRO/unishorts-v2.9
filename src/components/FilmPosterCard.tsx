import React from 'react';
import { Link } from 'react-router-dom';
import { useSession } from './SessionContextProvider';
import { Lock } from 'lucide-react';

interface FilmPosterCardProps {
  film: { id: string; title: string; director: string; thumbnailUrl: string };
}

const FilmPosterCard: React.FC<FilmPosterCardProps> = ({ film }) => {
  const { session } = useSession();

  return (
    <Link to={`/film/${film.id}`} className="block group relative">
      <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
        <img
          src={film.thumbnailUrl}
          alt={film.title}
          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-base font-medium text-white truncate">{film.title}</h3>
          <p className="text-sm text-white/80 truncate">{film.director}</p>
        </div>
      </div>
      {!session && (
        <>
          <div className="absolute top-3 right-3 bg-black/60 p-2 rounded-full z-10 pointer-events-none">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
            <span className="font-semibold text-lg">Log in to watch</span>
          </div>
        </>
      )}
    </Link>
  );
};

export default FilmPosterCard;