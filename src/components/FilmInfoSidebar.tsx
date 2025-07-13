import React from 'react';
import { Clock, Calendar, Tag, Languages, MapPin } from 'lucide-react';

interface FilmInfoProps {
  duration?: string;
  year?: number;
  genre?: string;
  language?: string;
  country?: string;
}

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | number }) => {
  if (!value) return null;
  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 text-muted-foreground pt-1">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
};

const FilmInfoSidebar = ({ duration, year, genre, language, country }: FilmInfoProps) => {
  return (
    <div className="bg-card border p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-foreground border-b pb-3 mb-4">Film Information</h3>
      <div className="space-y-4">
        <InfoItem icon={<Clock size={20} />} label="Duration" value={duration} />
        <InfoItem icon={<Calendar size={20} />} label="Production Year" value={year} />
        <InfoItem icon={<Tag size={20} />} label="Genre" value={genre} />
        <InfoItem icon={<Languages size={20} />} label="Language" value={language} />
        <InfoItem icon={<MapPin size={20} />} label="Filming Country" value={country} />
      </div>
    </div>
  );
};

export default FilmInfoSidebar;