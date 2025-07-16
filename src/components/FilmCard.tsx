import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Film } from "@/types";
import { Session } from "@supabase/supabase-js";
import { Lock } from "lucide-react";

interface FilmCardProps {
  film: Film;
  session: Session | null;
}

export function FilmCard({ film, session }: FilmCardProps) {
  const isLocked = !session;

  return (
    <Link to={`/film/${film.id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:-translate-y-1">
        <div className="aspect-[2/3] relative bg-muted">
          <img
            src={film.thumbnail_url || '/placeholder.svg'}
            alt={film.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {isLocked && (
            <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full z-10 pointer-events-none">
              <Lock className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm truncate">{film.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{film.director_names || 'Unknown Director'}</p>
        </CardContent>
      </Card>
    </Link>
  );
}