
import { motion } from 'framer-motion';
import { Loader } from "lucide-react";

interface PlayerLoadingProps {
  isLoading: boolean;
  title?: string;
  episodeTitle?: string;
  isMovie: boolean;
  selectedEpisode?: number;
}

const PlayerLoading = ({ 
  isLoading, 
  title, 
  episodeTitle, 
  isMovie, 
  selectedEpisode 
}: PlayerLoadingProps) => {
  if (!isLoading) return null;

  return (
    <motion.div 
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-moviemate-primary/20 backdrop-blur-sm">
          <Loader size={30} className="animate-spin text-moviemate-primary" />
        </div>
        <p className="text-lg font-medium text-white">
          Loading {isMovie ? 'Movie' : (
            episodeTitle ? `"${episodeTitle}"` : `Episode ${selectedEpisode}`
          )}...
        </p>
        <p className="mt-1 text-sm text-gray-400">FreeCinema Premium Stream</p>
      </div>
    </motion.div>
  );
};

export default PlayerLoading;
