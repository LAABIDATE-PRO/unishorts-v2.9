import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { showError } from '@/utils/toast';
import { Sparkles } from 'lucide-react';
import { useSession } from './SessionContextProvider';

interface AiKeywordGeneratorProps {
  title: string;
  description: string;
  currentTags: string;
  onTagAdd: (tag: string) => void;
}

const AiKeywordGenerator = ({ title, description, currentTags, onTagAdd }: AiKeywordGeneratorProps) => {
  const { session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!title || !description) {
      showError('Please provide a title and description first.');
      return;
    }
    setIsLoading(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-keywords', {
        body: { title, description, userId: session?.user?.id },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const { keywords } = data;
      if (keywords && Array.isArray(keywords)) {
        setSuggestions(keywords);
      } else {
        throw new Error('Invalid response from AI.');
      }
    } catch (err: any) {
      let errorMessage = 'Failed to generate keywords. Please try again.';
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

  const handleTagClick = (tag: string) => {
    const existingTags = currentTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    if (!existingTags.includes(tag.toLowerCase())) {
      onTagAdd(tag);
    }
  };

  return (
    <div>
      <Button type="button" onClick={handleGenerate} disabled={isLoading || !title || !description} variant="outline">
        <Sparkles className="mr-2 h-4 w-4" />
        {isLoading ? 'Generating...' : 'Suggest Keywords with AI'}
      </Button>
      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">AI Suggestions (click to add):</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiKeywordGenerator;