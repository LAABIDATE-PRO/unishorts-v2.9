import React from 'react';
import { Film } from '@/types';
import { Badge } from '@/components/ui/badge';

interface FilmInfoSectionProps {
  film: Film;
}

const FilmInfoSection: React.FC<FilmInfoSectionProps> = ({ film }) => {
  return (
    <div className="md:col-span-2">
      <h2 className="text-2xl font-semibold mb-2">Description</h2>
      <p className="text-muted-foreground mb-4">{film.description}</p>

      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
        {film.director_names && (
          <div>
            <span className="font-medium">Director(s):</span> {film.director_names}
          </div>
        )}
        {film.genre && (
          <div>
            <span className="font-medium">Genre:</span> <Badge variant="secondary">{film.genre}</Badge>
          </div>
        )}
        {film.language && (
          <div>
            <span className="font-medium">Language:</span> {film.language}
          </div>
        )}
        {film.duration_minutes && (
          <div>
            <span className="font-medium">Duration:</span> {film.duration_minutes} mins
          </div>
        )}
        {film.production_year && (
          <div>
            <span className="font-medium">Production Year:</span> {film.production_year}
          </div>
        )}
        {film.filming_country && (
          <div>
            <span className="font-medium">Filming Country:</span> {film.filming_country}
          </div>
        )}
        {film.institution && (
          <div>
            <span className="font-medium">Institution:</span> {film.institution}
          </div>
        )}
        {film.release_date && (
          <div>
            <span className="font-medium">Release Date:</span> {new Date(film.release_date).toLocaleDateString()}
          </div>
        )}
        {film.tags && (
          <div className="col-span-2">
            <span className="font-medium">Tags:</span> {film.tags.split(',').map(tag => <Badge key={tag} variant="outline" className="mr-1 mb-1">{tag.trim()}</Badge>)}
          </div>
        )}
        {film.subtitles && film.subtitles.length > 0 && (
          <div className="col-span-2">
            <span className="font-medium">Subtitles:</span> {film.subtitles.map(sub => <Badge key={sub} variant="outline" className="mr-1 mb-1">{sub.toUpperCase()}</Badge>)}
          </div>
        )}
        {film.trailer_url && (
          <div className="col-span-2">
            <span className="font-medium">Trailer:</span> <a href={film.trailer_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Watch Trailer</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilmInfoSection;