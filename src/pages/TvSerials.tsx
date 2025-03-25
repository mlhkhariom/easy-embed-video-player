
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TvShow } from '../types';
import { getPopularTvShows } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { Tv } from 'lucide-react';

const TvSerials = () => {
  const [tvSerials, setTvSerials] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const genre = searchParams.get('genre');
  
  useEffect(() => {
    const fetchTvSerials = async () => {
      try {
        setIsLoading(true);
        
        // Fetch popular TV shows
        const tvShowsRes = await getPopularTvShows();
        
        // Filter for TV serials (simple heuristic based on episode count)
        const serials = tvShowsRes.results.filter(show => 
          show.number_of_episodes >= 100 || show.number_of_seasons >= 10
        );
        
        setTvSerials(serials);
      } catch (error) {
        console.error('Error fetching TV serials:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTvSerials();
  }, [genre]);
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-8 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-white">TV Serials</h1>
          <p className="text-gray-400">
            Explore popular TV serials from around the world
          </p>
          <SearchBar />
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-moviemate-card">
                <div className="aspect-[2/3]"></div>
              </div>
            ))}
          </div>
        ) : tvSerials.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {tvSerials.map((show) => (
              <MovieCard key={show.id} item={show} type="tv" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Tv size={64} className="mb-4 text-gray-500" />
            <h3 className="mb-2 text-xl font-semibold text-white">No TV serials found</h3>
            <p className="text-gray-400">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TvSerials;
