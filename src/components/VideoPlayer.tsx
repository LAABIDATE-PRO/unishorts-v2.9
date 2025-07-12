import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface VideoPlayerProps {
  videoUrl: string | null;
  thumbnailUrl: string | null;
  isLocked: boolean;
}

export function VideoPlayer({ videoUrl, thumbnailUrl, isLocked }: VideoPlayerProps) {
  if (!videoUrl) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p>Video not available.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
        <video
          src={isLocked ? undefined : videoUrl}
          poster={thumbnailUrl || ''}
          controls={!isLocked}
          className="w-full h-full object-cover"
          style={{ pointerEvents: isLocked ? 'none' : 'auto' }}
        />
      </AspectRatio>
      {isLocked && (
        <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center p-4 text-center">
          <Lock className="h-16 w-16 text-white mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">You must be logged in to watch this film.</h2>
          <p className="text-white/80 mb-6">Create an account or sign in to access exclusive content.</p>
          <div className="flex gap-4">
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}