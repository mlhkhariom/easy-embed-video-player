
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { getPopularMovies, getTopRatedMovies, getMoviesByGenre } from '../services/tmdb';
import { useToast } from '@/components/ui/use-toast';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'popular';
  const genreParam = searchParams.get('genre');
  
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();
  
  // Intersection observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastMovieElementRef = useRef<HTMLDivElement>(null);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setSearchParams({ category: value });
    setMovies([]);
    setPage(1);
    setHasMore(true);
    window.scrollTo(0, 0);
  };
  
  // Fetch movies based on category
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
        } else {
          setMovies(prevMovies => [...prevMovies, ...response.results]);
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
  
  // Initial fetch
  useEffect(() => {
    fetchMovies(true);
  }, [categoryParam, genreParam, fetchMovies]);
  
  // Setup intersection observer for infinite scrolling
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
  
  // Fetch more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchMovies();
    }
  }, [page, fetchMovies]);
  
  // Get page title based on params
  const getPageTitle = () => {
    if (genreParam) {
      return 'Genre Movies';
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-6">{getPageTitle()}</h1>
        
        {!genreParam && (
          <Tabs defaultValue={categoryParam} onValueChange={handleTabChange} className="mb-8">
            <TabsList>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="top_rated">Top Rated</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        {error ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
            <p className="text-destructive">{error}</p>
            <button 
              onClick={() => fetchMovies(true)} 
              className="mt-2 px-4 py-2 bg-primary text-white rounded-md"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((movie, index) => {
                const isLastElement = index === movies.length - 1;
                return (
                  <div 
                    key={movie.id} 
                    ref={isLastElement ? lastMovieRef : null}
                  >
                    <MovieCard 
                      movieId={movie.id}
                      title={movie.title}
                      posterPath={movie.poster_path}
                      rating={movie.vote_average}
                      mediaType="movie"
                    />
                  </div>
                );
              })}
              
              {(isLoading || isLoadingMore) && (
                Array.from({ length: 10 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="rounded-lg overflow-hidden">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                    <Skeleton className="h-3 w-1/3 mt-1" />
                  </div>
                ))
              )}
            </div>
            
            {!isLoading && !isLoadingMore && movies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No movies found.</p>
              </div>
            )}
            
            {!hasMore && movies.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">End of results</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Movies;
