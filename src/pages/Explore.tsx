
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { FadeIn, StaggerContainer, StaggerItem, ScrollReveal } from '../components/ui/animations';
import { GlassCard, GradientText } from '../components/ui/effects';
import { DotsLoader } from '../components/ui/loaders';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { getGenres, getPopularMovies, getPopularTvShows, discoverContent } from '../services/tmdb';
import { Compass, Film, Tv, TrendingUp, Star, Clock, CalendarDays, Tag, Filter } from 'lucide-react';

const Explore = () => {
  const [genres, setGenres] = useState<any[]>([]);
  const [discoverResults, setDiscoverResults] = useState<any[]>([]);
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');
  const [isLoading, setIsLoading] = useState(false);
  const [activeGenres, setActiveGenres] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [year, setYear] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await getGenres();
        setGenres(data.genres);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
        toast({
          title: "Error",
          description: "Failed to load genre data",
          variant: "destructive",
        });
      }
    };
    
    fetchGenres();
  }, [toast]);
  
  // Fetch initial content
  useEffect(() => {
    const fetchInitialContent = async () => {
      setIsLoading(true);
      try {
        let data;
        if (contentType === 'movie') {
          data = await getPopularMovies();
        } else {
          data = await getPopularTvShows();
        }
        setDiscoverResults(data.results);
      } catch (error) {
        console.error('Failed to fetch content:', error);
        toast({
          title: "Error",
          description: `Failed to load ${contentType === 'movie' ? 'movies' : 'TV shows'}`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (activeGenres.length === 0) {
      fetchInitialContent();
    } else {
      handleFilter();
    }
  }, [contentType, toast]);
  
  // Handle genre toggle
  const toggleGenre = (genreId: number) => {
    setActiveGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };
  
  // Handle filtering
  const handleFilter = async () => {
    setIsLoading(true);
    try {
      const data = await discoverContent({
        type: contentType,
        genreIds: activeGenres,
        sortBy,
        year: year ? parseInt(year) : undefined,
      });
      setDiscoverResults(data.results);
    } catch (error) {
      console.error('Failed to discover content:', error);
      toast({
        title: "Error",
        description: "Failed to filter content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset filters
  const resetFilters = () => {
    setActiveGenres([]);
    setSortBy('popularity.desc');
    setYear('');
  };
  
  // Navigate to genre page
  const navigateToGenre = (genreId: number, genreName: string) => {
    navigate(`/genre/${genreId}?name=${genreName}&type=${contentType}`);
  };
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <FadeIn>
          <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
                <Compass className="h-8 w-8 text-moviemate-primary" />
                <span>Explore</span>
              </h1>
              <p className="text-gray-400 mt-1">
                Discover movies and TV shows based on your preferences
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsFilterVisible(!isFilterVisible)}
            >
              <Filter size={16} />
              {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          
          <Tabs
            defaultValue="movie"
            value={contentType}
            onValueChange={(value) => setContentType(value as 'movie' | 'tv')}
            className="mb-8"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="movie" className="flex items-center gap-2">
                <Film size={16} />
                Movies
              </TabsTrigger>
              <TabsTrigger value="tv" className="flex items-center gap-2">
                <Tv size={16} />
                TV Shows
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isFilterVisible && (
            <ScrollReveal>
              <GlassCard intensity="medium" className="p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-white">Filters</h3>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {genres.map(genre => (
                        <Button
                          key={genre.id}
                          size="sm"
                          variant={activeGenres.includes(genre.id) ? "default" : "outline"}
                          className={activeGenres.includes(genre.id) ? "bg-moviemate-primary" : ""}
                          onClick={() => toggleGenre(genre.id)}
                        >
                          {genre.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Sort By</h4>
                    <select
                      className="w-full p-2 rounded-md bg-card text-white border border-input"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="popularity.desc">Popularity (High to Low)</option>
                      <option value="popularity.asc">Popularity (Low to High)</option>
                      <option value="vote_average.desc">Rating (High to Low)</option>
                      <option value="vote_average.asc">Rating (Low to High)</option>
                      <option value="primary_release_date.desc">Release Date (Newest)</option>
                      <option value="primary_release_date.asc">Release Date (Oldest)</option>
                    </select>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Year</h4>
                    <Input
                      type="number"
                      placeholder="Enter year (e.g., 2023)"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <Button onClick={handleFilter} className="flex-1">Apply Filters</Button>
                    <Button variant="outline" onClick={resetFilters}>Reset</Button>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          )}
        </FadeIn>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <DotsLoader size="lg" color="primary" />
          </div>
        ) : discoverResults.length > 0 ? (
          <StaggerContainer>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {discoverResults.map((item) => (
                <StaggerItem key={item.id}>
                  <MovieCard
                    item={item}
                    type={contentType}
                  />
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-400">No results found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            {activeGenres.length > 0 && (
              <Button onClick={resetFilters} className="mt-4">
                Reset Filters
              </Button>
            )}
          </div>
        )}
        
        <ScrollReveal>
          <div className="mt-16">
            <GradientText className="text-2xl font-bold mb-6">
              Popular Genres
            </GradientText>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {genres.slice(0, 10).map(genre => (
                <div
                  key={genre.id}
                  className="relative overflow-hidden rounded-lg aspect-video cursor-pointer group"
                  onClick={() => navigateToGenre(genre.id, genre.name)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-moviemate-primary/50 to-purple-900/50 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-xl font-bold text-white text-center px-2">{genre.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
};

export default Explore;
