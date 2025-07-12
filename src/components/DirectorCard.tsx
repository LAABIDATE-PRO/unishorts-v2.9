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
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-6 rounded-lg text-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">The Director</h3>
      <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-white dark:border-gray-600 shadow-lg">
        <AvatarImage src={imageUrl} alt={name} />
        <AvatarFallback>
          <User className="w-12 h-12 text-gray-400" />
        </AvatarFallback>
      </Avatar>
      <h4 className="font-bold text-xl text-gray-900 dark:text-white">{name}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-4">{bio}</p>
      <Button asChild variant="outline" className="w-full">
        <Link to={profileUrl}>View Profile</Link>
      </Button>
    </div>
  );
};

export default DirectorCard;