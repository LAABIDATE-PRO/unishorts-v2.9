"use client";

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Film as FilmType } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSession } from '@/components/SessionContextProvider';
import { FilmCard } from '@/components/FilmCard';
import { ArrowRight, Upload, Users, Award } from 'lucide-react';
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
        .limit(10);

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
        <section className="text-center py-20 md:py-32 bg-muted/40">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 animate-fade-in-down">
              The Stage for the Next Generation of Storytellers
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in-up">
              Discover and share groundbreaking short films from university students around the globe.
            </p>
            <div className="flex justify-center gap-4 animate-fade-in-up">
              <Button asChild size="lg">
                <Link to="/explore">
                  Explore Films <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/upload">Submit Your Film</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Films Section */}
        <section id="featured" className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-10">Latest Films</h2>
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-60 w-full" />)}
              </div>
            ) : (
              <Carousel
                opts={{ align: "start", loop: true }}
                className="w-full"
              >
                <CarouselContent>
                  {films.map((film) => (
                    <CarouselItem key={film.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                      <div className="p-1">
                        <FilmCard film={film} session={session} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
              </Carousel>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-muted/40">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm transition-transform duration-300 hover:-translate-y-2">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Submit Your Film</h3>
                <p className="text-muted-foreground">
                  Share your creative vision with the world. Our submission process is simple and straightforward.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm transition-transform duration-300 hover:-translate-y-2">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Get Reviewed</h3>
                <p className="text-muted-foreground">
                  Our team reviews every film to ensure quality and originality.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm transition-transform duration-300 hover:-translate-y-2">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Join the Community</h3>
                <p className="text-muted-foreground">
                  Connect with fellow filmmakers and get recognized for your work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Join Community CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Showcase Your Talent?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join our community of young creators and share your story with a global audience.
            </p>
            <Button asChild size="lg">
              <Link to="/upload">
                Get Started <Upload className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}