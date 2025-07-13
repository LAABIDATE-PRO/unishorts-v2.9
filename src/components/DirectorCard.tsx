import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DirectorCardProps {
  name: string;
  bio: string;
  imageUrl?: string;
  profileUrl: string;
}

const DirectorCard = ({ name, bio, imageUrl, profileUrl }: DirectorCardProps) => {
  return (
    <div className="bg-card border p-6 rounded-lg text-center">
      <h3 className="text-lg font-semibold text-foreground mb-4">The Director</h3>
      <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-background shadow-lg">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback>
          <User className="w-12 h-12 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <h4 className="font-bold text-xl text-foreground">{name}</h4>
      <p className="text-sm text-muted-foreground mt-2 mb-4">{bio}</p>
      <Button asChild variant="outline" className="w-full">
        <Link to={profileUrl}>View Profile</Link>
      </Button>
    </div>
  );
};

export default DirectorCard;