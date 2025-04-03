
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPopularTvShows, getTopRatedTvShows, getIndianTVShows } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TvSerials = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const { data: popularTvShows, error: popularError } = useQuery({
    queryKey: ['popular-tv-shows'],
    queryFn: () => getPopularTvShows(),
  });
  
  const { data: topRatedTvShows, error: topRatedError } = useQuery({
    queryKey: ['top-rated-tv-shows'],
    queryFn: () => getTopRatedTvShows(),
  });
  
  const { data: indianTvShows, error: indianError } = useQuery({
    queryKey: ['indian-tv-shows'],
    queryFn: () => getIndianTVShows(),
  });
  
  useEffect(() => {
    if (popularTvShows && topRatedTvShows && indianTvShows) {
      setIsLoading(false);
    }
  }, [popularTvShows, topRatedTvShows, indianTvShows]);
  
  const hasError = popularError || topRatedError || indianError;
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="mb-8 text-3xl font-bold text-white">TV Serials</h1>
        
        {hasError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load TV shows. Please try again later.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Indian TV Shows */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Indian TV Shows</h2>
            <Link to="/explore?type=tv&region=in" className="text-moviemate-primary hover:underline">
              View All
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                  <div className="aspect-[2/3]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {indianTvShows?.results.slice(0, 12).map((show) => (
                <MovieCard key={show.id} item={show} type="tv" />
              ))}
            </div>
          )}
        </section>
        
        {/* Popular TV Shows */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Popular TV Shows</h2>
            <Link to="/explore?type=tv&filter=popular" className="text-moviemate-primary hover:underline">
              View All
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                  <div className="aspect-[2/3]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {popularTvShows?.results.slice(0, 12).map((show) => (
                <MovieCard key={show.id} item={show} type="tv" />
              ))}
            </div>
          )}
        </section>
        
        {/* Top Rated TV Shows */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Top Rated TV Shows</h2>
            <Link to="/explore?type=tv&filter=top_rated" className="text-moviemate-primary hover:underline">
              View All
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                  <div className="aspect-[2/3]"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {topRatedTvShows?.results.slice(0, 12).map((show) => (
                <MovieCard key={show.id} item={show} type="tv" />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default TvSerials;
