import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Film } from "@/types";
import { useSession } from "@/components/SessionContextProvider";
import { Skeleton } from "@/components/ui/skeleton";
import FilmVideoPlayer from "@/components/FilmVideoPlayer";
import CommentsSection from "@/components/CommentsSection";
import LikeButton from "@/components/LikeButton";
import FavoriteButton from "@/components/FavoriteButton";
import ShareButton from "@/components/ShareButton";
import { Film as FilmIcon } from "lucide-react";
import BackButton from "@/components/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RelatedFilmsSection from "@/components/RelatedFilmsSection";
import FilmDescriptionTab from "@/components/FilmDescriptionTab";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

  const handleViewIncrement = async (filmId: string) => {
    setFilm(currentFilm => {
      if (!currentFilm) return null;
      return { ...currentFilm, view_count: currentFilm.view_count + 1 };
    });

    try {
      const { error } = await supabase.functions.invoke('increment-view-count', {
        body: { film_id: filmId },
      });
      if (error) {
        console.error('Failed to increment view count in DB:', error);
        setFilm(currentFilm => {
          if (!currentFilm) return null;
          return { ...currentFilm, view_count: currentFilm.view_count - 1 };
        });
      }
    } catch (error) {
      console.error('Failed to invoke view count function', error);
       setFilm(currentFilm => {
        if (!currentFilm) return null;
        return { ...currentFilm, view_count: currentFilm.view_count - 1 };
      });
    }
  };

  if (isLoading) {
    return <FilmPageSkeleton />;
  }

  if (error || !film) {
    return (
      <div className="bg-background min-h-screen">
        <Header />
        <div className="container mx-auto p-8 text-center">
          <FilmIcon className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const directorName = film.first_name && film.last_name ? `${film.first_name} ${film.last_name}` : (film.director_names || 'Unknown Director');

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <BackButton />
        <div className="w-full">
          <div className="aspect-video overflow-hidden rounded-lg bg-black shadow-lg">
            <FilmVideoPlayer 
              film={film}
              onViewIncrement={handleViewIncrement}
              isLocked={!session}
            />
          </div>
          
          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-bold">
              {film.title}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>
                  By <span className="font-semibold text-foreground">{directorName}</span>
                </span>
                <span className="text-muted-foreground/50">&bull;</span>
                <span>{film.view_count.toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                <LikeButton filmId={film.id} />
                <FavoriteButton filmId={film.id} />
                <ShareButton film={film} />
              </div>
            </div>
          </div>

          <Tabs defaultValue="description" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="related">Related Films</TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <FilmDescriptionTab film={film} />
            </TabsContent>
            <TabsContent value="comments">
              <div className="mt-6">
                <CommentsSection filmId={film.id} />
              </div>
            </TabsContent>
            <TabsContent value="related">
              <div className="mt-6">
                <RelatedFilmsSection currentFilm={film} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const FilmPageSkeleton = () => (
  <div className="bg-background min-h-screen">
    <Header />
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-10 w-24 mb-4" />
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="mt-6">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-5 w-1/3" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
      <div className="mt-8">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full mt-2" />
      </div>
    </div>
    <Footer />
  </div>
);

export default FilmPage;