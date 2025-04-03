import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTvShowDetails, getTvShowCredits, getImageUrl } from '../services/tmdb';
import { TvShow } from '../types';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Play, Star, Heart, ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const TvShowPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const tvShowId = id ? parseInt(id) : 0;
  
  const { data: tvShow, isLoading: isLoadingTvShow } = useQuery({
    queryKey: ['tvShow', tvShowId],
    queryFn: () => getTvShowDetails(tvShowId),
    enabled: !!tvShowId
  });
  
  const { data: credits } = useQuery({
    queryKey: ['tvCredits', tvShowId],
    queryFn: () => getTvShowCredits(tvShowId),
    enabled: !!tvShowId
  });
  
  const handleSave = useCallback(() => {
    setIsSaved(!isSaved);
    
    toast({
      title: isSaved ? "Removed from watchlist" : "Added to watchlist",
      description: isSaved 
        ? "The TV show has been removed from your watchlist" 
        : "The TV show has been added to your watchlist",
      duration: 3000
    });
  }, [isSaved, toast]);
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const formatTvShowDetails = (tvShow: TvShow | undefined) => {
    if (!tvShow) return { duration: '', year: '', genres: [] };
    
    const duration = tvShow.number_of_seasons 
      ? `${tvShow.number_of_seasons} Season${tvShow.number_of_seasons > 1 ? 's' : ''}`
      : '';
      
    const year = tvShow.first_air_date
      ? new Date(tvShow.first_air_date).getFullYear().toString()
      : '';
      
    return { duration, year, genres: tvShow.genres || [] };
  };
  
  const { duration, year, genres } = formatTvShowDetails(tvShow);
  
  const creator = tvShow?.created_by?.[0]?.name || credits?.crew?.find(member => member.job === 'Executive Producer')?.name || '';
  
  const topCast = credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ') || '';
  
  return (
    <div className="relative min-h-screen bg-[#121218] text-white">
      {isLoadingTvShow ? (
        <div className="flex h-screen items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-blue-500"></div>
        </div>
      ) : tvShow ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="pb-24"
        >
          <div className="relative h-screen max-h-[70vh]">
            <img 
              src={getImageUrl(tvShow.backdrop_path || tvShow.poster_path, 'original')}
              alt={tvShow.name}
              className="h-full w-full object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-[#121218]/60 to-transparent"></div>
            
            <button 
              onClick={handleBack}
              className="absolute top-10 left-4 z-10 rounded-full bg-black/40 p-2 backdrop-blur-sm"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button 
              onClick={handleSave}
              className="absolute top-10 right-4 z-10 rounded-full bg-black/40 p-2 backdrop-blur-sm"
            >
              <Heart className={`h-6 w-6 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center text-sm text-gray-300">
                  {year && (
                    <div className="flex items-center mr-3">
                      <CalendarDays className="mr-1 h-4 w-4" />
                      <span>{year} (USA)</span>
                    </div>
                  )}
                  {duration && (
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>{duration}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  className="mt-4 w-40 rounded-full border-white/30 bg-black/30 backdrop-blur-sm"
                >
                  <Play className="mr-2 h-4 w-4" /> Play Trailer
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between">
              <h1 className="text-3xl font-bold">{tvShow.name}</h1>
              <div className="flex items-center">
                <Star className="mr-1 h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-bold">{tvShow.vote_average?.toFixed(1)}</span>
              </div>
            </div>
            
            {tvShow.tagline && (
              <p className="mt-1 text-gray-400">{tvShow.tagline}</p>
            )}
            
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
            
            {creator && (
              <div className="mt-6">
                <p className="text-gray-300">Creator: <span className="text-white">{creator}</span></p>
              </div>
            )}
            
            {topCast && (
              <div className="mt-2">
                <p className="text-gray-300">Stars: <span className="text-white">{topCast}</span></p>
              </div>
            )}
            
            <div className="mt-8">
              <h2 className="text-2xl font-bold">Introduction</h2>
              <p className="mt-3 text-gray-300 leading-relaxed">
                {tvShow.overview}
              </p>
            </div>
            
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
          <p>TV show not found</p>
        </div>
      )}
    </div>
  );
};

const getGenreColor = (genreName: string): string => {
  const colors: Record<string, string> = {
    'Action & Adventure': '#3366ff',
    'Animation': '#33cc33',
    'Comedy': '#ffcc00',
    'Crime': '#990000',
    'Documentary': '#999999',
    'Drama': '#ff3399',
    'Family': '#9933ff',
    'Kids': '#ff9900',
    'Mystery': '#663399',
    'News': '#0066cc',
    'Reality': '#ff6600',
    'Sci-Fi & Fantasy': '#0099ff',
    'Soap': '#ff99cc',
    'Talk': '#33cccc',
    'War & Politics': '#666633',
    'Western': '#996600'
  };
  
  return colors[genreName] || '#666666';
};

export default TvShowPage;
