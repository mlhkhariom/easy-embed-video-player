
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPopularTvShows, getTopRatedTvShows, getIndianTVShows } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const WebSeries = () => {
  const [isLoading, setIsLoading] = useState(true);

  const { data: popularShows, error: popularError } = useQuery({
    queryKey: ['popular-tv'],
    queryFn: getPopularTvShows,
  });

  const { data: topRatedShows, error: topRatedError } = useQuery({
    queryKey: ['top-rated-tv'],
    queryFn: getTopRatedTvShows,
  });

  const { data: indianShows, error: indianError } = useQuery({
    queryKey: ['indian-tv'],
    queryFn: getIndianTVShows,
  });

  useEffect(() => {
    if (popularShows && topRatedShows && indianShows) {
      setIsLoading(false);
    }
  }, [popularShows, topRatedShows, indianShows]);

  const hasError = popularError || topRatedError || indianError;

  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="mb-8 text-3xl font-bold text-white">Web Series</h1>
        
        {hasError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load web series. Please try again later.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Indian Web Series */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Indian Web Series</h2>
            <Link to="/genre/tv/hi" className="text-moviemate-primary hover:underline">
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
              {indianShows?.results.slice(0, 12).map((show) => (
                <MovieCard key={show.id} item={show} type="tv" />
              ))}
            </div>
          )}
        </section>
        
        {/* Popular Web Series */}
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Popular Web Series</h2>
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
              {popularShows?.results.slice(0, 12).map((show) => (
                <MovieCard key={show.id} item={show} type="tv" />
              ))}
            </div>
          )}
        </section>
        
        {/* Top Rated Web Series */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Top Rated Web Series</h2>
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
              {topRatedShows?.results.slice(0, 12).map((show) => (
                <MovieCard key={show.id} item={show} type="tv" />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default WebSeries;
