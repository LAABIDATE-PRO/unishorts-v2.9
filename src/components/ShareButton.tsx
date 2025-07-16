import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showError, showSuccess } from '@/utils/toast';
import { Film } from '@/types';

interface ShareButtonProps {
  film: Film;
}

const ShareButton = ({ film }: ShareButtonProps) => {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full text-gray-500 hover:text-green-500 hover:bg-green-500/10">
          <Share2 className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleShare('facebook')}>Facebook</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')}>X (Twitter)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')}>LinkedIn</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('copy')}>Copy Link</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;