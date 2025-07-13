"use client";

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Film as FilmType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSession } from '@/components/SessionContextProvider';
import { FilmCard } from '@/components/FilmCard';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Index() {
  const { session } = useSession();
  const [films, setFilms] = useState<FilmType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFilms = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('films')
        .select('*')
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(18);

      if (error) {
        console.error('Error fetching films:', error);
      } else {
        setFilms(data || []);
      }
      setIsLoading(false);
    };

    fetchFilms();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-left py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
              The Future of Film
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8">
              Discover groundbreaking short films from university students worldwide.
            </p>
          </div>
        </section>

        {/* Featured Films Section */}
        <section id="featured" className="pb-16 md:pb-24">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Latest Releases</h2>
              <Button asChild variant="ghost">
                <Link to="/explore">
                  See All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {films.map((film) => (
                  <FilmCard key={film.id} film={film} session={session} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}