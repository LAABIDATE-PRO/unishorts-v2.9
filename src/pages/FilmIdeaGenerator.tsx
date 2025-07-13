import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showError } from '@/utils/toast';
import { Sparkles } from 'lucide-react';
import { useSession } from '@/components/SessionContextProvider';
import { Skeleton } from '@/components/ui/skeleton';

interface FilmIdea {
  title: string;
  logline: string;
  synopsis: string;
}

const FilmIdeaGenerator = () => {
  const { session } = useSession();
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState<FilmIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      showError('Please enter a topic.');
      return;
    }
    setIsLoading(true);
    setIdeas([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-film-ideas', {
        body: { topic, userId: session?.user?.id },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.ideas && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
      } else {
        throw new Error('Invalid response from AI.');
      }
    } catch (err: any) {
      let errorMessage = 'Failed to generate ideas. Please try again.';
      if (err.context && typeof err.context.json === 'function') {
        try {
          const errorBody = await err.context.json();
          if (errorBody && errorBody.error) {
            errorMessage = `AI Service Error: ${errorBody.error}`;
          }
        } catch (parseError) {
          // Ignore if parsing fails, use the outer error.
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <BackButton />
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold mt-4">Film Idea Generator</h1>
          <p className="text-muted-foreground mt-2">Stuck for an idea? Let our AI assistant spark your creativity.</p>
        </div>

        <div className="max-w-xl mx-auto mt-8 flex gap-2">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Youth and climate change in the Middle East"
            disabled={isLoading}
          />
          <Button onClick={handleGenerate} disabled={isLoading || !topic.trim()}>
            {isLoading ? 'Generating...' : 'Generate Ideas'}
          </Button>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          {isLoading && (
            <div className="grid md:grid-cols-3 gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}
          {ideas.length > 0 && (
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
              {ideas.map((idea, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{idea.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="font-semibold text-sm">{idea.logline}</p>
                    <p className="text-muted-foreground text-sm">{idea.synopsis}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FilmIdeaGenerator;