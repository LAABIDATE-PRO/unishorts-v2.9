import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { showError } from '@/utils/toast';
import { useSession } from './SessionContextProvider';

interface LikeButtonProps {
  filmId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ filmId }) => {
  const { session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const checkLikeStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const { count, error: countError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('film_id', filmId);

      if (countError) throw countError;
      setLikesCount(count || 0);

      if (session?.user) {
        const { data, error: userLikeError } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('film_id', filmId)
          .single();
        
        if (userLikeError && userLikeError.code !== 'PGRST116') throw userLikeError;
        setIsLiked(!!data);
      } else {
        setIsLiked(false);
      }
    } catch (error: any) {
      console.error('Error checking like status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session, filmId]);

  useEffect(() => {
    checkLikeStatus();
    
    const channel = supabase.channel(`likes:${filmId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes', filter: `film_id=eq.${filmId}` },
        () => checkLikeStatus()
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [checkLikeStatus, filmId]);

  const toggleLike = async () => {
    if (!session?.user) {
      showError('You must be logged in to like a film.');
      return;
    }
    setIsLoading(true);

    const originalIsLiked = isLiked;
    setIsLiked(!originalIsLiked);
    setLikesCount(prev => originalIsLiked ? prev - 1 : prev + 1);

    try {
      const { error } = await supabase.functions.invoke('toggle-like', {
        body: { film_id: filmId, user_id: session.user.id },
      });
      if (error) throw error;
    } catch (error: any) {
      showError(`Failed to toggle like.`);
      setIsLiked(originalIsLiked);
      setLikesCount(prev => originalIsLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
        <Button onClick={toggleLike} disabled={isLoading || !session} variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-500/10">
            <ThumbsUp className={`w-6 h-6 ${isLiked ? 'fill-blue-500 text-blue-500' : ''}`} />
        </Button>
        <span className="text-sm text-gray-500 dark:text-gray-400 w-10 text-left">{likesCount.toLocaleString()}</span>
    </div>
  );
};

export default LikeButton;