
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getPopularTvShows, getTopRatedTvShows } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { AlertCircle, Filter, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { handleAPIError } from '../services/error-handler';
import { TvShow } from '../types';

const WebSeries = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [filteredShows, setFilteredShows] = useState<TvShow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { toast } = useToast();
  
  // Only get web series (not TV serials)
  const filterWebSeries = (shows: TvShow[]) => {
    return shows.filter(show => {
      // Criteria for web series:
      // - Less than 100 episodes
      // - Less than 5 seasons typically
      // - Higher production value (use vote_average as a proxy)
      return (!show.number_of_seasons || show.number_of_seasons < 5) && 
             (!show.number_of_episodes || show.number_of_episodes < 100) &&
             show.show_type !== 'tv_serial';
    });
  };

  const { data: popularShows, error: popularError } = useQuery({
    queryKey: ['popular-tv'],
    queryFn: getPopularTvShows,
  });

  const { data: topRatedShows, error: topRatedError } = useQuery({
    queryKey: ['top-rated-tv'],
    queryFn: getTopRatedTvShows,
  });

  useEffect(() => {
    if (popularShows && topRatedShows) {
      const webSeriesPopular = filterWebSeries(popularShows.results);
      const webSeriesTopRated = filterWebSeries(topRatedShows.results);
      
      let combinedShows: TvShow[] = [];
      
      if (selectedFilter === 'popular') {
        combinedShows = webSeriesPopular;
      } else if (selectedFilter === 'top_rated') {
        combinedShows = webSeriesTopRated;
      } else {
        // Combine both lists and remove duplicates
        const allShows = [...webSeriesPopular, ...webSeriesTopRated];
        const uniqueIds = new Set();
        combinedShows = allShows.filter(show => {
          if (uniqueIds.has(show.id)) {
            return false;
          }
          uniqueIds.add(show.id);
          return true;
        });
      }
      
      // Filter by search query if present
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        combinedShows = combinedShows.filter(show => 
          show.name?.toLowerCase().includes(query) || 
          show.overview?.toLowerCase().includes(query)
        );
      }
      
      setFilteredShows(combinedShows);
      setIsLoading(false);
    }
  }, [popularShows, topRatedShows, selectedFilter, searchQuery]);

  const hasError = popularError || topRatedError;
  
  if (hasError) {
    const error = popularError || topRatedError;
    const errorMessage = handleAPIError(error);
    
    toast({
      title: "Error loading web series",
      description: errorMessage.message || "Failed to load content. Please try again later.",
      variant: "destructive"
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-moviemate-background to-purple-900/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Web Series</h1>
            <p className="text-gray-400">Discover premium web series from around the world</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search web series..."
                  className="pl-8 w-[200px] bg-moviemate-card/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-[150px] bg-moviemate-card/50">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Web Series</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="top_rated">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Separator className="mb-6 bg-gray-700/50" />
        
        {hasError && (
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
        ) : filteredShows.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredShows.map((show) => (
              <MovieCard key={show.id} item={show} type="tv" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-moviemate-card/50 p-12 text-center backdrop-blur-sm">
            <Search size={64} className="mb-4 text-gray-500" />
            <h3 className="mb-2 text-xl font-semibold text-white">No web series found</h3>
            <p className="text-gray-400">Try adjusting your filters or search criteria</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSelectedFilter('all');
                setSearchQuery('');
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WebSeries;
