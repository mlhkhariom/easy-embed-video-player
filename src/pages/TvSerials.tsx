
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TvShow } from '../types';
import { getPopularTvShows, getIndianTVShows } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { Tv, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

const TvSerials = () => {
  const [tvSerials, setTvSerials] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [showIndianOnly, setShowIndianOnly] = useState(false);
  const { toast } = useToast();
  
  const genre = searchParams.get('genre');
  
  useEffect(() => {
    const fetchTvSerials = async () => {
      try {
        setIsLoading(true);
        
        // Fetch TV shows based on filter
        const tvShowsRes = showIndianOnly 
          ? await getIndianTVShows() 
          : await getPopularTvShows();
        
        // Better filtering for TV serials - look for longer-running shows
        // TV serials typically have more episodes per season or more seasons
        const serials = tvShowsRes.results.filter(show => {
          // Filter for shows that are likely TV serials
          return (
            // Shows with many episodes
            show.number_of_episodes > 50 || 
            // Shows with many seasons (but not limited episode count)
            show.number_of_seasons >= 3 ||
            // Shows that explicitly have the TV serial type
            show.show_type === 'tv_serial'
          );
        });
        
        if (serials.length === 0) {
          // If no shows match our criteria, just show all results
          // to avoid an empty page
          setTvSerials(tvShowsRes.results);
          toast({
            title: "Limited filtering applied",
            description: "Showing all TV shows as specific TV serials couldn't be identified.",
            variant: "default"
          });
        } else {
          setTvSerials(serials);
        }
      } catch (error) {
        console.error('Error fetching TV serials:', error);
        toast({
          title: "Error loading content",
          description: "There was a problem loading TV serials. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTvSerials();
  }, [genre, showIndianOnly, toast]);
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">TV Serials</h1>
              <p className="text-gray-400">
                Explore popular TV serials from around the world
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant={showIndianOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowIndianOnly(!showIndianOnly)}
                className={showIndianOnly ? "bg-moviemate-primary text-white" : ""}
              >
                {showIndianOnly ? "Indian Only" : "All Regions"}
              </Button>
              
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
            </div>
          </div>
          
          <SearchBar />
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg bg-moviemate-card" />
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
