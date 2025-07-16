import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import { useSession } from './SessionContextProvider';

interface FavoriteButtonProps {
  filmId: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ filmId }) => {
  const { session } = useSession();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkFavorite = useCallback(async () => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('film_id', filmId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }
      setIsFavorited(!!data);
    } catch (error: any) {
      console.error('Error checking favorite status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session, filmId]);

  useEffect(() => {
    checkFavorite();
  }, [checkFavorite]);

  const toggleFavorite = async () => {
    if (!session?.user) {
      showError('You must be logged in to favorite a film.');
      return;
    }
    setIsLoading(true);
    if (isFavorited) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('film_id', filmId);
      
      if (error) {
        showError('Failed to remove film from favorites.');
      } else {
        setIsFavorited(false);
        showSuccess('Removed from favorites.');
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: session.user.id, film_id: filmId });

      if (error) {
        showError('Failed to add film to favorites.');
      } else {
        setIsFavorited(true);
        showSuccess('Added to favorites.');
      }
    }
    setIsLoading(false);
  };

  return (
    <Button onClick={toggleFavorite} disabled={isLoading || !session} variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-red-500 hover:bg-red-500/10">
      <Heart className={`w-6 h-6 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
    </Button>
  );
};

export default FavoriteButton;