
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TvShow } from '../types';
import { getIndianTVShows } from '../services/tmdb';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Tv, Filter, Search, Star, CalendarClock, LanguagesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { handleAPIError } from '../services/error-handler';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

const TvSerials = () => {
  const [tvSerials, setTvSerials] = useState<TvShow[]>([]);
  const [filteredSerials, setFilteredSerials] = useState<TvShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [filterType, setFilterType] = useState<'all' | 'drama' | 'comedy' | 'family'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelType, setChannelType] = useState<'all' | 'hindi' | 'regional'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const genre = searchParams.get('genre');
  
  // Filter for TV serials only
  const filterTvSerials = (shows: TvShow[]) => {
    return shows.filter(show => {
      // Explicit check for tv_serial type first
      if (show.show_type === 'tv_serial') return true;
      
      // Criteria for TV serials if not explicitly marked:
      // - Many episodes (>50)
      // - Multiple seasons (>=5)
      // - Typically daily broadcast format
      return (
        (show.number_of_episodes > 50 || show.number_of_seasons >= 5) &&
        show.show_type !== 'web_series'
      );
    });
  };
  
  useEffect(() => {
    const fetchTvSerials = async () => {
      try {
        setIsLoading(true);
        
        // Always get Indian TV shows as we're focusing on Indian content
        const tvShowsRes = await getIndianTVShows();
        
        // Better filtering for TV serials
        const serialsResults = filterTvSerials(tvShowsRes.results);
        
        if (serialsResults.length === 0) {
          // If no shows match our strict criteria, use broader criteria
          const broadResults = tvShowsRes.results.filter(show => 
            show.number_of_episodes > 20 || show.number_of_seasons >= 2
          );
          setTvSerials(broadResults.length > 0 ? broadResults : tvShowsRes.results);
          
          toast({
            title: "Limited filtering applied",
            description: "Showing all Indian TV shows as specific TV serials couldn't be identified.",
            variant: "default"
          });
        } else {
          setTvSerials(serialsResults);
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
  }, [genre, toast]);
  
  // Apply filters whenever they change
  useEffect(() => {
    if (tvSerials.length === 0) return;
    
    let results = [...tvSerials];
    
    // Filter by genre if selected
    if (filterType !== 'all') {
      const genreMap: Record<string, number[]> = {
        'drama': [18],
        'comedy': [35],
        'family': [10751]
      };
      
      results = results.filter(show => 
        show.genre_ids?.some(id => genreMap[filterType]?.includes(id))
      );
    }
    
    // Filter by language/channel type
    if (channelType !== 'all') {
      if (channelType === 'hindi') {
        results = results.filter(show => 
          show.original_language === 'hi' || 
          show.languages?.includes('hi')
        );
      } else if (channelType === 'regional') {
        results = results.filter(show => 
          show.original_language !== 'hi' &&
          (!show.languages || !show.languages.includes('hi'))
        );
      }
    }
    
    // Apply search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(show => 
        show.name?.toLowerCase().includes(query) || 
        show.overview?.toLowerCase().includes(query)
      );
    }
    
    setFilteredSerials(results);
  }, [tvSerials, filterType, channelType, searchQuery]);
  
  const getChannelInfo = (serial: TvShow) => {
    // This would be more accurate with actual data
    if (serial.original_language === 'hi') {
      if (serial.vote_average && serial.vote_average > 7.5) {
        return "Star Plus";
      } else if (serial.first_air_date && new Date(serial.first_air_date).getFullYear() > 2018) {
        return "Colors TV";
      } else {
        return "Zee TV";
      }
    } else if (serial.original_language === 'ta') {
      return "Sun TV";
    } else if (serial.original_language === 'te') {
      return "Zee Telugu";
    } else if (serial.original_language === 'ml') {
      return "Asianet";
    } else if (serial.original_language === 'bn') {
      return "Star Jalsha";
    }
    return "Indian TV";
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is applied in the useEffect
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };
  
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-moviemate-background to-purple-900/20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Navbar />
      
      <main className="container mx-auto px-2 sm:px-4 py-16">
        <motion.div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4" variants={itemVariants}>
          <div className="flex flex-col items-start justify-between gap-2 sm:gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Indian TV Serials</h1>
              <p className="text-sm sm:text-base text-gray-400">
                Popular daily soaps and TV serials from across India
              </p>
            </div>
            
            {/* Mobile filter toggle */}
            {isMobile && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={14} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            )}
          </div>
          
          {/* Responsive filters section */}
          <motion.div 
            className={`grid grid-cols-1 gap-3 sm:gap-4 ${!isMobile || showFilters ? 'block' : 'hidden'} ${isMobile ? '' : 'md:grid-cols-3'}`}
            variants={isMobile ? { 
              hidden: { height: 0, opacity: 0 },
              visible: { height: 'auto', opacity: 1, transition: { duration: 0.3 } } 
            } : itemVariants}
            animate={!isMobile || showFilters ? "visible" : "hidden"}
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Genre</h3>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Button 
                  variant={filterType === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType('all')}
                  className={`text-xs h-8 px-2 sm:h-9 sm:px-3 ${filterType === 'all' ? "bg-moviemate-primary text-white" : ""}`}
                >
                  All Genres
                </Button>
                
                <Button 
                  variant={filterType === 'drama' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType('drama')}
                  className={`text-xs h-8 px-2 sm:h-9 sm:px-3 ${filterType === 'drama' ? "bg-moviemate-primary text-white" : ""}`}
                >
                  Drama
                </Button>
                
                <Button 
                  variant={filterType === 'comedy' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType('comedy')}
                  className={`text-xs h-8 px-2 sm:h-9 sm:px-3 ${filterType === 'comedy' ? "bg-moviemate-primary text-white" : ""}`}
                >
                  Comedy
                </Button>
                
                <Button 
                  variant={filterType === 'family' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType('family')}
                  className={`text-xs h-8 px-2 sm:h-9 sm:px-3 ${filterType === 'family' ? "bg-moviemate-primary text-white" : ""}`}
                >
                  Family
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Channel Type</h3>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Button 
                  variant={channelType === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChannelType('all')}
                  className={`text-xs h-8 px-2 sm:h-9 sm:px-3 ${channelType === 'all' ? "bg-moviemate-primary text-white" : ""}`}
                >
                  All Channels
                </Button>
                
                <Button 
                  variant={channelType === 'hindi' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChannelType('hindi')}
                  className={`text-xs h-8 px-2 sm:h-9 sm:px-3 ${channelType === 'hindi' ? "bg-moviemate-primary text-white" : ""}`}
                >
                  Hindi
                </Button>
                
                <Button 
                  variant={channelType === 'regional' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChannelType('regional')}
                  className={`text-xs h-8 px-2 sm:h-9 sm:px-3 ${channelType === 'regional' ? "bg-moviemate-primary text-white" : ""}`}
                >
                  Regional
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-400">Search</h3>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search TV serials..."
                    className="pl-8 sm:pl-9 h-8 sm:h-9 text-xs sm:text-sm"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  className="px-1 sm:px-2 h-8 sm:h-9"
                  onClick={() => {
                    setFilterType('all');
                    setChannelType('all');
                    setSearchQuery('');
                  }}
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </motion.div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: isMobile ? 6 : 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg bg-moviemate-card" />
            ))}
          </div>
        ) : filteredSerials.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredSerials.map((show, index) => (
              <motion.div
                key={show.id} 
                variants={itemVariants}
                style={{ originY: 0.5, originX: 0.5 }}
                whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
                whileTap={isMobile ? { scale: 0.98 } : undefined}
              >
                <Card className="group overflow-hidden rounded-lg border-0 bg-moviemate-card/60 transition-all hover:bg-moviemate-card">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img 
                      src={`https://image.tmdb.org/t/p/w500${show.poster_path}`} 
                      alt={show.name} 
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                    <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1 p-2 sm:p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-500" fill="currentColor" />
                        <span className="text-[10px] sm:text-xs font-medium text-white">{show.vote_average?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarClock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                        <span className="text-[10px] sm:text-xs text-gray-300">
                          {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <LanguagesIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-400" />
                        <span className="text-[10px] sm:text-xs text-gray-300">{show.original_language?.toUpperCase() || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="space-y-1.5 sm:space-y-2 p-2 sm:p-3">
                    <h3 className="truncate text-xs sm:text-sm font-medium text-white">{show.name}</h3>
                    <Badge variant="outline" className="bg-moviemate-primary/10 text-[10px] sm:text-xs">
                      {getChannelInfo(show)}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="flex flex-col items-center justify-center rounded-xl bg-moviemate-card/50 p-8 sm:p-12 text-center backdrop-blur-sm"
            variants={itemVariants}
          >
            <Tv size={isMobile ? 48 : 64} className="mb-4 text-gray-500" />
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-white">No TV serials found</h3>
            <p className="text-sm sm:text-base text-gray-400">Try adjusting your filters or search criteria</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setFilterType('all');
                setChannelType('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
};

export default TvSerials;
