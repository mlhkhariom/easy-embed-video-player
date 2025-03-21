
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Film, PlayCircle, AlertTriangle } from "lucide-react";
import VideoPlayer from '../VideoPlayer';

interface PlayerSectionProps {
  showPlayer: boolean;
  isMovie: boolean;
  contentId: number;
  imdbId?: string;
  selectedSeason?: number;
  selectedEpisode?: number;
  title?: string;
}

const PlayerSection = ({
  showPlayer,
  isMovie,
  contentId,
  imdbId,
  selectedSeason,
  selectedEpisode,
  title
}: PlayerSectionProps) => {
  const [playerError, setPlayerError] = useState<string | null>(null);
  
  if (!showPlayer) return null;
  
  // Handle player error
  const handlePlayerError = (error: string) => {
    setPlayerError(error);
  };
  
  const resetError = () => {
    setPlayerError(null);
  };
  
  return (
    <motion.div 
      className="mb-12 animate-scale-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-moviemate-primary">
              <Film size={16} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isMovie ? 'Now Playing' : `Season ${selectedSeason}, Episode ${selectedEpisode}`}
            </h2>
          </div>
          
          {playerError && (
            <motion.button 
              onClick={resetError}
              className="flex items-center gap-1 rounded-full bg-moviemate-primary px-4 py-1 text-xs font-medium text-white hover:bg-opacity-90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayCircle size={14} />
              Try Again
            </motion.button>
          )}
        </div>
        
        <div className="mt-2 flex items-center">
          <div className="h-0.5 w-16 bg-gradient-to-r from-moviemate-primary to-transparent rounded-full"></div>
          <p className="ml-2 text-xs text-gray-400">
            {title && `${title} | `}
            FreeCinema Premium
          </p>
        </div>
      </div>
      
      {playerError ? (
        <motion.div 
          className="relative overflow-hidden rounded-xl border border-red-500/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive" className="bg-red-500/10 border-0">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-white font-medium">Player Error</AlertTitle>
            <AlertDescription className="text-gray-300">
              {playerError}. Please try again or check back later.
            </AlertDescription>
          </Alert>
          
          <div className="absolute -bottom-8 -left-8 h-16 w-64 bg-red-500/10 blur-xl rounded-full"></div>
          <div className="absolute -top-8 -right-8 h-16 w-64 bg-red-500/5 blur-xl rounded-full"></div>
        </motion.div>
      ) : (
        <VideoPlayer
          tmdbId={contentId}
          imdbId={imdbId}
          type={isMovie ? 'movie' : 'tv'}
          season={!isMovie ? selectedSeason : undefined}
          episode={!isMovie ? selectedEpisode : undefined}
          onError={handlePlayerError}
        />
      )}
      
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-400">
        <span className="rounded-full bg-moviemate-card px-3 py-1">HD 1080p</span>
        <span className="rounded-full bg-moviemate-card px-3 py-1">Premium Quality</span>
        <span className="rounded-full bg-moviemate-card px-3 py-1">Ad Free</span>
        {isMovie ? (
          <span className="rounded-full bg-moviemate-card px-3 py-1">Movie</span>
        ) : (
          <span className="rounded-full bg-moviemate-card px-3 py-1">TV Show</span>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerSection;
