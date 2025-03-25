
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TvShow } from '../types';
import { getIndianTVShows } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import { Tv, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { handleAPIError } from '../services/error-handler';

const TvSerials = () => {
  const [tvSerials, setTvSerials] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filterType, setFilterType] = useState<'all' | 'drama' | 'comedy' | 'family'>('all');
  const { toast } = useToast();
  
  const genre = searchParams.get('genre');
  
  useEffect(() => {
    const fetchTvSerials = async () => {
      try {
        setIsLoading(true);
        
        // Always get Indian TV shows as we're focusing on Indian content
        const tvShowsRes = await getIndianTVShows();
        
        // Better filtering for TV serials based on selected filter type
        let filteredResults = tvShowsRes.results.filter(show => {
          // Base filtering to identify TV serials
          const isTvSerial = 
            show.number_of_episodes > 50 || 
            show.number_of_seasons >= 3 ||
            show.show_type === 'tv_serial';
          
          // Additional genre filtering if a filter type is selected
          if (filterType === 'all') return isTvSerial;
          
          // Map filter types to genre IDs
          const genreMap: Record<string, number[]> = {
            'drama': [18],
            'comedy': [35],
            'family': [10751]
          };
          
          return isTvSerial && show.genre_ids?.some(id => 
            genreMap[filterType]?.includes(id)
          );
        });
        
        if (filteredResults.length === 0) {
          // If no shows match our criteria, show all Indian TV shows
          setTvSerials(tvShowsRes.results);
          toast({
            title: "Limited filtering applied",
            description: "Showing all Indian TV shows as specific TV serials couldn't be identified.",
            variant: "default"
          });
        } else {
          setTvSerials(filteredResults);
        }
      } catch (error) {
        console.error('Error fetching TV serials:', error);
        const errorMessage = handleAPIError(error);
        toast({
          title: "Error loading content",
          description: errorMessage.message || "There was a problem loading TV serials. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTvSerials();
  }, [genre, filterType, toast]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-moviemate-background to-purple-900/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="mb-8 flex flex-col gap-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Indian TV Serials</h1>
              <p className="text-gray-400">
                Explore popular TV serials from across India
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant={filterType === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType('all')}
                className={filterType === 'all' ? "bg-moviemate-primary text-white" : ""}
              >
                All Types
              </Button>
              
              <Button 
                variant={filterType === 'drama' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType('drama')}
                className={filterType === 'drama' ? "bg-moviemate-primary text-white" : ""}
              >
                Drama
              </Button>
              
              <Button 
                variant={filterType === 'comedy' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType('comedy')}
                className={filterType === 'comedy' ? "bg-moviemate-primary text-white" : ""}
              >
                Comedy
              </Button>
              
              <Button 
                variant={filterType === 'family' ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType('family')}
                className={filterType === 'family' ? "bg-moviemate-primary text-white" : ""}
              >
                Family
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
          <div className="flex flex-col items-center justify-center rounded-xl bg-moviemate-card/50 p-12 text-center backdrop-blur-sm">
            <Tv size={64} className="mb-4 text-gray-500" />
            <h3 className="mb-2 text-xl font-semibold text-white">No TV serials found</h3>
            <p className="text-gray-400">Try adjusting your filters or search criteria</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setFilterType('all')}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TvSerials;
