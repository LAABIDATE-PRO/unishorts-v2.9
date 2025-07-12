import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2, ThumbsUp, ThumbsDown, Eye } from 'lucide-react';
import { useSession } from './SessionContextProvider';
import { showError, showSuccess } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Film } from '@/types';
import FavoriteButton from './FavoriteButton'; // Re-using existing FavoriteButton

interface FilmInteractionButtonsProps {
  film: Film;
  onLikeToggle: (filmId: string, isLiked: boolean) => void;
  likesCount: number;
  isLiked: boolean;
}

const FilmInteractionButtons: React.FC<FilmInteractionButtonsProps> = ({ film, onLikeToggle, likesCount, isLiked }) => {
  const { session } = useSession();
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount);
  const [isCurrentlyLiked, setIsCurrentlyLiked] = useState(isLiked);

  useEffect(() => {
    setCurrentLikesCount(likesCount);
    setIsCurrentlyLiked(isLiked);
  }, [likesCount, isLiked]);

  const handleLike = async () => {
    if (!session?.user) {
      showError('You must be logged in to like a film.');
      return;
    }
    try {
      const { error } = await supabase.functions.invoke('toggle-like', {
        body: { film_id: film.id, user_id: session.user.id },
      });

      if (error) {
        throw error;
      }

      if (isCurrentlyLiked) {
        setCurrentLikesCount(prev => prev - 1);
        showSuccess('Removed like.');
      } else {
        setCurrentLikesCount(prev => prev + 1);
        showSuccess('Liked film!');
      }
      setIsCurrentlyLiked(prev => !prev);
      onLikeToggle(film.id, !isCurrentlyLiked); // Notify parent of change
    } catch (error: any) {
      showError(`Failed to toggle like: ${error.message}`);
    }
  };

  const handleShare = async (platform: string) => {
    const filmUrl = window.location.href;
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(filmUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(filmUrl)}&text=${encodeURIComponent(`Check out this short film: ${film.title}`)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(filmUrl)}&title=${encodeURIComponent(film.title)}&summary=${encodeURIComponent(film.description || '')}`;
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(filmUrl);
          showSuccess('Link copied to clipboard!');
          return;
        } catch (err) {
          showError('Failed to copy link.');
          console.error('Failed to copy: ', err);
          return;
        }
      default:
        return;
    }
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Interact</h2>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleLike} disabled={!session}>
            <ThumbsUp className={`mr-2 h-5 w-5 ${isCurrentlyLiked ? 'fill-primary text-primary' : ''}`} />
            {currentLikesCount} Likes
          </Button>
          <FavoriteButton filmId={film.id} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Share2 className="mr-2 h-5 w-5" />
              Share
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Share Film</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleShare('facebook')}>Facebook</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('twitter')}>X (Twitter)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('linkedin')}>LinkedIn</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleShare('copy')}>Copy Link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center text-muted-foreground text-sm">
        <Eye className="mr-2 h-4 w-4" />
        {film.view_count.toLocaleString()} Views
      </div>
    </div>
  );
};

export default FilmInteractionButtons;