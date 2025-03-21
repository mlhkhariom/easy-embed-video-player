
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Movie, TvShow } from '../types';
import { searchMulti } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';

const Search = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  const [searchResults, setSearchResults] = useState<(Movie | TvShow)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    
    const fetchSearchResults = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const results = await searchMulti(query);
        
        // Filter out results with no poster image
        const filteredResults = results.results.filter(
          (item) => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv')
        );
        
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching:', error);
        setError('Failed to search. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [query]);
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 animate-fade-in">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-white">Search Results</h1>
          <SearchBar className="w-full max-w-xl" />
        </div>
        
        {/* Search Query Display */}
        {query && (
          <h2 className="mb-6 text-xl text-gray-300">
            {isLoading ? (
              'Searching...'
            ) : searchResults.length > 0 ? (
              <>Results for <span className="font-semibold text-white">"{query}"</span></>
            ) : (
              <>No results found for <span className="font-semibold text-white">"{query}"</span></>
            )}
          </h2>
        )}
        
        {/* Search Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                <div className="aspect-[2/3]"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-500/20 p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Error</h2>
            <p className="text-gray-300">{error}</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {searchResults.map((item) => {
              // Check if item has the 'title' property to determine if it's a movie
              const isMovie = 'title' in item;
              
              return (
                <MovieCard 
                  key={item.id} 
                  item={item} 
                  type={isMovie ? 'movie' : 'tv'} 
                  className="animate-slide-up" 
                />
              );
            })}
          </div>
        ) : query ? (
          <div className="rounded-xl bg-moviemate-card p-8 text-center">
            <h3 className="text-xl font-semibold text-white">No results found</h3>
            <p className="mt-2 text-gray-300">
              Try searching with a different term or browse our popular content.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-moviemate-card p-8 text-center">
            <h3 className="text-xl font-semibold text-white">Search for movies and TV shows</h3>
            <p className="mt-2 text-gray-300">
              Enter a search term to find your favorite content.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
