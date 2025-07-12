import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Film } from "@/types";
import { useSession } from "@/components/SessionContextProvider";

import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "@/components/VideoPlayer";
import CommentsSection from "@/components/CommentsSection";
import FilmInfoSidebar from "@/components/FilmInfoSidebar";
import DirectorCard from "@/components/DirectorCard";
import LikeButton from "@/components/LikeButton";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import { Film as FilmIcon } from "lucide-react";

type FilmWithProfile = Film & {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  username: string | null;
  short_bio: string | null;
};

const FilmPage = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useSession();
  const [film, setFilm] = useState<FilmWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilm = async () => {
      if (!id) {
        setError("Film ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data, error: rpcError } = await supabase
        .rpc('get_film_with_profile', { film_id_input: id })
        .single();

      if (rpcError || !data) {
        setError("Film not found or an error occurred.");
        console.error(rpcError);
        setFilm(null);
      } else {
        setFilm(data as FilmWithProfile);
      }
      setIsLoading(false);
    };

    fetchFilm();
  }, [id]);

  if (isLoading) {
    return <FilmPageSkeleton />;
  }

  if (error || !film) {
    return (
      <div className="container mx-auto p-8 text-center">
        <FilmIcon className="mx-auto h-16 w-16 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold text-destructive">Error</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  const directorName = film.first_name && film.last_name ? `${film.first_name} ${film.last_name}` : (film.director_names || 'Unknown Director');

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-x-8 gap-y-12">
          <div className="lg:col-span-2">
            <div className="aspect-video overflow-hidden rounded-lg bg-black shadow-2xl">
              <VideoPlayer 
                videoUrl={film.video_url}
                thumbnailUrl={film.thumbnail_url}
                isLocked={!session}
              />
            </div>
            
            <div className="mt-6">
              <h1 className="text-3xl md:text-4xl font-bold">
                {film.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    By <span className="font-semibold text-gray-700 dark:text-gray-200">{directorName}</span>
                  </span>
                  <span className="text-gray-400 dark:text-gray-600">&bull;</span>
                  <span>{film.view_count.toLocaleString()} views</span>
                </div>
                <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                  <LikeButton filmId={film.id} />
                  <FavoriteButton filmId={film.id} />
                  <ShareButton film={film} />
                </div>
              </div>
              <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-6">
                <p className="text-base text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {film.description}
                </p>
              </div>
            </div>
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
            <CommentsSection filmId={film.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

const FilmPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="grid lg:grid-cols-3 gap-x-8 gap-y-12">
      <div className="lg:col-span-2">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <div className="mt-6">
          <Skeleton className="h-10 w-3/4" />
          <div className="flex items-center space-x-4 mt-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-5 w-1/4" />
          </div>
          <div className="mt-6 border-t pt-6 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-1 space-y-8">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

export default FilmPage;