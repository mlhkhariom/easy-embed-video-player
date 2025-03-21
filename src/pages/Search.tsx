
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMulti } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Movie, TvShow } from '../types';
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";

interface SearchResult {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await searchMulti(query);
        // Cast the results to the SearchResult type
        const filteredResults = data.results
          .filter(item => 
            (item as any).media_type === 'movie' || (item as any).media_type === 'tv'
          ) as SearchResult[];
        
        setResults(filteredResults);
      } catch (error) {
        console.error('Error searching:', error);
        setError('Failed to load search results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [query]);
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-white">
          {query ? `Search Results for "${query}"` : 'Search'}
        </h1>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[2/3] rounded-lg bg-moviemate-card"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="bg-red-500/20 border-red-500/50">
            <AlertTitle className="text-white">Error</AlertTitle>
            <AlertDescription className="text-gray-300">{error}</AlertDescription>
          </Alert>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((item) => (
              <MovieCard
                key={item.id}
                movieId={item.id}
                title={item.title || item.name || 'Unknown Title'}
                posterPath={item.poster_path}
                rating={item.vote_average}
                mediaType={item.media_type}
              />
            ))}
          </div>
        ) : query ? (
          <div className="rounded-xl bg-moviemate-card p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">No Results Found</h2>
            <p className="text-gray-300">
              We couldn't find any movies or TV shows matching "{query}".
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-moviemate-card p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Search for Movies and TV Shows</h2>
            <p className="text-gray-300">
              Use the search bar above to find your favorite content.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
