
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getWebSeries, isWebSeries } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TvShow } from '@/types';

const WebSeries = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Fetch web series
  const { data: webSeries, error } = useQuery({
    queryKey: ['web-series'],
    queryFn: () => getWebSeries(),
  });

  useEffect(() => {
    if (webSeries) {
      setIsLoading(false);
    }
  }, [webSeries]);

  // Check if there's any web series data
  const hasWebSeries = webSeries && webSeries.results && webSeries.results.length > 0;

  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Web Series</h1>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load web series. Please try again later.
            </AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                <div className="aspect-[2/3]"></div>
              </div>
            ))}
          </div>
        ) : hasWebSeries ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {webSeries?.results.map((show: TvShow) => (
              <MovieCard key={show.id} item={show} type="tv" />
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-lg text-gray-400">No web series found.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WebSeries;
