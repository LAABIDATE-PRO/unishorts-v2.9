import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile as ProfileType } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface DirectorInfoCardProps {
  userId: string;
}

const DirectorInfoCard = ({ userId }: DirectorInfoCardProps) => {
  const [directorProfile, setDirectorProfile] = useState<ProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDirectorProfile = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching director profile:', error);
        setDirectorProfile(null);
      } else {
        setDirectorProfile(data);
      }
      setIsLoading(false);
    };

    fetchDirectorProfile();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="bg-card p-4 rounded-lg shadow-sm space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!directorProfile) {
    return (
      <div className="bg-card p-4 rounded-lg shadow-sm text-muted-foreground">
        Director profile not found.
      </div>
    );
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">About the Director</h2>
      <div className="flex items-center space-x-4 mb-4">
        <Avatar className="h-16 w-16 border-2 border-primary">
          <AvatarImage src={directorProfile.avatar_url || undefined} alt={directorProfile.username} />
          <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-lg">{directorProfile.first_name} {directorProfile.last_name}</h3>
          {directorProfile.username && (
            <Link to={`/u/${directorProfile.username}`} className="text-primary hover:underline text-sm">
              @{directorProfile.username}
            </Link>
          )}
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        {directorProfile.short_bio || 'No bio provided.'}
      </p>
    </div>
  );
};

export default DirectorInfoCard;