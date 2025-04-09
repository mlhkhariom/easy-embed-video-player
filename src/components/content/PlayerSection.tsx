
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import PlayerHeader from '../player/PlayerHeader';
import PlayerContainer from '../player/PlayerContainer';
import PlayerError from '../player/PlayerError';
import PlayerFooter from '../player/PlayerFooter';
import { useToast } from '@/components/ui/use-toast';

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
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Reset state when content changes or player first shows
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
    setErrorDialogOpen(false);
    
    // Show loading state briefly to give APIs time to initialize
    toast({
      title: "Retrying playback",
      description: "Attempting to reconnect to the streaming source..."
    });
    
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };
  
  const handleError = (errorMessage: string) => {
    setPlayerError(errorMessage);
    // Only show the error dialog for serious errors
    if (errorMessage.includes("failed to load") || errorMessage.includes("network error")) {
      setErrorDialogOpen(true);
    }
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
        setPlayerError={handleError}
      />
      
      <PlayerFooter isMovie={isMovie} />
      
      {/* Error Dialog */}
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent>
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold mb-2">Playback Error</h3>
            <p className="text-muted-foreground mb-4">{playerError}</p>
            <div className="flex justify-center space-x-2">
              <button 
                className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                onClick={resetError}
              >
                Try Again
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PlayerSection;
