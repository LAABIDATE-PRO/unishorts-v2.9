import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import FilmPosterCard from './FilmPosterCard';

interface FilmCarouselProps {
  title: string;
  films: { id: string; title: string; director: string; thumbnailUrl: string }[];
}

const FilmCarousel = ({ title, films }: FilmCarouselProps) => {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-medium">{title}</h2>
      <Carousel
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {films.map((film) => (
            <CarouselItem key={film.id} className="pl-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/8">
              <FilmPosterCard film={film} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </section>
  );
};

export default FilmCarousel;