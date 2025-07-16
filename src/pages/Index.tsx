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
import { ArrowRight, UserPlus, Film as FilmIconLucide, MessagesSquare, Search, MessageCircle, School, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Welcome to UniShorts
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              The first academic platform dedicated to showcasing university short films! Explore, share, and connect with filmmakers from various universities.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <UserPlus className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Register Your University Account</h3>
                <p className="text-muted-foreground">Create your account using your university email to access exclusive content.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <FilmIconLucide className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Browse Films</h3>
                <p className="text-muted-foreground">Browse original short films from university students around the world.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <MessagesSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Share and Interact</h3>
                <p className="text-muted-foreground">Share your work and receive constructive feedback from a creative and supportive community.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="flex items-start gap-4">
                <Search className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Specialized Browsing</h3>
                  <p className="text-sm text-muted-foreground">Search for films by major, university, or genre.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MessageCircle className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Interactive Community</h3>
                  <p className="text-sm text-muted-foreground">Comment and share your opinion on films and connect with directors.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <School className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Exclusive Content</h3>
                  <p className="text-sm text-muted-foreground">Secure content dedicated to university students and faculty members.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Sparkles className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold">Smart Suggestions</h3>
                  <p className="text-sm text-muted-foreground">An AI system suggests films that match your interests.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const LoggedInIndex = () => {
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
};

export default function Index() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Skeleton className="h-48 w-full mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg" />)}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return <LoggedInIndex />;
}