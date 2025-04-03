
import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMovieDetails, getMovieCredits, getImageUrl } from '../services/tmdb';
import { Movie, Credits } from '../types';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Play, Star, Heart, ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import CastCarousel from '../components/CastCarousel';
import DirectorCard from '../components/DirectorCard';

const MoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const movieId = id ? parseInt(id) : 0;
  
  // Fetch movie details
  const { data: movie, isLoading: isLoadingMovie } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: !!movieId
  });
  
  // Fetch movie credits
  const { data: credits, isLoading: isLoadingCredits } = useQuery({
    queryKey: ['movieCredits', movieId],
    queryFn: () => getMovieCredits(movieId),
    enabled: !!movieId
  });
  
  const handleSave = useCallback(() => {
    setIsSaved(!isSaved);
    
    toast({
      title: isSaved ? "Removed from watchlist" : "Added to watchlist",
      description: isSaved 
        ? "The movie has been removed from your watchlist" 
        : "The movie has been added to your watchlist",
      duration: 3000
    });
  }, [isSaved, toast]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  // Format movie details
  const formatMovieDetails = (movie: Movie | undefined) => {
    if (!movie) return { runtime: '', year: '', genres: [] };
    
    const runtime = movie.runtime 
      ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min`
      : '';
      
    const year = movie.release_date
      ? new Date(movie.release_date).getFullYear().toString()
      : '';
      
    return { runtime, year, genres: movie.genres || [] };
  };
  
  const { runtime, year, genres } = formatMovieDetails(movie);
  
  // Get director
  const director = credits?.crew?.find(member => member.job === 'Director');
  
  // Loading state
  const isLoading = isLoadingMovie || isLoadingCredits;
  
  return (
    <div className="relative min-h-screen bg-[#121218] text-white">
      {isLoading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-blue-500"></div>
        </div>
      ) : movie ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pb-24"
        >
          {/* Movie Poster with Back Button and Save Button */}
          <div className="relative h-screen max-h-[70vh]">
            <img 
              src={getImageUrl(movie.backdrop_path || movie.poster_path, 'original')}
              alt={movie.title}
              className="h-full w-full object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-[#121218]/60 to-transparent"></div>
            
            {/* Back Button */}
            <button 
              onClick={handleBack}
              className="absolute top-10 left-4 z-10 rounded-full bg-black/40 p-2 backdrop-blur-sm"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            {/* Save Button */}
            <button 
              onClick={handleSave}
              className="absolute top-10 right-4 z-10 rounded-full bg-black/40 p-2 backdrop-blur-sm"
            >
              <Heart className={`h-6 w-6 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            
            {/* Movie Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center text-sm text-gray-300">
                  {year && (
                    <div className="flex items-center mr-3">
                      <CalendarDays className="mr-1 h-4 w-4" />
                      <span>{year} (USA)</span>
                    </div>
                  )}
                  {runtime && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{runtime}</span>
                    </div>
                  )}
                </div>
                
                {/* Play Trailer Button */}
                <Button 
                  variant="outline" 
                  className="mt-4 w-40 rounded-full border-white/30 bg-black/30 backdrop-blur-sm"
                >
                  <Play className="mr-2 h-4 w-4" /> Play Trailer
                </Button>
              </div>
            </div>
          </div>
          
          {/* Movie Details */}
          <div className="p-6">
            <div className="flex justify-between">
              <h1 className="text-3xl font-bold">{movie.title}</h1>
              <div className="flex items-center">
                <Star className="mr-1 h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold">{movie.vote_average?.toFixed(1)}</span>
              </div>
            </div>
            
            {movie.tagline && (
              <p className="mt-1 text-gray-400">{movie.tagline}</p>
            )}
            
            {/* Genres */}
            <div className="mt-4 flex flex-wrap gap-2">
              {genres.map(genre => (
                <span 
                  key={genre.id}
                  className="rounded-full px-4 py-1 text-sm"
                  style={{ 
                    backgroundColor: getGenreColor(genre.name),
                    color: 'white'
                  }}
                >
                  {genre.name}
                </span>
              ))}
            </div>
            
            {/* Overview */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold">Introduction</h2>
              <p className="mt-3 text-gray-300 leading-relaxed">
                {movie.overview}
              </p>
            </div>
            
            {/* Director Card */}
            {director && <DirectorCard director={director} />}
            
            {/* Cast Carousel */}
            {credits?.cast && credits.cast.length > 0 && (
              <CastCarousel cast={credits.cast} title="Top Cast" />
            )}
            
            {/* Action Buttons */}
            <div className="mt-10 flex gap-4">
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600">
                <Play className="mr-2 h-5 w-5" /> Watch Now
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-gray-700"
                onClick={handleSave}
              >
                <Heart className={`mr-2 h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} /> 
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="flex h-screen items-center justify-center">
          <p>Movie not found</p>
        </div>
      )}
    </div>
  );
};

// Helper function to assign colors to genres
const getGenreColor = (genreName: string): string => {
  const colors: Record<string, string> = {
    'Action': '#3366ff',
    'Adventure': '#ff9933',
    'Animation': '#33cc33',
    'Comedy': '#ffcc00',
    'Crime': '#990000',
    'Documentary': '#999999',
    'Drama': '#ff3399',
    'Family': '#9933ff',
    'Fantasy': '#ff00ff',
    'History': '#996633',
    'Horror': '#660000',
    'Music': '#00cccc',
    'Mystery': '#663399',
    'Romance': '#ff6699',
    'Science Fiction': '#0099ff',
    'TV Movie': '#cc6699',
    'Thriller': '#cc0000',
    'War': '#666633',
    'Western': '#996600'
  };
  
  return colors[genreName] || '#666666';
};

export default MoviePage;
