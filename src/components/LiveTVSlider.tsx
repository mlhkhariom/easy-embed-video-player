
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tv, PlayCircle } from 'lucide-react';
import { Channel } from '../types';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { fetchIndianChannels } from '../services/iptv';

const LiveTVSlider = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        // Get a subset of popular channels
        const data = await fetchIndianChannels();
        setChannels(data.slice(0, 10)); // Limit to 10 channels for the slider
      } catch (error) {
        console.error('Error fetching live TV channels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Live TV</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
              <div className="aspect-video"></div>
              <div className="p-2">
                <div className="h-4 w-2/3 rounded-full bg-gray-700"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!channels.length) {
    return null;
  }

  return (
    <div className="w-full px-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Live TV</h2>
        <Link to="/live-tv" className="flex items-center gap-1 text-sm font-medium text-moviemate-primary hover:underline">
          View All
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {channels.map((channel) => (
            <CarouselItem key={channel.id} className="basis-1/2 md:basis-1/4 lg:basis-1/5">
              <div className="relative overflow-hidden rounded-lg bg-moviemate-card transition-all hover:scale-[1.02] hover:shadow-xl">
                <div className="relative aspect-video overflow-hidden">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-moviemate-primary/20">
                      <Tv size={40} className="text-moviemate-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="truncate text-sm font-medium text-white">{channel.name}</h3>
                </div>
                <Link
                  to={`/live-tv?channel=${channel.id}`}
                  className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:bg-black/40 hover:opacity-100"
                >
                  <Button variant="ghost" size="sm" className="rounded-full bg-white p-2">
                    <PlayCircle className="h-8 w-8 text-moviemate-primary" />
                  </Button>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 bg-moviemate-primary text-white hover:bg-moviemate-primary/90" />
        <CarouselNext className="right-0 bg-moviemate-primary text-white hover:bg-moviemate-primary/90" />
      </Carousel>
    </div>
  );
};

export default LiveTVSlider;
