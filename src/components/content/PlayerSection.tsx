
import { useState } from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import VideoPlayer from '../VideoPlayer';

interface PlayerSectionProps {
  showPlayer: boolean;
  isMovie: boolean;
  contentId: number;
  imdbId?: string;
  selectedSeason?: number;
  selectedEpisode?: number;
}

const PlayerSection = ({
  showPlayer,
  isMovie,
  contentId,
  imdbId,
  selectedSeason,
  selectedEpisode
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
    <div className="mb-12 animate-scale-in">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {isMovie ? 'Movie Player' : `Season ${selectedSeason}, Episode ${selectedEpisode}`}
        </h2>
        
        {playerError && (
          <button 
            onClick={resetError}
            className="rounded-full bg-moviemate-primary px-4 py-1 text-xs font-medium text-white hover:bg-opacity-90"
          >
            Try Again
          </button>
        )}
      </div>
      
      {playerError ? (
        <Alert variant="destructive" className="mb-4 bg-red-500/20 border-red-500/50">
          <AlertTitle className="text-white">Player Error</AlertTitle>
          <AlertDescription className="text-gray-300">
            {playerError}. Please try again or check back later.
          </AlertDescription>
        </Alert>
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
    </div>
  );
};

export default PlayerSection;
