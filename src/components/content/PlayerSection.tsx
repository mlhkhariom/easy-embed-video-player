
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PlayerHeader from '../player/PlayerHeader';
import PlayerContainer from '../player/PlayerContainer';
import PlayerError from '../player/PlayerError';
import PlayerFooter from '../player/PlayerFooter';

interface PlayerSectionProps {
  showPlayer: boolean;
  isMovie: boolean;
  contentId: number;
  imdbId?: string;
  selectedSeason?: number;
  selectedEpisode?: number;
  title?: string;
  episodeTitle?: string;
}

const PlayerSection = ({
  showPlayer,
  isMovie,
  contentId,
  imdbId,
  selectedSeason,
  selectedEpisode,
  title,
  episodeTitle
}: PlayerSectionProps) => {
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!showPlayer) return;
    
    setIsLoading(true);
    setPlayerError(null);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [showPlayer, contentId, selectedSeason, selectedEpisode]);
  
  if (!showPlayer) return null;
  
  const resetError = () => {
    setPlayerError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };
  
  return (
    <motion.div 
      className="mb-12 animate-scale-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <PlayerHeader 
        isMovie={isMovie}
        selectedSeason={selectedSeason}
        selectedEpisode={selectedEpisode}
        episodeTitle={episodeTitle}
        title={title}
        playerError={playerError}
        resetError={resetError}
      />
      
      {playerError ? (
        <PlayerError 
          playerError={playerError} 
          resetError={resetError} 
        />
      ) : (
        <PlayerContainer 
          isMovie={isMovie}
          contentId={contentId}
          imdbId={imdbId}
          selectedSeason={selectedSeason}
          selectedEpisode={selectedEpisode}
          title={title}
          episodeTitle={episodeTitle}
          isLoading={isLoading}
          playerError={playerError}
          setPlayerError={setPlayerError}
        />
      )}
      
      <PlayerFooter isMovie={isMovie} />
    </motion.div>
  );
};

export default PlayerSection;
