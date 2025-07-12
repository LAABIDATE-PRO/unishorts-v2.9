import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Film } from "@/types";
import { Session } from "@supabase/supabase-js";
import { Lock, Clock, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface FilmCardProps {
  film: Film;
  session: Session | null;
}

export function FilmCard({ film, session }: FilmCardProps) {
  const isLocked = !session;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const getYoutubeEmbedUrl = (url: string): string | null => {
    let videoId;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.substring(1);
      }
    } catch (e) {
      return null;
    }
    
    if (videoId) {
      const params = new URLSearchParams({
        autoplay: '1',
        mute: '1',
        controls: '0',
        loop: '1',
        playlist: videoId,
        playsinline: '1',
      });
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }
    return null;
  };

  const isYoutubeTrailer = film.trailer_url && (film.trailer_url.includes('youtube.com') || film.trailer_url.includes('youtu.be'));
  const trailerEmbedUrl = film.trailer_url ? (isYoutubeTrailer ? getYoutubeEmbedUrl(film.trailer_url) : film.trailer_url) : null;

  const handleMouseEnter = () => {
    if (!isLocked && trailerEmbedUrl) {
      const id = setTimeout(() => {
        setIsModalOpen(true);
      }, 1000);
      setTimeoutId(id);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  };

  const staticCardContent = (
    <Card className="overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 group border-2 border-transparent hover:border-primary">
      <CardHeader className="p-0 relative">
        <div className="aspect-[2/3] bg-black">
          <img
            src={film.thumbnail_url || '/placeholder.svg'}
            alt={film.title}
            className="w-full h-full object-cover"
          />
        </div>
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
            <Lock className="h-10 w-10 text-white" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-3 bg-card">
        <CardTitle className="text-base font-bold truncate group-hover:text-primary">{film.title}</CardTitle>
        <p className="text-xs text-muted-foreground truncate h-4">{film.director_names || 'Unknown Director'}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center bg-card">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{film.duration_minutes || 'N/A'} min</span>
        </div>
        <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Watch</span>
      </CardFooter>
    </Card>
  );

  return (
    <>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Link to={`/film/${film.id}`} className="block">
          {staticCardContent}
        </Link>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-auto max-w-[80vw] h-auto max-h-[80vh] p-0 bg-transparent border-none shadow-none">
          <AspectRatio ratio={16 / 9}>
            {isYoutubeTrailer ? (
              <iframe
                src={trailerEmbedUrl!}
                title={`${film.title} trailer`}
                frameBorder="0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <video
                key={film.id}
                src={trailerEmbedUrl!}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </AspectRatio>
          <DialogClose className="absolute right-2 top-2 rounded-full p-1 bg-black/50 text-white opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}