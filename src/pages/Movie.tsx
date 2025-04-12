
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
  
  const handleShowPlayerChange = (show: boolean) => {
    setShowPlayer(show);
    
    if (show) {
      setTimeout(() => {
        const playerElement = document.getElementById('player-section');
        if (playerElement) {
          playerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };
  
  // Function to format movie details for display
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
            {/* Content Header with Watch Now Button */}
            <motion.div variants={itemVariants}>
              <div className="relative mb-8 overflow-hidden rounded-2xl">
                <div className="absolute inset-0">
                  <img 
                    src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-moviemate-background via-moviemate-background/90 to-transparent"></div>
                </div>
                
                <div className="relative z-10 flex flex-col gap-8 px-4 py-12 md:flex-row lg:px-8 lg:py-16">
                  {/* Poster */}
                  <motion.div 
                    className="flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="relative aspect-[2/3] w-48 overflow-hidden rounded-xl bg-moviemate-card shadow-2xl md:w-64 lg:w-72 border border-white/10">
                      <img 
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tl from-moviemate-primary/10 to-transparent opacity-60"></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-30" 
                           style={{ clipPath: 'polygon(0 0, 100% 0, 100% 20%, 0 40%)' }}></div>
                    </div>
                  </motion.div>
                  
                  {/* Content Details */}
                  <motion.div 
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h1 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">{title}</h1>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {formattedDate && (
                        <span className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-gray-300 border border-white/5">
                          {formattedDate}
                        </span>
                      )}
                      
                      {formattedRuntime && (
                        <span className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm text-gray-300 border border-white/5">
                          {formattedRuntime}
                        </span>
                      )}
                      
                      <div className="flex items-center gap-1 rounded-full bg-yellow-400 px-4 py-1.5 text-sm font-bold text-black shadow-lg shadow-yellow-400/20">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z"/>
                        </svg>
                        {rating}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {movie.genres?.map((genre) => (
                        <span 
                          key={genre.id}
                          className="rounded-full bg-moviemate-primary/30 border border-moviemate-primary/20 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-moviemate-primary/20"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                    
                    <p className="max-w-3xl text-gray-300 leading-relaxed">{movie.overview}</p>
                    
                    <div className="mt-6 flex flex-wrap gap-4">
                      <motion.button
                        onClick={() => handleShowPlayerChange(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-full bg-gradient-to-r from-moviemate-primary to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-moviemate-primary/30 flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Watch Now
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            {/* Player section directly after header */}
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
            
            {/* Content Details without duplicate player */}
            <motion.div variants={itemVariants}>
              <div className="rounded-xl bg-moviemate-card border border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-4 text-white">About {movie.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <ul className="space-y-3">
                      {movie.release_date && (
                        <li className="flex text-sm">
                          <span className="w-32 opacity-70">Release Date:</span>
                          <span>{formattedDate}</span>
                        </li>
                      )}
                      {movie.runtime && movie.runtime > 0 && (
                        <li className="flex text-sm">
                          <span className="w-32 opacity-70">Runtime:</span>
                          <span>{formattedRuntime}</span>
                        </li>
                      )}
                      {movie.budget && movie.budget > 0 && (
                        <li className="flex text-sm">
                          <span className="w-32 opacity-70">Budget:</span>
                          <span>${movie.budget.toLocaleString()}</span>
                        </li>
                      )}
                      {movie.revenue && movie.revenue > 0 && (
                        <li className="flex text-sm">
                          <span className="w-32 opacity-70">Revenue:</span>
                          <span>${movie.revenue.toLocaleString()}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <ul className="space-y-3">
                      {movie.status && (
                        <li className="flex text-sm">
                          <span className="w-32 opacity-70">Status:</span>
                          <span>{movie.status}</span>
                        </li>
                      )}
                      {movie.original_language && (
                        <li className="flex text-sm">
                          <span className="w-32 opacity-70">Language:</span>
                          <span>{movie.original_language.toUpperCase()}</span>
                        </li>
                      )}
                      {movie.production_companies && movie.production_companies.length > 0 && (
                        <li className="flex text-sm">
                          <span className="w-32 opacity-70">Production:</span>
                          <span>{movie.production_companies.map(company => company.name).join(', ')}</span>
                        </li>
                      )}
                      {movie.vote_count && movie.vote_count > 0 && (
                        <li className="flex text-sm">
                          <span className="w-32 opacity-70">Vote Count:</span>
                          <span>{movie.vote_count.toLocaleString()}</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
            
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
