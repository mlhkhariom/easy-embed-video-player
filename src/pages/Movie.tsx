import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Movie } from '../types';
import { getMovieDetails, getMovieExternalIds, getRelatedMovies } from '../services/tmdb';
import Navbar from '../components/Navbar';
import ContentDetails from '../components/ContentDetails';
import { Card } from '@/components/ui/card';
import ContentHeader from '../components/content/ContentHeader';
import PlayerSection from '../components/content/PlayerSection';
import { useToast } from "@/components/ui/use-toast";
import { handleAPIError } from '../services/error-handler';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import MovieCard from '../components/MovieCard';

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        setShowPlayer(false);
        
        // Fetch the movie details
        const movieId = parseInt(id);
        const movieData = await getMovieDetails(movieId);
        
        // Get external IDs (for IMDB ID)
        try {
          const externalIds = await getMovieExternalIds(movieId);
          movieData.imdb_id = externalIds.imdb_id;
        } catch (error) {
          console.error('Error fetching external IDs:', error);
        }
        
        setMovie(movieData);
        
        // Fetch related movies
        try {
          const related = await getRelatedMovies(movieId);
          setRelatedMovies(related.results.slice(0, 10));
        } catch (error) {
          console.error('Error fetching related movies:', error);
        }
        
      } catch (error) {
        const apiError = handleAPIError(error);
        setError(apiError.message);
        toast({
          variant: "destructive",
          title: "Error loading content",
          description: apiError.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovieDetails();
    
    // Cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [id, toast]);
  
  // Handle intersection for infinite loading
  const lastMovieRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoadingMore) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && relatedMovies.length > 0) {
        // Load more related movies
        const loadMoreRelatedMovies = async () => {
          if (!id) return;
          
          try {
            setIsLoadingMore(true);
            const movieId = parseInt(id);
            const more = await getRelatedMovies(movieId, relatedMovies.length / 20 + 1);
            setRelatedMovies(prev => [...prev, ...more.results.slice(0, 10)]);
          } catch (error) {
            console.error('Error loading more related movies:', error);
          } finally {
            setIsLoadingMore(false);
          }
        };
        
        loadMoreRelatedMovies();
      }
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [id, isLoadingMore, relatedMovies.length]);
  
  // Format movie details for header
  const getFormattedMovieDetails = () => {
    if (!movie) return { title: '', formattedDate: '', formattedRuntime: '', rating: '' };
    
    const title = movie.title;
    const formattedDate = movie.release_date 
      ? new Date(movie.release_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : '';
    
    const formattedRuntime = movie.runtime 
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
      : '';
    
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '0.0';
    
    return { title, formattedDate, formattedRuntime, rating };
  };
  
  const { title, formattedDate, formattedRuntime, rating } = getFormattedMovieDetails();
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-24">
        {isLoading ? (
          <Card className="w-full p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-2/3 rounded-md bg-muted"></div>
              <div className="h-4 w-1/3 rounded-md bg-muted"></div>
              <div className="h-32 w-full rounded-md bg-muted"></div>
            </div>
          </Card>
        ) : error ? (
          <Card className="w-full p-8 border-red-500/20 bg-red-500/10">
            <h2 className="mb-4 text-2xl font-bold">Error</h2>
            <p>{error}</p>
          </Card>
        ) : movie ? (
          <div className="space-y-8">
            {/* Content Header with Backdrop */}
            <ContentHeader 
              content={movie} 
              type="movie"
              title={title}
              formattedDate={formattedDate}
              formattedRuntime={formattedRuntime}
              rating={rating}
              showPlayer={showPlayer}
              setShowPlayer={setShowPlayer}
            />
            
            {/* Player Section */}
            <PlayerSection 
              showPlayer={showPlayer}
              isMovie={true}
              contentId={movie.id}
              imdbId={movie.imdb_id}
              title={movie.title}
            />
            
            {/* Additional Details */}
            <ContentDetails content={movie} type="movie" />
            
            {/* Related Movies */}
            {relatedMovies.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">You May Also Like</h2>
                <Separator className="mb-6" />
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {relatedMovies.map((relatedMovie, index) => (
                    <div 
                      key={relatedMovie.id} 
                      ref={index === relatedMovies.length - 1 ? lastMovieRef : null}
                    >
                      <MovieCard 
                        id={relatedMovie.id}
                        title={relatedMovie.title}
                        posterPath={relatedMovie.poster_path}
                        voteAverage={relatedMovie.vote_average}
                        type="movie"
                        genreIds={relatedMovie.genre_ids || []}
                      />
                    </div>
                  ))}
                  
                  {isLoadingMore && (
                    <>
                      {[1, 2, 3, 4].map((i) => (
                        <div key={`skeleton-${i}`} className="rounded-lg overflow-hidden">
                          <Skeleton className="aspect-[2/3] w-full" />
                          <Skeleton className="h-4 w-2/3 mt-2" />
                          <Skeleton className="h-3 w-1/3 mt-1" />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default MoviePage;
