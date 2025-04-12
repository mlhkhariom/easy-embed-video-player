import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Movie } from '../types';
import { getMovieDetails, getMovieExternalIds, getRelatedMovies } from '../services/tmdb';
import Navbar from '../components/Navbar';
import { useToast } from "@/components/ui/use-toast";
import { handleAPIError } from '../services/error-handler';
import MovieDetails from '../components/movie/MovieDetails';
import MovieLoading from '../components/movie/MovieLoading';
import MovieError from '../components/movie/MovieError';
import RelatedMovies from '../components/movie/RelatedMovies';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  
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
        movieData.imdb_id = externalIds?.imdb_id || null;
      } catch (error) {
        console.error('Error fetching external IDs:', error);
      }
      
      setMovie(movieData);
      
      // Fetch related movies in parallel
      try {
        const related = await getRelatedMovies(movieId);
        if (related && related.results) {
          const uniqueRelated = related.results
            .filter((movie, index, self) => 
              index === self.findIndex((m) => m.id === movie.id)
            )
            .slice(0, isMobile ? 6 : 10)
            .map(movie => ({
              ...movie,
              // Use the id directly as the key since we've already filtered for uniqueness
              key: `related-${movie.id}`
            }));
          setRelatedMovies(uniqueRelated);
        } else {
          setRelatedMovies([]);
        }
      } catch (error) {
        console.error('Error fetching related movies:', error);
        setRelatedMovies([]);
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
  }, [id, toast, isMobile]);
  
  useEffect(() => {
    fetchMovieDetails();
  }, [fetchMovieDetails]);
  
  const handleRetry = () => {
    setIsRetrying(true);
    fetchMovieDetails();
  };
  
  // Page animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  // Function to scroll to player when play button is clicked
  const handleShowPlayerChange = (show: boolean) => {
    setShowPlayer(show);
    
    // If showing player, wait for a moment for it to render and then scroll to it
    if (show) {
      setTimeout(() => {
        const playerElement = document.getElementById('player-section');
        if (playerElement) {
          playerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };
  
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-moviemate-background to-black"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Navbar />
      
      <motion.main 
        className={`container mx-auto px-2 sm:px-4 pt-16 sm:pt-24 pb-16 sm:pb-24 ${isMobile ? 'max-w-full' : ''}`}
        variants={itemVariants}
      >
        {isLoading ? (
          <MovieLoading />
        ) : error ? (
          <MovieError message={error} onRetry={handleRetry} isRetrying={isRetrying} />
        ) : movie ? (
          <div className="space-y-8">
            {/* Movie Details without the player inside */}
            <MovieDetails 
              movie={movie}
              showPlayer={showPlayer}
              setShowPlayer={handleShowPlayerChange}
            />
            
            {/* Player section at top after header */}
            {showPlayer && (
              <motion.div
                id="player-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="rounded-xl overflow-hidden bg-moviemate-card shadow-lg border border-gray-800">
                  <PlayerSection 
                    showPlayer={showPlayer}
                    isMovie={true}
                    contentId={movie.id}
                    imdbId={movie.imdb_id}
                    title={movie.title}
                  />
                </div>
              </motion.div>
            )}
            
            {/* Related Movies Section */}
            {relatedMovies.length > 0 && (
              <RelatedMovies 
                movieId={movie.id}
                initialMovies={relatedMovies}
              />
            )}
          </div>
        ) : (
          <MovieError message="Movie not found" onRetry={handleRetry} isRetrying={isRetrying} />
        )}
      </motion.main>
    </motion.div>
  );
};

export default MoviePage;
