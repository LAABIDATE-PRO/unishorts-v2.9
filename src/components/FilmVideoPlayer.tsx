import React, { useEffect, useRef, useState } from 'react';
import { Film } from '@/types';
import { Button } from '@/components/ui/button';
import { Subtitles, Maximize, Minimize } from 'lucide-react';
import { showError } from '@/utils/toast';

interface FilmVideoPlayerProps {
  film: Film;
  onViewIncrement: (filmId: string) => void;
}

const FilmVideoPlayer: React.FC<FilmVideoPlayerProps> = ({ film, onViewIncrement }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasIncrementedView, setHasIncrementedView] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => {
      if (!hasIncrementedView) {
        onViewIncrement(film.id);
        setHasIncrementedView(true);
      }
    };

    videoElement.addEventListener('play', handlePlay);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
    };
  }, [film.id, onViewIncrement, hasIncrementedView]);

  const toggleFullScreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (!document.fullscreenElement) {
      videoElement.requestFullscreen().catch(err => {
        showError(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-8">
      {film.video_url ? (
        <video controls src={film.video_url} className="w-full h-full object-contain" ref={videoRef}>
          {film.subtitles?.map((langCode) => (
            // Assuming subtitle files are named like filmId_langCode.vtt and stored in a 'subtitles' bucket
            // This is a placeholder. In a real app, you'd need actual .vtt URLs.
            <track
              key={langCode}
              kind="subtitles"
              src={`/path/to/subtitles/${film.id}_${langCode}.vtt`}
              srcLang={langCode}
              label={langCode.toUpperCase()}
              default={langCode === 'en'} // Set English as default if available
            />
          ))}
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="flex items-center justify-center w-full h-full text-muted-foreground">
          Video not available.
        </div>
      )}
      {film.video_url && (
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {film.subtitles && film.subtitles.length > 0 && (
            <Button variant="ghost" size="icon" onClick={() => videoRef.current?.toggleAttribute('textTracks', true)} title="Toggle Subtitles">
              <Subtitles className="h-5 w-5 text-white" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={toggleFullScreen} title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
            {isFullScreen ? <Minimize className="h-5 w-5 text-white" /> : <Maximize className="h-5 w-5 text-white" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilmVideoPlayer;