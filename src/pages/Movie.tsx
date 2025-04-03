
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Movie } from '../types';
import { getMovieDetails, getMovieExternalIds, getRelatedMovies, getContentByCountry } from '../services/tmdb';
import Navbar from '../components/Navbar';
import { useToast } from "@/components/ui/use-toast";
import { handleAPIError } from '../services/error-handler';
import MovieDetails from '../components/movie/MovieDetails';
import MovieLoading from '../components/movie/MovieLoading';
import MovieError from '../components/movie/MovieError';
import RelatedMovies from '../components/movie/RelatedMovies';
import { useAdmin } from '../contexts/AdminContext';
import { motion } from 'framer-motion';
import PlayerSection from '../components/content/PlayerSection';

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();
  const { settings } = useAdmin();
  
  const fetchMovieDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setShowPlayer(false);
      
      const movieId = parseInt(id);
      const movieData = await getMovieDetails(movieId);
      
      try {
        const externalIds = await getMovieExternalIds(movieId);
        movieData.imdb_id = externalIds.imdb_id;
      } catch (error) {
        console.error('Error fetching external IDs:', error);
      }
      
      setMovie(movieData);
      
      try {
        // Use country-specific related movies if available
        const related = await getRelatedMovies(movieId);
        // Make sure each movie has a unique key by adding a prefix to the ID
        const uniqueMovies = related.results.slice(0, 10).map((movie) => ({
          ...movie
        }));
        setRelatedMovies(uniqueMovies);
      } catch (error) {
        console.error('Error fetching related movies:', error);
        // Try to get fallback movies from selected country
        try {
          const countryMovies = await getContentByCountry(settings.selectedCountry, 'movie');
          // Ensure we're only setting movies (not TvShow types)
          const movies = countryMovies.results
            .filter(item => item.media_type === 'movie' || !item.media_type)
            .slice(0, 10);
          setRelatedMovies(movies as Movie[]);
        } catch (fallbackError) {
          console.error('Error fetching fallback movies:', fallbackError);
        }
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
      setIsRetrying(false);
    }
  }, [id, toast, settings.selectedCountry]);
  
  useEffect(() => {
    fetchMovieDetails();
  }, [fetchMovieDetails]);
  
  const handleRetry = () => {
    setIsRetrying(true);
    fetchMovieDetails();
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-24">
        {isLoading ? (
          <MovieLoading />
        ) : error ? (
          <MovieError message={error} onRetry={handleRetry} isRetrying={isRetrying} />
        ) : movie ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MovieDetails 
              movie={movie}
              showPlayer={showPlayer}
              setShowPlayer={setShowPlayer}
            />
            
            {showPlayer && (
              <PlayerSection 
                showPlayer={showPlayer}
                isMovie={true}
                contentId={movie.id}
                imdbId={movie.imdb_id}
                title={movie.title}
              />
            )}
            
            <RelatedMovies 
              movieId={movie.id}
              initialMovies={relatedMovies}
            />
          </motion.div>
        ) : (
          <MovieError message="Movie not found" onRetry={handleRetry} isRetrying={isRetrying} />
        )}
      </main>
    </div>
  );
};

export default MoviePage;
