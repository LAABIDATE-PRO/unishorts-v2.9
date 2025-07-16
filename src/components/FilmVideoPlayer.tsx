import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Film } from '@/types';
import { Link } from 'react-router-dom';
import { AspectRatio } from './ui/aspect-ratio';
import { Button } from './ui/button';
import { Lock } from 'lucide-react';
import PlyrComponent, { APITypes } from 'plyr-react';
import 'plyr-react/plyr.css';
import { useSession } from './SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import Plyr from 'plyr';

interface FilmVideoPlayerProps {
  film: Film;
  isLocked: boolean;
}

const FilmVideoPlayer: React.FC<FilmVideoPlayerProps> = ({ film, isLocked }) => {
  const { session } = useSession();
  const ref = useRef<APITypes>(null);
  const playerRef = useRef<Plyr | null>(null);

  const watchedTimeRef = useRef(0);
  const lastPlayTimestampRef = useRef<number | null>(null);
  const hasSentDataRef = useRef(false);

  const sendWatchData = useCallback(async () => {
    if (hasSentDataRef.current || watchedTimeRef.current < 1) {
      return;
    }
    hasSentDataRef.current = true;

    const player = playerRef.current;
    const duration = player?.duration;
    if (!duration || duration <= 0) {
      return;
    }

    const watchPercentage = (watchedTimeRef.current / duration) * 100;

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
          duration_watched_seconds: Math.round(watchedTimeRef.current),
          watch_percentage: Math.min(100, watchPercentage),
        },
      });
    } catch (error) {
      console.error('Failed to log film watch time:', error);
    }
  }, [film.id, session]);

  const handlePlay = useCallback(() => {
    if (lastPlayTimestampRef.current === null) {
      lastPlayTimestampRef.current = Date.now();
    }
  }, []);

  const handlePause = useCallback(() => {
    if (lastPlayTimestampRef.current !== null) {
      const elapsed = (Date.now() - lastPlayTimestampRef.current) / 1000;
      watchedTimeRef.current += elapsed;
      lastPlayTimestampRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isLocked) return;

    // Use a small timeout to ensure the plyr instance is fully ready.
    const timer = setTimeout(() => {
      const player = ref.current?.plyr;
      if (player && typeof player.on === 'function') {
        playerRef.current = player;
        player.on('play', handlePlay);
        player.on('pause', handlePause);
        player.on('ended', handlePause);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      const player = playerRef.current;
      if (player && typeof player.off === 'function') {
        player.off('play', handlePlay);
        player.off('pause', handlePause);
        player.off('ended', handlePause);
      }
    };
  }, [isLocked, handlePlay, handlePause]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const player = playerRef.current;
      if (!player) return;
      if (document.hidden) {
        handlePause();
      } else {
        if (player.playing) {
          handlePlay();
        }
      }
    };

    window.addEventListener('beforeunload', sendWatchData);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      handlePause();
      sendWatchData();
      window.removeEventListener('beforeunload', sendWatchData);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sendWatchData, handlePause, handlePlay]);

  const videoSrc: Plyr.SourceInfo = useMemo(() => ({
    type: 'video',
    title: film.title,
    sources: [
      {
        src: film.video_url || '',
        type: 'video/mp4',
      },
    ],
    poster: film.thumbnail_url || '',
  }), [film.title, film.video_url, film.thumbnail_url]);

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
          <PlyrComponent
            ref={ref}
            source={videoSrc}
            options={{
              controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
              settings: ['captions', 'quality', 'speed', 'loop'],
              quality: {
                default: 720,
                options: [1080, 720, 480],
              },
            }}
          />
        )}
      </AspectRatio>
    </div>
  );
};

export default FilmVideoPlayer;