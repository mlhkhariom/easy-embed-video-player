import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getPopularMovies, getTopRatedMovies, getMoviesByGenre, getGenres } from '../services/tmdb';
import { useToast } from '@/components/ui/use-toast';
import { FadeIn, StaggerContainer, StaggerItem, ScrollReveal } from '../components/ui/animations';
import { GlassCard } from '../components/ui/effects';
import { CardsGridSkeleton } from '../components/ui/loaders';
import { Film, Filter, Search, SortDesc, Star as StarIcon } from 'lucide-react';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'popular';
  const genreParam = searchParams.get('genre');
  
  const [movies, setMovies] = useState<any[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [yearFilter, setYearFilter] = useState('');
  const { toast } = useToast();
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastMovieElementRef = useRef<HTMLDivElement>(null);
  
  const handleTabChange = (value: string) => {
    setSearchParams({ category: value });
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setSearchQuery('');
    setSelectedGenres([]);
    setYearFilter('');
    window.scrollTo(0, 0);
  };
  
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await getGenres();
        setGenres(response.genres);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    
    fetchGenres();
  }, []);
  
  const fetchMovies = useCallback(async (resetMovies = false) => {
    try {
      if (resetMovies) {
        setMovies([]);
        setPage(1);
        setHasMore(true);
      }
      
      setIsLoading(true);
      setError(null);
      
      let response;
      
      if (genreParam) {
        response = await getMoviesByGenre(parseInt(genreParam), page);
      } else if (categoryParam === 'top_rated') {
        response = await getTopRatedMovies();
      } else {
        response = await getPopularMovies();
      }
      
      if (response && response.results) {
        if (resetMovies) {
          setMovies(response.results);
          setFilteredMovies(response.results);
        } else {
          setMovies(prevMovies => {
            const newMovies = [...prevMovies, ...response.results];
            setFilteredMovies(newMovies);
            return newMovies;
          });
        }
        
        setHasMore(page < response.total_pages);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setError('Failed to load movies. Please try again later.');
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load movies. Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [categoryParam, genreParam, page, toast]);
  
  useEffect(() => {
    fetchMovies(true);
  }, [categoryParam, genreParam, fetchMovies]);
  
  const lastMovieRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isLoadingMore) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setIsLoadingMore(true);
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) {
      observer.current.observe(node);
    }
  }, [isLoading, isLoadingMore, hasMore]);
  
  useEffect(() => {
    if (page > 1) {
      fetchMovies();
    }
  }, [page, fetchMovies]);
  
  useEffect(() => {
    if (!movies.length) return;
    
    let results = [...movies];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(movie => 
        movie.title.toLowerCase().includes(query) || 
        (movie.overview && movie.overview.toLowerCase().includes(query))
      );
    }
    
    if (selectedGenres.length > 0) {
      results = results.filter(movie => 
        movie.genre_ids?.some(id => selectedGenres.includes(id))
      );
    }
    
    if (yearFilter) {
      results = results.filter(movie => 
        movie.release_date && movie.release_date.includes(yearFilter)
      );
    }
    
    setFilteredMovies(results);
  }, [searchQuery, selectedGenres, yearFilter, movies]);
  
  const toggleGenre = (genreId: number) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId) 
        : [...prev, genreId]
    );
  };
  
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setYearFilter('');
  };
  
  const getPageTitle = () => {
    if (genreParam) {
      const genre = genres.find(g => g.id === parseInt(genreParam));
      return genre ? `${genre.name} Movies` : 'Genre Movies';
    }
    
    switch (categoryParam) {
      case 'top_rated':
        return 'Top Rated Movies';
      case 'popular':
      default:
        return 'Popular Movies';
    }
  };
  
  return (
    <div className="min-h-screen bg-moviemate-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <FadeIn>
          <div className="flex flex-col items-start justify-between gap-4 mb-6 md:flex-row md:items-center">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
                <Film className="h-8 w-8 text-moviemate-primary" />
                {getPageTitle()}
              </h1>
              <p className="text-gray-400 mt-1">
                Discover and explore the best cinema has to offer
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>
          
          {!genreParam && (
            <Tabs defaultValue={categoryParam} onValueChange={handleTabChange} className="mb-6">
              <TabsList>
                <TabsTrigger value="popular" className="flex items-center gap-1">
                  <SortDesc className="h-4 w-4" />
                  Popular
                </TabsTrigger>
                <TabsTrigger value="top_rated" className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4" />
                  Top Rated
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          
          <div className="mb-6">
            <form className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </form>
          </div>
          
          {showFilters && (
            <ScrollReveal>
              <GlassCard intensity="low" className="p-6 mb-8">
                <h3 className="text-lg font-medium text-white mb-4">Filters</h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {genres.map(genre => (
                        <Button
                          key={genre.id}
                          size="sm"
                          variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                          className={selectedGenres.includes(genre.id) ? "bg-moviemate-primary" : ""}
                          onClick={() => toggleGenre(genre.id)}
                        >
                          {genre.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Release Year</h4>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Enter year (e.g., 2023)"
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={resetFilters} variant="outline">
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </ScrollReveal>
          )}
        </FadeIn>
        
        {error ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
            <p className="text-destructive">{error}</p>
            <Button 
              onClick={() => fetchMovies(true)} 
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : isLoading && page === 1 ? (
          <CardsGridSkeleton count={10} />
        ) : filteredMovies.length > 0 ? (
          <StaggerContainer>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredMovies.map((movie, index) => {
                const isLastElement = index === filteredMovies.length - 1;
                return (
                  <StaggerItem key={`${movie.id}-${index}`}>
                    <div 
                      ref={isLastElement ? lastMovieRef : null}
                    >
                      <MovieCard 
                        item={movie}
                        type="movie"
                      />
                    </div>
                  </StaggerItem>
                );
              })}
            </div>
            
            {isLoadingMore && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mt-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={`skeleton-${index}`} className="aspect-[2/3] rounded-lg" />
                ))}
              </div>
            )}
          </StaggerContainer>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No movies found.</p>
            {(searchQuery || selectedGenres.length > 0 || yearFilter) && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Try adjusting your filters</p>
                <Button onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        )}
        
        {!isLoading && !isLoadingMore && filteredMovies.length > 0 && !hasMore && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">End of results</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Movies;
