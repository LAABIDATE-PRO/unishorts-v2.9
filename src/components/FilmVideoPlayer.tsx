import React, { useState, useRef } from 'react';
import { Film } from '@/types';
import { Link } from 'react-router-dom';
import { AspectRatio } from './ui/aspect-ratio';
import { Button } from './ui/button';
import { Lock } from 'lucide-react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import { APITypes } from 'plyr-react';

interface FilmVideoPlayerProps {
  film: Film;
  onViewIncrement: (filmId: string) => void;
  isLocked: boolean;
}

const FilmVideoPlayer: React.FC<FilmVideoPlayerProps> = ({ film, onViewIncrement, isLocked }) => {
  const ref = useRef<APITypes>(null);
  const [hasIncrementedView, setHasIncrementedView] = useState(false);

  const handlePlay = () => {
    if (!hasIncrementedView) {
      onViewIncrement(film.id);
      setHasIncrementedView(true);
    }
  };

  const videoSrc = {
    type: 'video',
    title: film.title,
    sources: [
      {
        src: film.video_url || '',
        type: 'video/mp4',
      },
    ],
    poster: film.thumbnail_url || '',
    tracks: film.subtitles?.map(lang => ({
      kind: 'subtitles',
      label: lang.toUpperCase(),
      srcLang: lang,
      src: `/path/to/subtitles/${film.id}_${lang}.vtt`, // This path is a placeholder
      default: lang === 'en',
    })) || [],
  };

  if (!film.video_url) {
    return (
      <AspectRatio ratio={16/9}>
        <div className="flex items-center justify-center w-full h-full text-muted-foreground bg-black rounded-lg">
          Video not available.
        </div>
      </AspectRatio>
    );
  }

  return (
    <div className="relative" onContextMenu={(e) => e.preventDefault()}>
      <AspectRatio ratio={16 / 9} className="bg-black rounded-lg overflow-hidden [&>div]:w-full [&>div]:h-full">
        {isLocked ? (
          <>
            <img src={film.thumbnail_url || ''} alt={film.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center p-4 text-center">
              <Lock className="h-16 w-16 text-white mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">You must be logged in to watch this film.</h2>
              <p className="text-white/80 mb-6">Create an account or sign in to access exclusive content.</p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Plyr
            ref={ref}
            source={videoSrc as Plyr.SourceInfo}
            options={{
              controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
              settings: ['captions', 'quality', 'speed', 'loop'],
              // Quality selection is for UI purposes, as only one source is provided.
              quality: {
                default: 720,
                options: [1080, 720, 480],
              },
            }}
            onPlay={handlePlay}
          />
        )}
      </AspectRatio>
    </div>
  );
};

export default FilmVideoPlayer;