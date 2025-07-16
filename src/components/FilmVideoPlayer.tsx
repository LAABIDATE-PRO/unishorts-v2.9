import React, { useCallback, useRef } from 'react';
import { Film } from '@/types';
import { Link } from 'react-router-dom';
import { AspectRatio } from './ui/aspect-ratio';
import { Button } from './ui/button';
import { Lock } from 'lucide-react';
import Plyr, { APITypes } from 'plyr-react';
import 'plyr-react/plyr.css';
import { useSession } from './SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface FilmVideoPlayerProps {
  film: Film;
  isLocked: boolean;
}

const FilmVideoPlayer: React.FC<FilmVideoPlayerProps> = ({ film, isLocked }) => {
  const { session } = useSession();
  const hasLoggedViewRef = useRef(false);
  const ref = useRef<APITypes>(null);

  const logView = useCallback(async (durationWatched: number, watchPercentage: number) => {
    if (hasLoggedViewRef.current) return;
    hasLoggedViewRef.current = true;

    let anonymousId = null;
    if (!session?.user) {
      anonymousId = localStorage.getItem('anonymous_id');
      if (!anonymousId) {
        anonymousId = uuidv4();
        localStorage.setItem('anonymous_id', anonymousId);
      }
    }

    try {
      await supabase.functions.invoke('log-film-view', {
        body: {
          film_id: film.id,
          user_id: session?.user?.id,
          anonymous_id: anonymousId,
          duration_watched_seconds: Math.round(durationWatched),
          watch_percentage: watchPercentage,
        },
      });
    } catch (error) {
      console.error('Failed to log film view:', error);
      hasLoggedViewRef.current = false; // Allow retry if failed
    }
  }, [session, film.id]);

  const handleTimeUpdate = () => {
    if (hasLoggedViewRef.current) {
      return;
    }
    
    const player = ref.current?.plyr;
    if (!player) {
      return;
    }
    
    const currentTime = player.currentTime;
    const duration = player.duration;

    if (duration > 0) {
      const percentage = (currentTime / duration) * 100;
      if (percentage >= 40) {
        logView(currentTime, percentage);
      }
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
      src: `/path/to/subtitles/${film.id}_${lang}.vtt`,
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
              quality: {
                default: 720,
                options: [1080, 720, 480],
              },
            }}
            onTimeUpdate={handleTimeUpdate}
          />
        )}
      </AspectRatio>
    </div>
  );
};

export default FilmVideoPlayer;