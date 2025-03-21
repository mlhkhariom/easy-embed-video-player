
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
  tmdbId?: number;
  imdbId?: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  onError?: (message: string) => void;
}

const VideoPlayer = ({ 
  tmdbId, 
  imdbId, 
  type, 
  season, 
  episode,
  onError 
}: VideoPlayerProps) => {
  const [playerUrl, setPlayerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Reset states when props change
    setIsLoading(true);
    setLoadError(false);
    
    try {
      // Construct the player URL based on available IDs
      if (tmdbId) {
        if (type === 'movie') {
          setPlayerUrl(`https://vidsrc.dev/embed/movie/${tmdbId}`);
        } else if (type === 'tv' && season && episode) {
          setPlayerUrl(`https://vidsrc.dev/embed/tv/${tmdbId}/${season}/${episode}`);
        }
      } else if (imdbId) {
        if (type === 'movie') {
          setPlayerUrl(`https://vidsrc.dev/embed/movie/${imdbId}`);
        } else if (type === 'tv' && season && episode) {
          setPlayerUrl(`https://vidsrc.dev/embed/tv/${imdbId}/${season}/${episode}`);
        }
      } else {
        // No valid ID available
        throw new Error('No valid content ID available');
      }
    } catch (error) {
      console.error('Error setting up player:', error);
      setLoadError(true);
      if (onError) {
        onError('Failed to load video player');
      }
    }
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [tmdbId, imdbId, type, season, episode, onError]);

  const handleIframeError = () => {
    setLoadError(true);
    if (onError) {
      onError('Failed to load video content');
    }
  };

  return (
    <motion.div 
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-moviemate-card shadow-xl"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      onHoverStart={() => setShowControls(true)}
      onHoverEnd={() => setShowControls(false)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-moviemate-card">
          <div className="flex flex-col items-center gap-4">
            <motion.div 
              className="h-12 w-12 rounded-full border-4 border-moviemate-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm text-gray-300">Loading player...</p>
          </div>
        </div>
      )}
      
      {playerUrl && !loadError && (
        <div className="relative h-full w-full">
          <motion.div 
            className="h-full w-full transform-gpu"
            initial={{ rotateX: 0, rotateY: 0 }}
            whileHover={{ 
              rotateX: [-1, 1, -1], 
              rotateY: [-1, 1, -1],
              transition: { 
                rotateX: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                rotateY: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }
              }
            }}
            style={{ perspective: 1000 }}
          >
            <iframe
              src={playerUrl}
              className="h-full w-full border-0"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              loading="lazy"
              onLoad={() => setIsLoading(false)}
              onError={handleIframeError}
            ></iframe>
          </motion.div>
          
          {showControls && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="rounded-full bg-white/10 p-8 backdrop-blur-sm"
                whileHover={{ scale: 1.1 }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-white"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </motion.div>
            </motion.div>
          )}
        </div>
      )}
      
      {loadError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-moviemate-card">
          <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-red-500"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 className="text-lg font-medium text-white">Unable to load video content</h3>
            <p className="text-sm text-gray-300">
              There was a problem loading the video. This could be due to network issues or the content may not be available.
            </p>
          </div>
        </div>
      )}
      
      {/* 3D effect - bottom reflection */}
      <div className="absolute -bottom-12 left-0 right-0 h-12 bg-gradient-to-t from-transparent to-moviemate-primary/10 blur-md"></div>
    </motion.div>
  );
};

export default VideoPlayer;
