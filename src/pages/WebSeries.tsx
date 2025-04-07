import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { FadeIn, StaggerContainer, StaggerItem, ScrollReveal } from '../components/ui/animations';
import { GlassCard } from '../components/ui/effects';
import { CardsGridSkeleton } from '../components/ui/loaders';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getPopularTvShows, discoverContent } from '../services/tmdb';
import { Tv, Search, Filter, Globe, Star } from 'lucide-react';

const WebSeries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [webSeries, setWebSeries] = useState<any[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryType, setCategoryType] = useState(searchParams.get('category') || 'popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterYear, setFilterYear] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterNetwork, setFilterNetwork] = useState('');
  const { toast } = useToast();
  
  const filterWebSeries = (shows: any[]) => {
    return shows.filter(show => {
      const isHighRated = show.vote_average >= 6.5;
      const hasFewerEpisodes = !show.number_of_episodes || show.number_of_episodes < 30;
      const isRecent = show.first_air_date && new Date(show.first_air_date).getFullYear() >= 2008;
      
      const streamingNetworks = [213, 1024, 2739, 2552, 4344, 2703, 3186];
      const isOnStreaming = show.networks?.some((network: any) => 
        streamingNetworks.includes(network.id)
      );
      
      return (isHighRated && hasFewerEpisodes && isRecent) || isOnStreaming || show.type === 'web_series';
    });
  };
  
  useEffect(() => {
    const fetchWebSeries = async () => {
      setIsLoading(true);
      try {
        const response = await getPopularTvShows();
        const webSeriesResults = filterWebSeries(response.results);
        setWebSeries(webSeriesResults);
        setFilteredSeries(webSeriesResults);
      } catch (error) {
        console.error('Error fetching web series:', error);
        toast({
          title: "Error",
          description: "Failed to load web series data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWebSeries();
  }, [toast]);
  
  useEffect(() => {
    if (!webSeries.length) return;
    
    let results = [...webSeries];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(show => 
        show.name.toLowerCase().includes(query) || 
        (show.overview && show.overview.toLowerCase().includes(query))
      );
    }
    
    if (filterYear) {
      results = results.filter(show => 
        show.first_air_date && show.first_air_date.includes(filterYear)
      );
    }
    
    if (filterLanguage) {
      results = results.filter(show => 
        show.original_language === filterLanguage.toLowerCase()
      );
    }
    
    setFilteredSeries(results);
  }, [searchQuery, filterYear, filterLanguage, filterNetwork, webSeries]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setFilterYear('');
    setFilterLanguage('');
    setFilterNetwork('');
  };
  
  const getWebSeriesNetworks = () => {
    const networks: any[] = [];
    
    webSeries.forEach(show => {
      if (show.networks && Array.isArray(show.networks)) {
        show.networks.forEach((network: any) => {
          if (!networks.find(n => n.id === network.id)) {
            networks.push(network);
          }
        });
      }
    });
    
    return networks;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-moviemate-background via-purple-900/10 to-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <FadeIn>
          <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
                <Tv className="h-8 w-8 text-moviemate-primary" />
                <span>Web Series</span>
              </h1>
              <p className="text-gray-400 mt-1">
                Discover premium streaming shows from around the world
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          
          <form onSubmit={handleSearch} className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search web series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </form>
          
          {showAdvancedFilters && (
            <ScrollReveal>
              <GlassCard intensity="medium" className="p-6 mb-8">
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">
                      Release Year
                    </label>
                    <Input
                      type="number"
                      placeholder="Filter by year (e.g., 2023)"
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">
                      Language
                    </label>
                    <select
                      className="w-full p-2 rounded-md bg-card text-white border border-input"
                      value={filterLanguage}
                      onChange={(e) => setFilterLanguage(e.target.value)}
                    >
                      <option value="">All Languages</option>
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                      <option value="ja">Japanese</option>
                      <option value="ko">Korean</option>
                    </select>
                  </div>
                  
                  <div className="flex flex-col justify-end">
                    <Button onClick={resetFilters} variant="outline">
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          )}
        </FadeIn>
        
        {isLoading ? (
          <CardsGridSkeleton count={12} />
        ) : filteredSeries.length > 0 ? (
          <StaggerContainer>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredSeries.map((show) => (
                <StaggerItem key={show.id}>
                  <div className="group relative">
                    <MovieCard
                      item={show}
                      type="tv"
                    />
                    {show.networks && show.networks[0] && (
                      <Badge 
                        className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm" 
                        variant="outline"
                      >
                        {show.networks[0].name}
                      </Badge>
                    )}
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No web series found</p>
            <p className="text-gray-500 mt-2">
              Try adjusting your filters or search criteria
            </p>
            <Button onClick={resetFilters} className="mt-4">
              Reset Filters
            </Button>
          </div>
        )}
        
        {filteredSeries.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg">
              Load More
            </Button>
          </div>
        )}
        
        <ScrollReveal>
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">
              Popular Streaming Platforms
            </h2>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {['Netflix', 'Amazon Prime', 'Disney+', 'HBO Max', 'Hulu', 'Apple TV+'].map((platform) => (
                <div
                  key={platform}
                  className="bg-moviemate-card p-4 rounded-lg text-center hover:bg-moviemate-card/80 transition-colors"
                >
                  <div className="w-16 h-16 mx-auto bg-moviemate-primary/20 rounded-full flex items-center justify-center mb-2">
                    <Globe className="h-8 w-8 text-moviemate-primary" />
                  </div>
                  <p className="font-medium text-white">{platform}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
};

export default WebSeries;
